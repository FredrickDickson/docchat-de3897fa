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
    const { text, pdfId, userId } = await req.json();

    if (!text || !pdfId || !userId) {
      throw new Error('Missing required fields: text, pdfId, userId');
    }

    // Chunk text
    const chunks = chunkText(text);

    // Generate embeddings using DeepSeek
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekKey) {
      throw new Error('DEEPSEEK_API_KEY not set');
    }

    const embeddings = await Promise.all(
      chunks.map(async (chunk, index) => {
        const embedding = await getEmbedding(chunk, deepseekKey);
        return {
          user_id: userId,
          pdf_id: pdfId,
          page_number: 1, // Simplified for now, assuming single page or handled upstream
          chunk_text: chunk,
          embedding,
        };
      })
    );

    // Store in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabase.from('pdf_chunks').insert(embeddings);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, chunksProcessed: chunks.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing PDF:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function chunkText(text: string, chunkSize = 1500, overlap = 200) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const start = Math.max(0, i - overlap);
    const end = Math.min(text.length, i + chunkSize);
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    i += chunkSize - overlap;
  }
  return chunks;
}

async function getEmbedding(text: string, apiKey: string) {
  const response = await fetch('https://api.deepseek.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'deepseek-chat', // DeepSeek uses the same model for embeddings
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}
