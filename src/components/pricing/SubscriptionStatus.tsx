import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, Calendar, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SubscriptionStatus = () => {
  const { plan, isLoading } = useSubscription();

  if (isLoading) {
    return null;
  }

  const planDetails = {
    free: {
      name: 'Free Plan',
      credits: 3,
      color: 'secondary',
      icon: CheckCircle
    },
    basic: {
      name: 'Basic Plan',
      credits: 200,
      color: 'default',
      icon: CheckCircle
    },
    pro: {
      name: 'Pro Plan',
      credits: 600,
      color: 'default',
      icon: Crown
    },
    elite: {
      name: 'Elite Plan',
      credits: 1500,
      color: 'default',
      icon: Crown
    }
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails] || planDetails.free;
  const Icon = currentPlan.icon;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Current Subscription</CardTitle>
              <CardDescription>Your active plan and benefits</CardDescription>
            </div>
          </div>
          <Badge variant={currentPlan.color as any}>
            {currentPlan.name}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{currentPlan.credits} Credits</div>
              <div className="text-xs text-muted-foreground">Per month</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Monthly Reset</div>
              <div className="text-xs text-muted-foreground">Auto-renewal</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <CheckCircle className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Active</div>
              <div className="text-xs text-muted-foreground">Status</div>
            </div>
          </div>
        </div>

        {plan === 'free' && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-center mb-3">
              Upgrade to get more credits and unlock all features
            </p>
            <Button asChild className="w-full" size="sm">
              <a href="#plans">View Plans</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
