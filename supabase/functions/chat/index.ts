import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, pdfId, question, domain = 'general' } = await req.json();

    if (!userId || !pdfId || !question) {
      throw new Error('Missing required fields');
    }

    // 1. Generate embedding for the question using DeepSeek
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekKey) throw new Error('DEEPSEEK_API_KEY not set');
    
    const embedding = await getEmbedding(question, deepseekKey);

    // 2. Search for relevant chunks
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: chunks, error: searchError } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: 0.5, // Adjust as needed
      match_count: 5,
      filter_user_id: userId
    });

    if (searchError) throw searchError;

    const context = chunks.map((c: any) => c.chunk_text).join('\n\n');

    // 3. Call DeepSeek API for chat
    const systemPrompt = `You are a precise assistant. Use ONLY the context below to answer. Domain: ${domain}. If domain is legal, highlight obligations/risks. If the answer is not in the context, say "I don't know based on the provided document."`;
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` }
    ];

    const answer = await callDeepSeek(messages, deepseekKey);

    // 4. Save chat messages
    await supabase.from('chat_messages').insert([
      { user_id: userId, pdf_id: pdfId, sender: 'user', message: question },
      { user_id: userId, pdf_id: pdfId, sender: 'ai', message: answer }
    ]);

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getEmbedding(text: string, apiKey: string) {
  const response = await fetch('https://api.deepseek.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'deepseek-chat',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function callDeepSeek(messages: any[], apiKey: string) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.2,
      max_tokens: 800
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
