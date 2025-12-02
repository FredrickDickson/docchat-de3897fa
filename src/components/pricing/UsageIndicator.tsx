import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface UsageIndicatorProps {
  usage: number;
  limit: number;
  plan: 'free' | 'pro';
}

export const UsageIndicator = ({ usage, limit, plan }: UsageIndicatorProps) => {
  if (plan === 'pro') return null;

  const percentage = Math.min((usage / limit) * 100, 100);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="font-medium text-sm">Daily Usage</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {usage} / {limit} summaries
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        {usage >= limit && (
          <div className="mt-4">
            <Button asChild variant="default" size="sm" className="w-full">
              <Link to="/pricing">Upgrade for Unlimited</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
