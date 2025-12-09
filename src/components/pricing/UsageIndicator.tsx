import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface UsageIndicatorProps {
  usage: number;
  limit?: number;
  plan: 'free' | 'basic' | 'pro' | 'elite';
}

// Plan-based limits for daily summaries
const PLAN_LIMITS: Record<string, number | null> = {
  'free': 3,
  'basic': 10,
  'pro': null, // Unlimited
  'elite': null, // Unlimited
};

export const UsageIndicator = ({ usage, limit, plan }: UsageIndicatorProps) => {
  const planLimit = PLAN_LIMITS[plan];
  const effectiveLimit = limit ?? planLimit;
  
  // For unlimited plans, show a different UI
  if (effectiveLimit === null) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-sm">Daily Usage</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{usage}</span>
              <Infinity className="w-4 h-4" />
              <span>summaries</span>
            </div>
          </div>
          <Progress value={0} className="h-2 bg-primary/20" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Unlimited summaries with {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
          </p>
        </CardContent>
      </Card>
    );
  }

  const percentage = Math.min((usage / effectiveLimit) * 100, 100);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="font-medium text-sm">Daily Usage</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {usage} / {effectiveLimit} summaries
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        {usage >= effectiveLimit && (
          <div className="mt-4">
            <Button asChild variant="default" size="sm" className="w-full">
              <Link to="/pricing">Upgrade for More</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
