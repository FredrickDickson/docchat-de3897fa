/**
 * Supabase Edge Function: paystack-webhook
 * Handle Paystack webhook events
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

/**
 * Verify Paystack webhook signature
 */
function verifySignature(payload: string, signature: string): boolean {
  const hash = createHmac('sha512', PAYSTACK_SECRET_KEY!)
    .update(payload)
    .digest('hex');
  return hash === signature;
}

serve(async (req) => {
  try {
    // Verify webhook signature
    const signature = req.headers.get('x-paystack-signature');
    const payload = await req.text();

    if (!signature || !verifySignature(payload, signature)) {
      console.error('Invalid signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(payload);
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log('Webhook event:', event.event);

    // Handle different event types
    switch (event.event) {
      case 'charge.success': {
        const { reference, customer, metadata, amount } = event.data;
        
        // Update transaction status
        await supabase
          .from('payment_transactions')
          .update({
            status: 'success',
            paystack_data: event.data,
            verified_at: new Date().toISOString(),
          })
          .eq('reference', reference);

        // Check if this is a subscription payment or credit purchase
        if (metadata?.credits) {
          // CREDIT PURCHASE - Add extra credits using helper function
          const { error: creditError } = await supabase.rpc('add_extra_credits', {
            p_user_id: metadata.user_id,
            p_amount: metadata.credits,
            p_description: `Purchased ${metadata.credits} credits via Paystack`
          });

          if (creditError) {
            console.error('Error adding credits:', creditError);
          } else {
            console.log(`Added ${metadata.credits} extra credits to user ${metadata.user_id}`);
          }
        } else if (metadata?.user_id && metadata?.plan) {
          // SUBSCRIPTION PAYMENT - Activate subscription and set monthly credits
          const now = new Date();
          const periodEnd = new Date(now);
          
          if (metadata.interval === 'monthly') {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
          } else {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          }

          // Calculate monthly credits based on plan
          const monthlyCredits = {
            'free': 3,
            'basic': 200,
            'pro': 600,
            'elite': 1500
          }[metadata.plan] || 3;

          // Update subscription
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: metadata.user_id,
              plan: metadata.plan,
              status: 'active',
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
              paystack_customer_code: customer.customer_code,
            });

          // Update user with plan and monthly credits
          await supabase
            .from('users')
            .update({ 
              plan: metadata.plan,
              monthly_credits: monthlyCredits,
              subscription_renews_at: periodEnd.toISOString()
            })
            .eq('id', metadata.user_id);

          console.log(`Activated ${metadata.plan} subscription for user ${metadata.user_id}`);
        }
        break;
      }

      case 'subscription.create': {
        const { subscription_code, customer, plan, email_token } = event.data;
        
        // Find user by email
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('email', event.data.customer.email)
          .single();

        if (user) {
          await supabase
            .from('subscriptions')
            .update({
              paystack_subscription_code: subscription_code,
              paystack_email_token: email_token,
            })
            .eq('user_id', user.id);
        }
        break;
      }

      case 'subscription.disable': {
        const { subscription_code } = event.data;
        
        // Downgrade to free plan
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('paystack_subscription_code', subscription_code)
          .single();

        if (subscription) {
          await supabase
            .from('subscriptions')
            .update({ status: 'canceled', plan: 'free' })
            .eq('paystack_subscription_code', subscription_code);

          // Reset to free plan with 3 monthly credits
          await supabase
            .from('users')
            .update({ 
              plan: 'free',
              monthly_credits: 3,
              subscription_renews_at: null
            })
            .eq('id', subscription.user_id);

          console.log(`Downgraded user ${subscription.user_id} to free plan`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        // Handle failed payment
        console.log('Payment failed:', event.data);
        break;
      }

      default:
        console.log('Unhandled event type:', event.event);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
