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
    const { documentId, question, userId, anonId } = await req.json();

    if (!documentId || !question) {
      throw new Error('documentId and question are required');
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
                currentCount = usage.chat_count;
            } else {
                // Reset or create
                await supabase.from('user_usage').upsert({
                    user_id: userId,
                    chat_count: 0,
                    last_reset: today
                });
            }
            
            if (currentCount >= DAILY_LIMIT) {
                 return new Response(
                    JSON.stringify({ error: 'Daily free chats used. Upgrade to continue.', status: 429 }),
                    { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                  );
            }
            
            // Increment usage
            await supabase.from('user_usage').upsert({
                user_id: userId,
                chat_count: currentCount + 1,
                last_reset: today
            });
            
        } else {
            // Paid user - Deduct credits
             console.log('Checking and deducting credits...');
            const { error: creditError } = await supabase.rpc('deduct_credits', {
              p_user_id: userId,
              p_cost: 1
            });
        
            if (creditError) {
              console.log('Credit error:', creditError);
              if (creditError.message === 'INSUFFICIENT_CREDITS' || creditError.message?.includes('insufficient')) {
                return new Response(
                  JSON.stringify({ error: 'INSUFFICIENT_CREDITS', required: 1 }),
                  { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              }
              throw creditError;
            }
            console.log('Credits deducted successfully');
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
            currentCount = usage.chat_count;
        } else {
             await supabase.from('anonymous_usage').upsert({
                anon_id: anonId,
                chat_count: 0,
                last_reset: today
            });
        }
        
        if (currentCount >= DAILY_LIMIT) {
             return new Response(
                JSON.stringify({ error: 'Daily free chats exhausted. Please sign up to continue.', status: 429 }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
        }
        
        // Increment usage
        await supabase.from('anonymous_usage').upsert({
            anon_id: anonId,
            chat_count: currentCount + 1,
            last_reset: today
        });
    }

    // Get all chunks for the document
    const { data: chunks, error: chunksError } = await supabase
      .from('pdf_chunks')
      .select('chunk_text')
      .eq('pdf_id', documentId)
      .order('page_number');

    if (chunksError || !chunks || chunks.length === 0) {
      throw new Error('No chunks found for this document');
    }

    // Build context from chunks (limit to prevent token overflow)
    const maxChunks = 10;
    const context = chunks
      .slice(0, maxChunks)
      .map((c: { chunk_text: string }) => c.chunk_text)
      .join('\n\n');

    // Query DeepSeek with context
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    console.log('Calling DeepSeek API...');
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
    console.log('DeepSeek response received');

    // Store messages and analytics ONLY for registered users
    if (userId) {
        // Store user message
        await supabase.from('chat_messages').insert({
          user_id: userId,
          pdf_id: documentId,
          sender: 'user',
          message: question
        });

        // Store AI message
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
    }

    return new Response(
      JSON.stringify({ 
        answer,
        creditsUsed: userId ? 1 : 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error querying document:', error);
    
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
