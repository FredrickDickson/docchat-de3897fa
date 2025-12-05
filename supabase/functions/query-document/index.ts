import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { documentId, question, userId } = await req.json();

    if (!documentId || !question || !userId) {
      throw new Error('documentId, question, and userId are required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get all chunks for the document
    const { data: chunks, error: chunksError } = await supabase
      .from('pdf_chunks')
      .select('chunk_text')
      .eq('pdf_id', documentId)
      .eq('user_id', userId)
      .order('page_number');

    if (chunksError || !chunks || chunks.length === 0) {
      throw new Error('No chunks found for this document');
    }

    // Build context from chunks (limit to prevent token overflow)
    const maxChunks = 10;
    const context = chunks
      .slice(0, maxChunks)
      .map(c => c.chunk_text)
      .join('\n\n');

    // Query DeepSeek with context
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Answer questions based on the provided document context. If the answer is not in the context, say so.'
          },
          {
            role: 'user',
            content: `Context from document:\n\n${context}\n\nQuestion: ${question}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    // Deduct 1 credit for AI chat
    const { error: creditError } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_cost: 1
    });

    if (creditError) {
      console.warn('Credit deduction failed:', creditError);
      // Don't fail the request, just log the error
    }

    // Store chat message
    await supabase.from('chat_messages').insert({
      user_id: userId,
      pdf_id: documentId,
      sender: 'user',
      message: question
    });

    await supabase.from('chat_messages').insert({
      user_id: userId,
      pdf_id: documentId,
      sender: 'ai',
      message: answer
    });

    // Track analytics
    await supabase.from('user_analytics').insert({
      user_id: userId,
      event_type: 'chat',
      credits_used: 1,
      metadata: { document_id: documentId, question_length: question.length }
    });

    return new Response(
      JSON.stringify({ 
        answer,
        creditsUsed: 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error querying document:', error);
    
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: (error as Error).message === 'INSUFFICIENT_CREDITS' ? 402 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
