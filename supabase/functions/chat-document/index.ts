import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Plan limits for AI chat messages
const PLAN_LIMITS = {
  anonymous: { daily: 3 },
  free: { daily: 5 },
  basic: { monthly: 500 },
  pro: { monthly: null }, // Unlimited (uses credits)
  elite: { monthly: null }, // Unlimited (uses credits)
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { documentContent, question, conversationHistory, anonymousId } = await req.json();

    if (!documentContent || !question) {
      throw new Error('documentContent and question are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Check for authenticated user
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    let userPlan = 'free';

    if (authHeader) {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        userId = user.id;
        
        // Get user's plan and credits
        const adminClient = createClient(supabaseUrl, supabaseServiceKey);
        const { data: userData } = await adminClient
          .from('users')
          .select('plan, monthly_credits, extra_credits')
          .eq('id', userId)
          .single();
        
        if (userData) {
          userPlan = userData.plan || 'free';
        }
      }
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    // Rate limit check based on user type
    if (userId) {
      // Authenticated user
      if (userPlan === 'free') {
        // Check daily limit for free users
        const { count } = await adminClient
          .from('user_analytics')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('event_type', 'chat_message')
          .gte('created_at', today);

        if (count !== null && count >= PLAN_LIMITS.free.daily) {
          return new Response(
            JSON.stringify({ 
              error: 'DAILY_LIMIT_REACHED',
              message: `You've reached your daily limit of ${PLAN_LIMITS.free.daily} free chats. Upgrade for more!`,
              limit: PLAN_LIMITS.free.daily,
              used: count
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } else if (userPlan === 'basic') {
        // Check monthly limit for basic users
        const { count } = await adminClient
          .from('user_analytics')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('event_type', 'chat_message')
          .gte('created_at', monthStart);

        if (count !== null && count >= PLAN_LIMITS.basic.monthly!) {
          return new Response(
            JSON.stringify({ 
              error: 'MONTHLY_LIMIT_REACHED',
              message: `You've reached your monthly limit of ${PLAN_LIMITS.basic.monthly} chat messages. Upgrade for more!`,
              limit: PLAN_LIMITS.basic.monthly,
              used: count
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
      // Pro and Elite users: deduct credits
      else if (userPlan === 'pro' || userPlan === 'elite') {
        try {
          await adminClient.rpc('deduct_credits', { p_user_id: userId, p_cost: 1 });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('INSUFFICIENT_CREDITS')) {
            return new Response(
              JSON.stringify({ 
                error: 'INSUFFICIENT_CREDITS',
                message: 'You have run out of credits. Please purchase more to continue.'
              }),
              { 
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }
          throw error;
        }
      }
    } else if (anonymousId) {
      // Anonymous user - check daily limit using analytics with anonymous tracking
      const { count } = await adminClient
        .from('user_analytics')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'anonymous_chat')
        .eq('metadata->>anonymous_id', anonymousId)
        .gte('created_at', today);

      if (count !== null && count >= PLAN_LIMITS.anonymous.daily) {
        return new Response(
          JSON.stringify({ 
            error: 'DAILY_LIMIT_REACHED',
            message: `You've used your ${PLAN_LIMITS.anonymous.daily} free chats today. Sign up for more!`,
            limit: PLAN_LIMITS.anonymous.daily,
            used: count
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    // Truncate document content if too long (keep ~12000 chars for context)
    const maxLength = 12000;
    let context = documentContent;
    if (context.length > maxLength) {
      context = context.substring(0, maxLength) + '\n\n[... Document truncated for processing ...]';
    }

    // Build messages array with conversation history
    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: `You are a helpful document analysis assistant. You help users understand and extract information from their documents.

DOCUMENT CONTENT:
${context}

INSTRUCTIONS:
- Answer questions based ONLY on the document content provided above
- If the answer is not in the document, clearly state that
- Be concise but comprehensive
- Use bullet points and formatting when appropriate
- For summaries, focus on key points and main takeaways
- Maintain a helpful and professional tone`
      }
    ];

    // Add conversation history if provided (for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-6); // Keep last 6 messages for context
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      }
    }

    // Add current question
    messages.push({
      role: 'user',
      content: question
    });

    console.log('Calling DeepSeek API for document chat...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`AI service error: ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error('No response from AI');
    }

    // Log the chat message for rate limiting tracking
    if (userId) {
      await adminClient.from('user_analytics').insert({
        user_id: userId,
        event_type: 'chat_message',
        credits_used: (userPlan === 'pro' || userPlan === 'elite') ? 1 : 0,
        metadata: { source: 'document_chat' }
      });
    } else if (anonymousId) {
      await adminClient.from('user_analytics').insert({
        user_id: null,
        event_type: 'anonymous_chat',
        credits_used: 0,
        metadata: { anonymous_id: anonymousId, source: 'document_chat' }
      });
    }

    console.log('DeepSeek response received successfully');

    return new Response(
      JSON.stringify({ 
        answer,
        tokensUsed: data.usage?.total_tokens || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in chat-document:', error);
    
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
