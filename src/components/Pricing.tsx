import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { t } = useTranslation();

  const plans = [
    {
      name: t('pricing_section.plans.free.name'),
      price: "$0",
      period: t('pricing_section.plans.free.period'),
      description: t('pricing_section.plans.free.description'),
      features: t('pricing_section.plans.free.features', { returnObjects: true }) as string[],
      cta: t('pricing_section.plans.free.cta'),
      variant: "outline" as const,
      action: "free",
    },
    {
      name: t('pricing_section.plans.pro.name'),
      price: "$19",
      period: t('pricing_section.plans.pro.period'),
      description: t('pricing_section.plans.pro.description'),
      features: t('pricing_section.plans.pro.features', { returnObjects: true }) as string[],
      cta: t('pricing_section.plans.pro.cta'),
      variant: "hero" as const,
      popular: true,
      action: "pro",
    },
    {
      name: t('pricing_section.plans.credits.name'),
      price: "$0.25",
      period: t('pricing_section.plans.credits.period'),
      description: t('pricing_section.plans.credits.description'),
      features: t('pricing_section.plans.credits.features', { returnObjects: true }) as string[],
      cta: t('pricing_section.plans.credits.cta'),
      variant: "outline" as const,
      action: "credits",
    },
  ];

  const handlePlanClick = async (action: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Navigate to pricing page for all plans
    navigate("/pricing");
  };

  return (
    <section id="pricing" className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-3 sm:mb-4">
            {t('pricing_section.title')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
            {t('pricing_section.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-5 sm:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? "border-primary bg-card shadow-card"
                  : "border-border bg-card hover:shadow-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full accent-gradient text-primary-foreground text-xs font-semibold whitespace-nowrap">
                  {t('pricing_section.plans.pro.most_popular')}
                </div>
              )}

              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-serif font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2 text-sm">/{plan.period}</span>
              </div>

              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.variant} 
                className="w-full"
                size="sm"
                onClick={() => handlePlanClick(plan.action)}
                disabled={isLoading === plan.action}
              >
                {isLoading === plan.action ? "Loading..." : plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8 px-4">
          {t('pricing_section.disclaimer')}
        </p>
      </div>
    </section>
  );
};

export default Pricing;
