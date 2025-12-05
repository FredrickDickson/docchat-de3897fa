/**
 * Paystack Configuration
 * Plan definitions, pricing, and API configuration
 */

export const PAYSTACK_CONFIG = {
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  apiBaseUrl: 'https://api.paystack.co',
  currency: 'NGN', // Nigerian Naira
};

export type PlanType = 'free' | 'basic' | 'pro';
export type BillingInterval = 'monthly' | 'annual';

export interface Plan {
  id: PlanType;
  name: string;
  description: string;
  features: string[];
  limits: {
    dailySummaries: number;
    monthlyStorage: number; // in MB
  };
  pricing: {
    monthly: number;
    annual: number;
  };
  paystackPlanCodes?: {
    monthly: string;
    annual: string;
  };
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out DocChat',
    features: [
      '3 summaries per day',
      'Basic PDF processing',
      'Standard support',
      '10MB storage',
    ],
    limits: {
      dailySummaries: 3,
      monthlyStorage: 10,
    },
    pricing: {
      monthly: 0,
      annual: 0,
    },
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    description: 'For regular users',
    features: [
      '50 summaries per day',
      'Advanced PDF processing',
      'Priority support',
      '100MB storage',
      'Export to multiple formats',
    ],
    limits: {
      dailySummaries: 50,
      monthlyStorage: 100,
    },
    pricing: {
      monthly: 2000, // ₦2,000/month
      annual: 20000, // ₦20,000/year (2 months free)
    },
    paystackPlanCodes: {
      monthly: 'PLN_basic_monthly',
      annual: 'PLN_basic_annual',
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For power users',
    features: [
      'Unlimited summaries',
      'Advanced AI features',
      'Premium support',
      '1GB storage',
      'Export to all formats',
      'API access',
      'Custom integrations',
    ],
    limits: {
      dailySummaries: -1, // Unlimited
      monthlyStorage: 1000,
    },
    pricing: {
      monthly: 5000, // ₦5,000/month
      annual: 50000, // ₦50,000/year (2 months free)
    },
    paystackPlanCodes: {
      monthly: 'PLN_pro_monthly',
      annual: 'PLN_pro_annual',
    },
  },
};

/**
 * Get plan by ID
 */
export const getPlan = (planId: PlanType): Plan => {
  return PLANS[planId];
};

/**
 * Calculate price for a plan and interval
 */
export const getPrice = (planId: PlanType, interval: BillingInterval): number => {
  const plan = getPlan(planId);
  return plan.pricing[interval];
};

/**
 * Format price in Naira
 */
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get savings percentage for annual billing
 */
export const getAnnualSavings = (planId: PlanType): number => {
  const plan = getPlan(planId);
  const monthlyTotal = plan.pricing.monthly * 12;
  const annualPrice = plan.pricing.annual;
  return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100);
};
