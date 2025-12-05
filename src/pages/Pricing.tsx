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

const Pricing = () => {
  const { plan, isLoading: subscriptionLoading } = useSubscription();
  const { credits, isLoading: creditsLoading } = useCredits();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscription = async (selectedPlan: string, interval: string, amount: number) => {
    setIsCheckoutLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upgrade');
      }

      const reference = `SUB_${Date.now()}_${user.id.substring(0, 8)}`;
      
      const { data, error } = await supabase.functions.invoke('paystack-initialize', {
        body: {
          email: user.email,
          amount: amount * 100, // Convert to cents
          plan: selectedPlan,
          interval,
          reference,
        },
      });
      
      if (error) {
        console.error('Paystack initialize error:', error);
        // Try to extract error message from response
        let errorMsg = error.message || 'Failed to initialize payment';
        if (error.context?.body) {
          try {
            const errorBody = typeof error.context.body === 'string' 
              ? JSON.parse(error.context.body) 
              : error.context.body;
            errorMsg = errorBody.error || errorBody.message || errorMsg;
          } catch (e) {
            // Ignore parsing errors
          }
        }
        throw new Error(errorMsg);
      }
      
      if (!data) {
        throw new Error('No response from payment service');
      }
      
      if (data.error) {
        const errorMsg = typeof data.error === 'string' ? data.error : data.error.message || 'Payment initialization failed';
        throw new Error(errorMsg);
      }
      
      if (data?.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('No authorization URL received from payment service');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error?.message || error?.error?.message || 'Could not initiate checkout. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleCreditPurchase = async (creditAmount: number, price: number) => {
    setIsCheckoutLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to purchase credits');
      }

      const reference = `CREDIT_${Date.now()}_${user.id.substring(0, 8)}`;
      
      const { data, error } = await supabase.functions.invoke('paystack-initialize', {
        body: {
          email: user.email,
          amount: price * 100, // Convert to cents
          credits: creditAmount,
          reference,
        },
      });
      
      if (error) {
        console.error('Paystack initialize error:', error);
        // Try to extract error message from response
        let errorMsg = error.message || 'Failed to initialize payment';
        if (error.context?.body) {
          try {
            const errorBody = typeof error.context.body === 'string' 
              ? JSON.parse(error.context.body) 
              : error.context.body;
            errorMsg = errorBody.error || errorBody.message || errorMsg;
          } catch (e) {
            // Ignore parsing errors
          }
        }
        throw new Error(errorMsg);
      }
      
      if (!data) {
        throw new Error('No response from payment service');
      }
      
      if (data.error) {
        const errorMsg = typeof data.error === 'string' ? data.error : data.error.message || 'Payment initialization failed';
        throw new Error(errorMsg);
      }
      
      if (data?.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('No authorization URL received from payment service');
      }
    } catch (error: any) {
      console.error('Error purchasing credits:', error);
      const errorMessage = error?.message || error?.error?.message || 'Could not initiate credit purchase. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
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
                price="$7"
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
                onUpgrade={() => handleSubscription('basic', 'monthly', 7)}
                isLoading={isCheckoutLoading}
              />
              <PricingCard
                title="Pro"
                price="$15"
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
                onUpgrade={() => handleSubscription('pro', 'monthly', 15)}
                isLoading={isCheckoutLoading}
              />
              <PricingCard
                title="Elite"
                price="$29"
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
                onUpgrade={() => handleSubscription('elite', 'monthly', 29)}
                isLoading={isCheckoutLoading}
              />
            </div>
          </TabsContent>

          {/* Credit Packs */}
          <TabsContent value="credits">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              <CreditPackCard
                credits={100}
                price={3}
                onPurchase={() => handleCreditPurchase(100, 3)}
                isLoading={isCheckoutLoading}
              />
              <CreditPackCard
                credits={300}
                price={8}
                isPopular
                onPurchase={() => handleCreditPurchase(300, 8)}
                isLoading={isCheckoutLoading}
              />
              <CreditPackCard
                credits={700}
                price={15}
                onPurchase={() => handleCreditPurchase(700, 15)}
                isLoading={isCheckoutLoading}
              />
              <CreditPackCard
                credits={1500}
                price={30}
                onPurchase={() => handleCreditPurchase(1500, 30)}
                isLoading={isCheckoutLoading}
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
