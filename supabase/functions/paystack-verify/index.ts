
/**
 * Supabase Edge Function: paystack-verify
 * Verify a Paystack payment transaction and grant value
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

    if (!paystackSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { reference } = await req.json();

    if (!reference) {
      throw new Error('No reference provided');
    }

    log(`Verifying reference: ${reference}`);

    // Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { 'Authorization': `Bearer ${paystackSecretKey}` }
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      log(`Paystack verification failed: ${JSON.stringify(verifyData)}`);
      throw new Error('Transaction verification failed or not successful');
    }

    const { amount, metadata } = verifyData.data;
    const userId = metadata?.user_id;

    if (!userId) {
      log('Warning: No user_id in metadata');
      throw new Error('User ID missing from transaction metadata');
    }

    // Check idempotency
    const { data: existing } = await supabase
      .from('payment_transactions')
      .select('status')
      .eq('reference', reference)
      .single();

    if (existing && existing.status === 'success') {
      log('Transaction already processed');
      return new Response(JSON.stringify({ success: true, message: 'Already processed', logs }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Record Transaction
    await supabase.from('payment_transactions').upsert({
      user_id: userId,
      reference,
      amount: amount / 100, // stored as major unit
      currency: verifyData.data.currency,
      status: 'success',
      paystack_data: verifyData.data,
      plan: metadata?.plan,
      credits: metadata?.credits
    });

    log(`Transaction verified for User ${userId}`);

    // Grant Value
    if (metadata.plan) {
      log(`Updating plan to: ${metadata.plan}`);

      // Strategy: Verify update success by checking returned rows.
      let planUpdated = false;

      // 1. Try updating by 'user_id'
      const res1 = await supabase
        .from('profiles')
        .update({ plan: metadata.plan })
        .eq('user_id', userId)
        .select();

      if (res1.data && res1.data.length > 0) {
        log(`Updated plan via user_id.`);
        planUpdated = true;
      } else {
        if (res1.error) log(`Update user_id error: ${res1.error.message}`);
        else log(`Update user_id returned 0 rows.`);
      }

      // 2. If not updated, try 'id'
      if (!planUpdated) {
        log('Trying update by id...');
        const res2 = await supabase
          .from('profiles')
          .update({ plan: metadata.plan })
          .eq('id', userId)
          .select();

        if (res2.data && res2.data.length > 0) {
          log(`Updated plan via id.`);
          planUpdated = true;
        } else {
          if (res2.error) log(`Update id error: ${res2.error.message}`);
          else log(`Update id returned 0 rows.`);
        }
      }

      // 3. Fallback to 'users' table (legacy)
      if (!planUpdated) {
        const res3 = await supabase.from('users').update({ plan: metadata.plan }).eq('id', userId).select();
        if (res3.data && res3.data.length > 0) planUpdated = true;
      }

      if (!planUpdated) {
        throw new Error(`Could not update plan. Profile for user ${userId} not found or update failed.`);
      }
    }

    if (metadata.credits) {
      const credits = Number(metadata.credits);
      log(`Adding ${credits} credits`);

      let creditsUpdated = false;

      // Try 'users' table
      const { data: userData } = await supabase.from('users').select('extra_credits').eq('id', userId).single();
      if (userData) {
        const newTotal = (userData.extra_credits || 0) + credits;
        const res = await supabase.from('users').update({ extra_credits: newTotal }).eq('id', userId).select();
        if (res.data && res.data.length > 0) creditsUpdated = true;
      }

      // Try 'profiles' table
      if (!creditsUpdated) {
        // Try by user_id
        let { data: pData } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
        let key = 'user_id';
        if (!pData) {
          const res = await supabase.from('profiles').select('*').eq('id', userId).single();
          pData = res.data;
          key = 'id';
        }

        if (pData) {
          // Assume column 'credits' or 'extra_credits' exists?
          // Migration 15_fix_summaries introduced 'credits_used' in summaries.
          // Pricing display uses 'extra_credits' from 'users' table.
          // If profiles has a credits field, we use it.
          // We'll try 'extra_credits' first, then 'credits'.

          // Optimistic update attempts
          const newTotal = (pData.extra_credits || pData.credits || 0) + credits;

          let res = await supabase.from('profiles').update({ extra_credits: newTotal }).eq(key, userId).select();
          if (res.error) {
            res = await supabase.from('profiles').update({ credits: newTotal }).eq(key, userId).select();
          }

          if (res.data && res.data.length > 0) creditsUpdated = true;
        }
      }

      if (!creditsUpdated && !userData) {
        throw new Error(`Could not find user record (users/profiles) to add credits.`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, logs }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      }
    );

  } catch (error: any) {
    console.error('Verify Error:', error);
    return new Response(
      JSON.stringify({ error: error.message, logs }),
      {
        status: 200, // Return 200 to allow client error processing
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      }
    );
  }
});
