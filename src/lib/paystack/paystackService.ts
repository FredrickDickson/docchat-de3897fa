/**
 * Paystack Service
 * Core API integration for Paystack payments via Supabase Edge Functions
 */

import { PAYSTACK_CONFIG, PLANS, type PlanType, type BillingInterval } from './paystackConfig';
import { supabase } from '@/integrations/supabase/client';

export interface InitializePaymentParams {
  email: string;
  amount: number; // in kobo (smallest currency unit)
  plan: PlanType;
  interval: BillingInterval;
  metadata?: Record<string, any>;
}

export interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata: Record<string, any>;
  };
}

/**
 * Initialize a payment transaction via Supabase Edge Function
 */
export const initializePayment = async (
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> => {
  // Generate unique reference
  const reference = `PAY_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // Get plan code from config if this is a subscription
  let planCode: string | undefined;
  if (params.plan !== 'free') {
    const planConfig = PLANS[params.plan];
    if (planConfig.paystackPlanCodes) {
      planCode = planConfig.paystackPlanCodes[params.interval];
    }
  }

  const { data, error } = await supabase.functions.invoke('initialize-paystack-transaction', {
    body: {
      email: params.email,
      amount: params.amount,
      plan: params.plan, // Internal plan name (basic, pro)
      plan_code: planCode, // Paystack plan code (PLN_...)
      interval: params.interval,
      reference,
      metadata: params.metadata,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to initialize payment');
  }

  return data;
};

/**
 * Verify a payment transaction via Supabase Edge Function
 */
export const verifyPayment = async (reference: string): Promise<VerifyPaymentResponse> => {
  const { data, error } = await supabase.functions.invoke('paystack-verify', {
    body: { reference },
  });

  if (error) {
    throw new Error(error.message || 'Failed to verify payment');
  }

  return data;
};

/**
 * Open Paystack popup for payment
 * Uses Paystack Inline JS (must be loaded in index.html)
 */
export const openPaystackPopup = (
  email: string,
  amount: number,
  reference: string,
  onSuccess: (reference: string) => void,
  onClose: () => void
) => {
  // @ts-ignore - PaystackPop is loaded from CDN
  const handler = window.PaystackPop.setup({
    key: PAYSTACK_CONFIG.publicKey,
    email,
    amount,
    currency: PAYSTACK_CONFIG.currency,
    ref: reference,
    onClose,
    callback: (response: { reference: string }) => {
      onSuccess(response.reference);
    },
  });

  handler.openIframe();
};
