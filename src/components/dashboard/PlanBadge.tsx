import { Crown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const PlanBadge = () => {
  const { plan, dailyUsage, isLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: error.message || "Could not open subscription management.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-8 w-24 bg-muted animate-pulse rounded-full" />
    );
  }

  const planConfig: Record<string, { name: string; gradient: string; icon: typeof Crown }> = {
    elite: {
      name: 'Elite',
      gradient: 'bg-gradient-to-r from-amber-500 to-orange-500',
      icon: Crown
    },
    pro: {
      name: 'Pro',
      gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
      icon: Crown
    },
    basic: {
      name: 'Basic',
      gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      icon: Zap
    }
  };

  const currentPlanConfig = planConfig[plan];

  if (currentPlanConfig) {
    const IconComponent = currentPlanConfig.icon;
    return (
      <Badge className={`${currentPlanConfig.gradient} text-white border-0 px-3 py-1`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {currentPlanConfig.name}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="px-3 py-1">
          Free
        </Badge>
        <span className="text-sm text-muted-foreground">
          {dailyUsage}/3 today
        </span>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate('/pricing')}
        className="text-primary"
      >
        <Zap className="w-3 h-3 mr-1" />
        Upgrade
      </Button>
    </div>
  );
};
