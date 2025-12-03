import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY') || '';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = req.headers.get('x-paystack-signature');
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    
    // Verify signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(PAYSTACK_SECRET_KEY);
    const bodyData = encoder.encode(body);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      hexToUint8Array(signature),
      bodyData
    );

    if (!isValid) {
      return new Response('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;
      const userId = metadata?.user_id;

      if (userId && reference) {
        // Verify transaction server-side
        const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        });
        
        const verifyData = await verifyResponse.json();

        if (verifyData.status && verifyData.data.status === 'success') {
          const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          );

          // Update subscriptions table
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              provider: 'paystack',
              provider_subscription_id: reference, // Using reference as ID for one-time/simple flow
              plan: 'pro',
              status: 'active',
              last_payment_status: 'paid',
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

          // Also update profiles for backward compatibility if needed, or rely on subscriptions
          await supabase
            .from('profiles')
            .update({ plan: 'pro' })
            .eq('user_id', userId);

          if (error) {
            console.error('Error updating subscription:', error);
            return new Response('Error updating subscription', { status: 500 });
          }
        } else {
            console.error('Transaction verification failed:', verifyData);
            return new Response('Verification failed', { status: 400 });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook Error: ${message}`);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }
});

function hexToUint8Array(hexString: string) {
  return new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
}
