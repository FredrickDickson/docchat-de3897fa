import { useState } from "react";
import { PricingCard } from "@/components/pricing/PricingCard";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const Pricing = () => {
  const { plan, isLoading: subscriptionLoading } = useSubscription();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'paystack'>('stripe');
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setIsCheckoutLoading(true);
    try {
      let functionName = 'create-checkout-session';
      if (paymentProvider === 'paystack') {
        functionName = 'initialize-paystack-transaction';
      }

      const { data, error } = await supabase.functions.invoke(functionName);
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Could not initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that's right for you
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <div className="bg-card p-4 rounded-lg border shadow-sm">
            <Label className="text-base font-semibold mb-3 block">Select Payment Method</Label>
            <RadioGroup 
              defaultValue="stripe" 
              value={paymentProvider} 
              onValueChange={(value) => setPaymentProvider(value as 'stripe' | 'paystack')}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="stripe" id="stripe" className="peer sr-only" />
                <Label
                  htmlFor="stripe"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="font-semibold">Stripe</span>
                  <span className="text-xs text-muted-foreground mt-1">Credit Card</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="paystack" id="paystack" className="peer sr-only" />
                <Label
                  htmlFor="paystack"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="font-semibold">Paystack</span>
                  <span className="text-xs text-muted-foreground mt-1">Bank / Card</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
          <PricingCard
            title="Free"
            price="Free"
            description="Perfect for trying out DocChat"
            features={[
              "3 summaries per day",
              "Basic PDF parsing",
              "Standard support",
              "10MB file size limit"
            ]}
            isCurrent={plan === 'free'}
            onUpgrade={() => {}} 
          />
          <PricingCard
            title="Pro"
            price="$19"
            description="For power users who need more"
            features={[
              "Unlimited summaries",
              "Advanced OCR for scanned PDFs",
              "Priority support",
              "100MB file size limit",
              "Early access to new features"
            ]}
            isCurrent={plan === 'pro'}
            isPopular
            onUpgrade={handleUpgrade}
            isLoading={isCheckoutLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Pricing;
