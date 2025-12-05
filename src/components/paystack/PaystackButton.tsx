/**
 * PaystackButton Component
 * Handles payment initialization and Paystack popup
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  type PlanType, 
  type BillingInterval, 
  getPrice, 
  formatPrice 
} from '@/lib/paystack/paystackConfig';
import { supabase } from '@/integrations/supabase/client';

interface PaystackButtonProps {
  plan: PlanType;
  interval: BillingInterval;
  className?: string;
  children?: React.ReactNode;
}

export const PaystackButton = ({ plan, interval, className, children }: PaystackButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      // Get price in kobo (Paystack uses smallest currency unit)
      const amount = getPrice(plan, interval) * 100;

      // Generate unique reference
      const reference = `PAY_${Date.now()}_${user.id.substring(0, 8)}`;

      // Initialize payment via backend
      const { data, error } = await supabase.functions.invoke('paystack-initialize', {
        body: {
          email: user.email,
          amount,
          plan,
          interval,
          reference,
        },
      });

      if (error) throw error;

      // Check if PaystackPop is loaded
      if (!window.PaystackPop) {
        throw new Error('Paystack payment library not loaded. Please refresh the page.');
      }

      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!paystackKey) {
        throw new Error('Paystack public key not configured');
      }

      // Open Paystack popup
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount,
        currency: 'NGN',
        ref: reference,
        metadata: {
          plan,
          interval,
          user_id: user.id,
        },
        onClose: () => {
          setLoading(false);
          toast({
            title: 'Payment cancelled',
            description: 'You closed the payment window.',
          });
        },
        callback: async (response: { reference: string }) => {
          // Verify payment
          const { error: verifyError } = await supabase.functions.invoke('paystack-verify', {
            body: { reference: response.reference },
          });

          if (verifyError) {
            toast({
              title: 'Verification failed',
              description: 'Please contact support.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Payment successful!',
              description: `You are now subscribed to the ${plan} plan.`,
            });
            navigate('/dashboard');
          }
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Button
      variant="hero"
      className={className}
      onClick={handlePayment}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        children || `Subscribe - ${formatPrice(getPrice(plan, interval))}`
      )}
    </Button>
  );
};
