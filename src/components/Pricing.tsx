import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying it out",
    features: [
      "5 document chats per day",
      "Up to 50 pages per document",
      "Basic export (TXT)",
      "Standard response speed",
    ],
    cta: "Start free",
    variant: "outline" as const,
    action: "free",
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For power users",
    features: [
      "Unlimited document chats",
      "Up to 200 pages per document",
      "All export formats",
      "Priority processing",
      "Chat history saved",
      "Slack & Notion integration",
    ],
    cta: "Get Pro",
    variant: "hero" as const,
    popular: true,
    action: "pro",
  },
  {
    name: "Credits",
    price: "$0.25",
    period: "per chat",
    description: "Pay as you go",
    features: [
      "No monthly commitment",
      "Up to 100 pages per document",
      "All export formats",
      "Priority processing",
      "Credits never expire",
    ],
    cta: "Buy credits",
    variant: "outline" as const,
    action: "credits",
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handlePlanClick = async (action: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Navigate to pricing page for all plans
    navigate("/pricing");
  };

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Save hours every week. One quick answer can save an hour of reading.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? "border-primary bg-card shadow-card"
                  : "border-border bg-card hover:shadow-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full accent-gradient text-primary-foreground text-xs font-semibold">
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-serif font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2">/{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.variant} 
                className="w-full"
                onClick={() => handlePlanClick(plan.action)}
                disabled={isLoading === plan.action}
              >
                {isLoading === plan.action ? "Loading..." : plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include monthly credits that reset. Buy extra credits anytime for $3-$30.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
