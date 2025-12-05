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
    const { documentId, userId, summaryType = 'standard' } = await req.json();

    if (!documentId || !userId) {
      throw new Error('documentId and userId are required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Determine credit cost based on summary type
    const creditCosts = {
      'brief': 5,
      'standard': 10,
      'detailed': 25
    };
    const creditCost = creditCosts[summaryType as keyof typeof creditCosts] || 10;

    // Check and deduct credits FIRST
    const { data: creditData, error: creditError } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_cost: creditCost
    });

    if (creditError) {
      if (creditError.message === 'INSUFFICIENT_CREDITS') {
        return new Response(
          JSON.stringify({ error: 'INSUFFICIENT_CREDITS', required: creditCost }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw creditError;
    }

    // Get document info
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('name')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      throw new Error('Document not found');
    }

    // Get all chunks for the document
    const { data: chunks, error: chunksError } = await supabase
      .from('pdf_chunks')
      .select('chunk_text')
      .eq('pdf_id', documentId)
      .eq('user_id', userId)
      .order('page_number');

    if (chunksError || !chunks || chunks.length === 0) {
      throw new Error('No content found for this document');
    }

    // Combine chunks into full text
    const fullText = chunks.map(c => c.chunk_text).join('\n\n');

    // Prepare prompt based on summary type
    const prompts = {
      'brief': 'Provide a brief 2-3 sentence summary of the main points.',
      'standard': 'Provide a comprehensive summary covering the main topics, key points, and conclusions.',
      'detailed': 'Provide a detailed summary including main topics, key arguments, supporting evidence, methodology (if applicable), and conclusions. Include important details and nuances.'
    };

    const prompt = prompts[summaryType as keyof typeof prompts] || prompts.standard;

    // Generate summary using DeepSeek
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
            content: 'You are an expert at summarizing documents. Provide clear, accurate summaries.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nDocument content:\n\n${fullText}`
          }
        ],
        temperature: 0.5,
        max_tokens: summaryType === 'detailed' ? 2000 : summaryType === 'brief' ? 500 : 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const summaryText = data.choices[0].message.content;

    // Store summary in database
    const { data: summary, error: summaryError } = await supabase
      .from('summaries')
      .insert({
        user_id: userId,
        document_id: documentId,
        summary_text: summaryText,
        summary_type: summaryType,
        credits_used: creditCost,
        model_used: 'deepseek-chat'
      })
      .select()
      .single();

    if (summaryError) {
      console.error('Error storing summary:', summaryError);
      // Don't fail the request, summary was generated successfully
    }

    // Track analytics
    await supabase.from('user_analytics').insert({
      user_id: userId,
      event_type: 'summary',
      credits_used: creditCost,
      metadata: { 
        document_id: documentId, 
        summary_type: summaryType,
        chunks_count: chunks.length 
      }
    });

    return new Response(
      JSON.stringify({ 
        summary: summaryText,
        creditsUsed: creditCost,
        summaryType,
        documentName: doc.name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error generating summary:', error);
    
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
