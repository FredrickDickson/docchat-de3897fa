/**
 * Supabase Edge Function: paystack-verify
 * Verify a Paystack payment and activate subscription
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
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { reference } = await req.json();

    if (!reference) {
      throw new Error('Missing reference');
    }

    // Verify transaction with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Verification failed');
    }

    const transaction = paystackData.data;

    // Update transaction in database
    const { data: dbTransaction, error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        status: transaction.status === 'success' ? 'success' : 'failed',
        paystack_data: transaction,
        verified_at: new Date().toISOString(),
      })
      .eq('reference', reference)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update transaction');
    }

    // If payment successful, activate subscription
    if (transaction.status === 'success') {
      const plan = transaction.metadata.plan;
      const interval = transaction.metadata.interval;

      // Calculate subscription period
      const now = new Date();
      const periodEnd = new Date(now);
      if (interval === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      // Update or create subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          paystack_customer_code: transaction.customer.customer_code,
        });

      if (subError) {
        console.error('Subscription error:', subError);
        throw new Error('Failed to activate subscription');
      }

      // Update user plan in users table
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ plan })
        .eq('id', user.id);

      if (userUpdateError) {
        console.error('User update error:', userUpdateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: transaction.status,
        data: paystackData 
      }),
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
