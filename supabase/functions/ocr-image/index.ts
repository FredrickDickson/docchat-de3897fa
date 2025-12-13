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
    const { imageData, userId, fileName, anonId } = await req.json();

    if (!imageData) {
      throw new Error('imageData is required');
    }
    
    if (!userId && !anonId) {
        throw new Error('userId or anonId is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Rate Limiting Logic
    if (userId) {
        // Check if user is paid or free
        const { data: userData } = await supabase
            .from('users')
            .select('plan')
            .eq('id', userId)
            .single();
        
        const plan = userData?.plan || 'free';
        
        if (plan === 'free') {
            const DAILY_LIMIT = 5;
            const today = new Date().toISOString().split('T')[0];
            
            const { data: usage } = await supabase
                .from('user_usage')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            let currentCount = 0;
            
            if (usage && usage.last_reset === today) {
                currentCount = usage.ocr_count;
            } else {
                // Reset or create
                await supabase.from('user_usage').upsert({
                    user_id: userId,
                    ocr_count: 0,
                    last_reset: today
                });
            }
            
            if (currentCount >= DAILY_LIMIT) {
                 return new Response(
                    JSON.stringify({ error: 'Daily free OCR limit reached. Upgrade to continue.', status: 429 }),
                    { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                  );
            }
            
            // Increment usage
            await supabase.from('user_usage').upsert({
                user_id: userId,
                ocr_count: currentCount + 1,
                last_reset: today
            });
            
        } else {
            // Paid user - Deduct credits
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
        }
    } else if (anonId) {
        // Anonymous User
        const DAILY_LIMIT = 3;
        const today = new Date().toISOString().split('T')[0];
        
        const { data: usage } = await supabase
            .from('anonymous_usage')
            .select('*')
            .eq('anon_id', anonId)
            .single();
            
        let currentCount = 0;
        
        if (usage && usage.last_reset === today) {
            currentCount = usage.ocr_count;
        } else {
             await supabase.from('anonymous_usage').upsert({
                anon_id: anonId,
                ocr_count: 0,
                last_reset: today
            });
        }
        
        if (currentCount >= DAILY_LIMIT) {
             return new Response(
                JSON.stringify({ error: 'Daily free OCR limit reached. Please sign up to continue.', status: 429 }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
        }
        
        // Increment usage
        await supabase.from('anonymous_usage').upsert({
            anon_id: anonId,
            ocr_count: currentCount + 1,
            last_reset: today
        });
    }

    // Use Google Cloud Vision API for OCR
    const visionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    
    if (!visionApiKey) {
      // Fallback: Return a message that OCR is not configured
      console.warn('GOOGLE_VISION_API_KEY not configured, using placeholder');
      
      // Track analytics only for registered users
      if (userId) {
          await supabase.from('user_analytics').insert({
            user_id: userId,
            event_type: 'ocr',
            credits_used: 2,
            metadata: { file_name: fileName || 'unknown', success: false }
          });
      }

      return new Response(
        JSON.stringify({ 
          text: 'OCR service not configured. Please add GOOGLE_VISION_API_KEY to enable OCR.',
          creditsUsed: userId ? 2 : 0,
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

    // Track analytics only for registered users
    if (userId) {
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
    }

    return new Response(
      JSON.stringify({ 
        text: extractedText,
        creditsUsed: userId ? 2 : 0,
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
