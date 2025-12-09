
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
      credits: metadata?.credits,
      interval: metadata?.interval || 'monthly',
      verified_at: new Date().toISOString()
    }, { onConflict: 'reference' });

    log(`Transaction verified for User ${userId}`);

    // Grant Value
    if (metadata.plan && metadata.plan !== 'free') {
      log(`Updating plan to: ${metadata.plan}`);

      const plan = metadata.plan;
      const isAnnual = metadata.interval === 'annual';
      
      // Calculate subscription period
      const now = new Date();
      const periodEnd = new Date(now);
      if (isAnnual) {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // Calculate monthly credits based on plan
      const monthlyCreditsMap: Record<string, number> = {
        'free': 3,
        'basic': 200,
        'pro': 600,
        'elite': 1500
      };
      const monthlyCredits = monthlyCreditsMap[plan] ?? 3;

      // Update users table (primary source of truth)
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          plan: plan,
          monthly_credits: monthlyCredits,
          subscription_renews_at: periodEnd.toISOString()
        })
        .eq('id', userId);

      if (userUpdateError) {
        log(`Error updating users table: ${userUpdateError.message}`);
      } else {
        log(`Updated users table with plan ${plan} and ${monthlyCredits} credits`);
      }

      // Also update profiles table for backward compatibility
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ plan: plan })
        .eq('user_id', userId);

      if (profileError) {
        log(`Error updating profiles: ${profileError.message}`);
      }

      // Update/create subscription record
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan: plan,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString()
        }, { onConflict: 'user_id' });

      log(`Subscription activated for user ${userId}`);
    }

    if (metadata.credits) {
      const credits = Number(metadata.credits);
      log(`Adding ${credits} extra credits`);

      // Use the RPC function to add credits
      const { error: creditError } = await supabase.rpc('add_extra_credits', {
        p_user_id: userId,
        p_amount: credits,
        p_description: `Purchased ${credits} credits via Paystack`
      });

      if (creditError) {
        log(`RPC add_extra_credits error: ${creditError.message}`);
        
        // Fallback: Direct update
        const { data: userData } = await supabase
          .from('users')
          .select('extra_credits')
          .eq('id', userId)
          .single();
        
        if (userData) {
          const newTotal = (userData.extra_credits || 0) + credits;
          await supabase
            .from('users')
            .update({ extra_credits: newTotal })
            .eq('id', userId);
          log(`Fallback: Updated extra_credits to ${newTotal}`);
        }
      } else {
        log(`Successfully added ${credits} extra credits via RPC`);
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
