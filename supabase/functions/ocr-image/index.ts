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
    const { imageData, userId, fileName } = await req.json();

    if (!imageData || !userId) {
      throw new Error('imageData and userId are required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Deduct 2 credits for OCR
    const { error: creditError } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_cost: 2
    });

    if (creditError) {
      if (creditError.message === 'INSUFFICIENT_CREDITS') {
        return new Response(
          JSON.stringify({ error: 'INSUFFICIENT_CREDITS', required: 2 }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw creditError;
    }

    // Use Google Cloud Vision API for OCR
    const visionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    
    if (!visionApiKey) {
      // Fallback: Return a message that OCR is not configured
      // In production, you would use Tesseract.js or another OCR service
      console.warn('GOOGLE_VISION_API_KEY not configured, using placeholder');
      
      // Track analytics
      await supabase.from('user_analytics').insert({
        user_id: userId,
        event_type: 'ocr',
        credits_used: 2,
        metadata: { file_name: fileName || 'unknown', success: false }
      });

      return new Response(
        JSON.stringify({ 
          text: 'OCR service not configured. Please add GOOGLE_VISION_API_KEY to enable OCR.',
          creditsUsed: 2,
          warning: 'OCR_NOT_CONFIGURED'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Google Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: imageData.split(',')[1] }, // Remove data:image/... prefix
            features: [{ type: 'TEXT_DETECTION' }]
          }]
        })
      }
    );

    if (!visionResponse.ok) {
      throw new Error(`Vision API error: ${visionResponse.statusText}`);
    }

    const visionData = await visionResponse.json();
    const extractedText = visionData.responses[0]?.fullTextAnnotation?.text || '';

    if (!extractedText) {
      throw new Error('No text found in image');
    }

    // Track analytics
    await supabase.from('user_analytics').insert({
      user_id: userId,
      event_type: 'ocr',
      credits_used: 2,
      metadata: { 
        file_name: fileName || 'unknown',
        text_length: extractedText.length,
        success: true 
      }
    });

    return new Response(
      JSON.stringify({ 
        text: extractedText,
        creditsUsed: 2,
        characterCount: extractedText.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error performing OCR:', error);
    
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
