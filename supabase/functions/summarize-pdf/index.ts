
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Debug logging
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(`${new Date().toISOString()}: ${msg}`);
  };

  try {
    const { documentId, userId, summaryType = 'standard' } = await req.json();

    if (!documentId || !userId) {
      throw new Error('documentId and userId are required');
    }

    log(`Function running (std/server) with documentId=${documentId}, userId=${userId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine credit cost based on summary type
    const creditCosts = {
      'brief': 5,
      'standard': 10,
      'detailed': 25
    };
    const creditCost = creditCosts[summaryType as keyof typeof creditCosts] || 10;

    // Check and deduct credits FIRST
    log('Calling deduct_credits RPC...');
    const { data: creditData, error: creditError } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_cost: creditCost
    });

    if (creditError) {
      log(`Credit error: ${JSON.stringify(creditError)}`);
      // Return 200 with error property for client handling
      if (creditError.message === 'INSUFFICIENT_CREDITS' || creditError.message?.includes('insufficient')) {
        return new Response(
          JSON.stringify({ error: 'INSUFFICIENT_CREDITS', required: creditCost, logs }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw creditError;
    }
    log('Credits deducted successfully');

    // Get document info (optional - may not exist if PDF was just uploaded)
    log('Fetching document info...');
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('name')
      .eq('id', documentId)
      .single();

    // Use document name if found, otherwise use documentId as fallback
    const documentName = doc?.name || `Document ${documentId.substring(0, 8)}`;
    log(`Document info: Found=${!!doc}, Name=${documentName}`);

    // Get all chunks for the document
    log('Fetching chunks...');
    const { data: chunks, error: chunksError } = await supabase
      .from('pdf_chunks')
      .select('chunk_text')
      .eq('pdf_id', documentId)
      .eq('user_id', userId)
      .order('page_number');

    if (chunksError) {
      log(`Chunks error: ${JSON.stringify(chunksError)}`);
      throw chunksError;
    }

    if (!chunks || chunks.length === 0) {
      throw new Error('No content found for this document.');
    }
    log(`Found ${chunks.length} chunks`);

    // Combine chunks into full text - check size limits?
    const fullText = chunks.map(c => c.chunk_text).join('\n\n');
    log(`Full text length: ${fullText.length} chars`);

    // Prepare prompt
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

    log('Calling DeepSeek API...');

    // Use a try/catch specifically for the fetch to catch network errors
    let response;
    try {
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
    } catch (fetchError: any) {
      throw new Error(`DeepSeek Fetch Error: ${fetchError.message}`);
    }

    if (!response.ok) {
      log(`DeepSeek API failed: ${response.status}`);
      const text = await response.text();
      log(`DeepSeek Body: ${text}`);
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const summaryText = data.choices?.[0]?.message?.content;

    if (!summaryText) {
      throw new Error('DeepSeek returned no summary text');
    }

    log('DeepSeek success');

    // Store summary in database
    const summaryInsertData = {
      user_id: userId,
      document_id: doc ? documentId : null,
      pdf_name: documentName,
      summary_text: summaryText,
      summary_type: summaryType,
      credits_used: creditCost,
      model_used: 'deepseek-chat'
    };

    log('Inserting summary to DB...');
    const { error: summaryError } = await supabase
      .from('summaries')
      .insert(summaryInsertData);

    if (summaryError) {
      log(`Summary insert error: ${JSON.stringify(summaryError)}`);
      // Don't fail the request
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
        documentName,
        logs // Return logs
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating summary:', error);
    const msg = error.message || String(error);
    log(`Caught error: ${msg}`);

    // Return 200 even for errors to allow client to read the logs and message
    return new Response(
      JSON.stringify({ error: msg, logs: logs }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
