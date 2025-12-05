/**
 * Supabase Edge Function: paystack-initialize
 * Initialize a Paystack payment transaction
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Check environment variables
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('PAYSTACK_SECRET_KEY not configured in edge function secrets');
    }
    if (!SUPABASE_URL) {
      throw new Error('SUPABASE_URL not configured in edge function secrets');
    }
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured in edge function secrets');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header - user must be authenticated');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { email, amount, plan, interval, reference, credits } = await req.json();

    // Validate inputs
    if (!email || !amount || !reference) {
      throw new Error('Missing required fields: email, amount, reference');
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

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount,
        currency: 'USD', // Changed to USD for hybrid billing
        reference,
        callback_url: `${req.headers.get('origin')}/payment/verify`,
        metadata,
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      const errorMsg = paystackData.message || paystackData.error?.message || 'Paystack initialization failed';
      console.error('Paystack API error:', paystackData);
      throw new Error(`Paystack error: ${errorMsg}`);
    }

    // Store transaction in database
    const { error: dbError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        reference,
        amount: amount / 100, // Convert from kobo to naira
        currency: 'NGN',
        status: 'pending',
        plan,
        interval,
        paystack_data: paystackData.data,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store transaction');
    }

    return new Response(
      JSON.stringify(paystackData),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
