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
      throw new Error('Missing required fields: userId, pdfId, and question are required.');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not set in Supabase function environment.');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Try to get document content from files table (PDF Summarizer uploads)
    let documentText = '';
    
    // First try the files table
    const { data: fileData } = await supabase
      .from('files')
      .select('extracted_text')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fileData?.extracted_text) {
      documentText = fileData.extracted_text;
    }

    // If no text found, try to get from pdf_chunks
    if (!documentText) {
      const { data: chunks } = await supabase
        .from('pdf_chunks')
        .select('chunk_text')
        .eq('user_id', userId)
        .eq('pdf_id', pdfId)
        .limit(10);

      if (chunks && chunks.length > 0) {
        documentText = chunks.map(c => c.chunk_text).join('\n\n');
      }
    }

    // Build the system prompt based on domain
    let systemPrompt = `You are a helpful AI assistant that answers questions about documents.`;
    
    if (domain === 'legal') {
      systemPrompt += ` Focus on legal implications, obligations, risks, and compliance aspects.`;
    } else if (domain === 'finance') {
      systemPrompt += ` Focus on financial metrics, analysis, and business implications.`;
    } else if (domain === 'academic') {
      systemPrompt += ` Focus on academic rigor, methodology, and scholarly analysis.`;
    }

    systemPrompt += ` If the document context is provided, use it to answer questions. If no relevant information is found, say "I don't have enough information from the document to answer that question."`;

    // Build user message with context
    let userMessage = question;
    if (documentText) {
      // Truncate to avoid token limits (roughly 100k chars for safety)
      const truncatedText = documentText.slice(0, 100000);
      userMessage = `Document content:\n---\n${truncatedText}\n---\n\nQuestion: ${question}`;
    }

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to continue.');
      }
      throw new Error(`AI service error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const answer = aiResponse.choices?.[0]?.message?.content || "I couldn't generate a response.";

    // Save chat messages to database
    await supabase.from('chat_messages').insert([
      { user_id: userId, pdf_id: pdfId, sender: 'user', message: question },
      { user_id: userId, pdf_id: pdfId, sender: 'ai', message: answer }
    ]);

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
