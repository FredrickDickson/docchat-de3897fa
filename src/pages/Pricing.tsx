import { useState } from "react";
import { PricingCard } from "@/components/pricing/PricingCard";
import { CreditPackCard } from "@/components/pricing/CreditPackCard";
import { CreditsDisplay } from "@/components/pricing/CreditsDisplay";
import { SubscriptionStatus } from "@/components/pricing/SubscriptionStatus";
import { useSubscription } from "@/hooks/useSubscription";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth"; // Ensure this import exists

const Pricing = () => {
  const { plan, isLoading: subscriptionLoading, refreshSubscription } = useSubscription();
  const { credits, isLoading: creditsLoading, refetch: refetchCredits } = useCredits();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); // Assume useAuth provides user object

  // Get Public Key from env
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

  const handlePaymentSuccess = async (reference: any) => {
    console.log('Payment success:', reference);
    setIsCheckoutLoading(true);
    try {
      // Verify on backend
      // Paystack returns object with 'reference' or 'message' field depending on context.
      // Usually 'reference' object: { message: "Approved", reference: "...", status: "success", trans: "..." }
      const refString = reference.reference;

      const { data, error } = await supabase.functions.invoke('paystack-verify', {
        body: { reference: refString }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Payment Successful",
        description: "Your transaction has been verified.",
      });

      // Refresh state
      await refreshSubscription();
      await refetchCredits();

    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Payment was successful but verification failed. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (subscriptionLoading || creditsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!publicKey) {
    console.warn('VITE_PAYSTACK_PUBLIC_KEY is likely missing. Please set it in your .env file.');
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
              Choose a subscription or buy credits as you need them
            </p>
          </div>
        </div>

        {/* Credits Display */}
        {credits && (
          <div className="max-w-md mx-auto mb-8">
            <CreditsDisplay
              monthlyCredits={credits.monthlyCredits}
              extraCredits={credits.extraCredits}
              plan={credits.plan}
            />
          </div>
        )}

        {/* Subscription Status */}
        <div className="max-w-4xl mx-auto mb-8">
          <SubscriptionStatus />
        </div>

        <Tabs defaultValue="subscriptions" className="w-full" id="plans">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="subscriptions">Monthly Plans</TabsTrigger>
            <TabsTrigger value="credits">Buy Credits</TabsTrigger>
          </TabsList>

          {/* Subscription Plans */}
          <TabsContent value="subscriptions">
            <div className="grid gap-8 lg:grid-cols-3 lg:gap-12 max-w-6xl mx-auto">
              <PricingCard
                title="Basic"
                price="GHS 105"
                amount={105}
                description="Perfect for students and light users"
                features={[
                  "200 credits per month",
                  "30 pages per summary",
                  "500 AI chat messages",
                  "50 OCR images",
                  "2GB storage",
                  "Email support"
                ]}
                isCurrent={plan === 'basic'}
                onSuccess={handlePaymentSuccess}
                email={user?.email || ''}
                publicKey={publicKey}
                userId={user?.id || ''}
              />
              <PricingCard
                title="Pro"
                price="GHS 225"
                amount={225}
                description="For professionals and researchers"
                features={[
                  "600 credits per month",
                  "100 pages per summary",
                  "Unlimited AI chat",
                  "200 OCR images",
                  "10GB storage",
                  "Priority support",
                  "Priority queue"
                ]}
                isCurrent={plan === 'pro'}
                isPopular
                onSuccess={handlePaymentSuccess}
                email={user?.email || ''}
                publicKey={publicKey}
                userId={user?.id || ''}
              />
              <PricingCard
                title="Elite"
                price="GHS 435"
                amount={435}
                description="For teams and heavy users"
                features={[
                  "1500 credits per month",
                  "200 pages per summary",
                  "Unlimited AI chat",
                  "500 OCR images",
                  "50GB storage",
                  "Priority support",
                  "3 team seats",
                  "API access"
                ]}
                isCurrent={plan === 'elite'}
                onSuccess={handlePaymentSuccess}
                email={user?.email || ''}
                publicKey={publicKey}
                userId={user?.id || ''}
              />
            </div>
          </TabsContent>

          {/* Credit Packs */}
          <TabsContent value="credits">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              <CreditPackCard
                credits={100}
                price={45}
                onSuccess={handlePaymentSuccess}
                email={user?.email || ''}
                publicKey={publicKey}
                userId={user?.id || ''}
              />
              <CreditPackCard
                credits={300}
                price={120}
                isPopular
                onSuccess={handlePaymentSuccess}
                email={user?.email || ''}
                publicKey={publicKey}
                userId={user?.id || ''}
              />
              <CreditPackCard
                credits={700}
                price={225}
                onSuccess={handlePaymentSuccess}
                email={user?.email || ''}
                publicKey={publicKey}
                userId={user?.id || ''}
              />
              <CreditPackCard
                credits={1500}
                price={450}
                onSuccess={handlePaymentSuccess}
                email={user?.email || ''}
                publicKey={publicKey}
                userId={user?.id || ''}
              />
            </div>

            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <h3 className="font-semibold mb-2">How Credits Work</h3>
                <p className="text-sm text-muted-foreground">
                  Credits are used for AI operations. Purchased credits never expire and are used after your monthly subscription credits run out.
                </p>
                <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                  <div>
                    <div className="font-semibold">AI Chat</div>
                    <div className="text-muted-foreground">1 credit/msg</div>
                  </div>
                  <div>
                    <div className="font-semibold">OCR</div>
                    <div className="text-muted-foreground">2 credits/image</div>
                  </div>
                  <div>
                    <div className="font-semibold">Summary</div>
                    <div className="text-muted-foreground">5-25 credits</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Pricing;
