
/**
 * Supabase Edge Function: paystack-initialize
 * Initialize a Paystack payment transaction
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(`${new Date().toISOString()}: ${msg}`);
  };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');

    // Check environment variables
    if (!paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY not configured in edge function secrets');
    }
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL not configured in edge function secrets');
    }
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured in edge function secrets');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header - user must be authenticated');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized: ' + (userError?.message || 'User not found'));
    }

    // Parse request body
    const body = await req.json();
    log(`Request body: ${JSON.stringify(body)}`);
    const { email, amount, plan, interval, reference, credits } = body;

    // Validate inputs
    if (!email || !amount || !reference) {
      const missing = [];
      if (!email) missing.push('email');
      if (!amount) missing.push('amount');
      if (!reference) missing.push('reference');
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Determine if this is a subscription or credit purchase
    const isSubscription = plan && interval;
    const isCreditPurchase = credits && credits > 0;

    if (!isSubscription && !isCreditPurchase) {
      throw new Error('Must specify either (plan + interval) for subscription or credits for purchase');
    }

    // Build metadata
    const metadata: any = {
      user_id: user.id,
    };

    if (isSubscription) {
      metadata.plan = plan;
      metadata.interval = interval;
    }

    if (isCreditPurchase) {
      metadata.credits = credits;
    }

    // Helper to get or create plan
    async function getOrCreatePlan(name: string, amount: number, interval: string) {
      // 1. Check secrets first (optimization)
      const secretName = `PAYSTACK_PLAN_${name.toUpperCase()}`;
      const secretCode = Deno.env.get(secretName);
      if (secretCode) {
        log(`Using configured secret for ${name}: ${secretCode}`);
        return secretCode;
      }

      // 2. List existing plans
      log(`Searching for plan: ${name} (${amount} GHS)`);
      const listRes = await fetch('https://api.paystack.co/plan', {
        headers: { 'Authorization': `Bearer ${paystackSecretKey}` }
      });
      const listData = await listRes.json();

      if (listData.status && listData.data) {
        const match = listData.data.find((p: any) =>
          p.name.toLowerCase() === name.toLowerCase() &&
          p.amount === amount &&
          p.currency === 'GHS' &&
          p.interval === interval
        );
        if (match) {
          log(`Found existing plan: ${match.plan_code}`);
          return match.plan_code;
        }
      }

      // 3. Create new plan
      log(`Creating new plan: ${name}`);
      const createRes = await fetch('https://api.paystack.co/plan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
          amount: amount,
          interval: interval,
          currency: 'GHS'
        })
      });
      const createData = await createRes.json();
      if (!createData.status) {
        throw new Error(`Failed to create plan ${name}: ${createData.message}`);
      }
      log(`Created new plan: ${createData.data.plan_code}`);
      return createData.data.plan_code;
    }

    let paystackPlanCode = undefined;
    if (isSubscription && plan) {
      paystackPlanCode = await getOrCreatePlan(plan, amount, interval);
    }

    log('Initializing Paystack transaction...');

    // Initialize Paystack transaction
    const payload: any = {
      email,
      amount,
      currency: 'GHS', // Explicitly set to GHS as requested
      reference,
      callback_url: `${req.headers.get('origin')}/payment/verify`,
      metadata,
    };

    if (paystackPlanCode) {
      payload.plan = paystackPlanCode;
    }

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      const errorMsg = paystackData.message || paystackData.error?.message || 'Paystack initialization failed';
      console.error('Paystack API error:', paystackData);
      log(`Paystack API Error: ${JSON.stringify(paystackData)}`);
      throw new Error(`Paystack error: ${errorMsg}`);
    }

    log(`Paystack success. Currency used: ${paystackData.data?.currency || 'GHS'}`);

    // Store transaction in database
    const { error: dbError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        reference,
        amount: amount / 100, // Stored as major unit
        currency: 'GHS', // Record as GHS
        status: 'pending',
        plan, // Store the internal plan name (e.g. 'basic') for record
        interval,
        paystack_data: paystackData.data,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      log(`DB Error: ${JSON.stringify(dbError)}`);
      throw new Error('Failed to store transaction: ' + dbError.message);
    }

    return new Response(
      JSON.stringify(paystackData),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    const msg = error.message || String(error);
    log(`Functions Error: ${msg}`);

    // Return 200 with error field so frontend defines it as application error, not HTTP error
    return new Response(
      JSON.stringify({ error: msg, logs }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      }
    );
  }
});
