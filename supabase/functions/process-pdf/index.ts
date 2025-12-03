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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Chunk text for storage (useful for larger documents)
    const chunks = chunkText(text);
    
    console.log(`Processing PDF ${pdfId} with ${chunks.length} chunks`);

    // Store chunks without embeddings (simpler approach)
    const chunkRecords = chunks.map((chunk, index) => ({
      user_id: userId,
      pdf_id: pdfId,
      page_number: index + 1,
      chunk_text: chunk,
    }));

    // Insert chunks in batches
    const batchSize = 50;
    for (let i = 0; i < chunkRecords.length; i += batchSize) {
      const batch = chunkRecords.slice(i, i + batchSize);
      const { error } = await supabase.from('pdf_chunks').insert(batch);
      if (error) {
        console.error('Error inserting chunks:', error);
        throw error;
      }
    }

    console.log(`Successfully processed ${chunks.length} chunks for PDF ${pdfId}`);

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

function chunkText(text: string, chunkSize = 2000, overlap = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  
  while (i < text.length) {
    const start = Math.max(0, i - overlap);
    const end = Math.min(text.length, i + chunkSize);
    const chunk = text.slice(start, end).trim();
    
    if (chunk) {
      chunks.push(chunk);
    }
    
    i += chunkSize - overlap;
  }
  
  return chunks;
}
