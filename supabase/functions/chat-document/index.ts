import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { documentContent, question, conversationHistory } = await req.json();

    if (!documentContent || !question) {
      throw new Error('documentContent and question are required');
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    // Truncate document content if too long (keep ~12000 chars for context)
    const maxLength = 12000;
    let context = documentContent;
    if (context.length > maxLength) {
      context = context.substring(0, maxLength) + '\n\n[... Document truncated for processing ...]';
    }

    // Build messages array with conversation history
    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: `You are a helpful document analysis assistant. You help users understand and extract information from their documents.

DOCUMENT CONTENT:
${context}

INSTRUCTIONS:
- Answer questions based ONLY on the document content provided above
- If the answer is not in the document, clearly state that
- Be concise but comprehensive
- Use bullet points and formatting when appropriate
- For summaries, focus on key points and main takeaways
- Maintain a helpful and professional tone`
      }
    ];

    // Add conversation history if provided (for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-6); // Keep last 6 messages for context
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      }
    }

    // Add current question
    messages.push({
      role: 'user',
      content: question
    });

    console.log('Calling DeepSeek API for document chat...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`AI service error: ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error('No response from AI');
    }

    console.log('DeepSeek response received successfully');

    return new Response(
      JSON.stringify({ 
        answer,
        tokensUsed: data.usage?.total_tokens || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in chat-document:', error);
    
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

