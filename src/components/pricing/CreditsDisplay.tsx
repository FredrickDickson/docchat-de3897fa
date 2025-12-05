import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coins, Zap } from "lucide-react";

interface CreditsDisplayProps {
  monthlyCredits: number;
  extraCredits: number;
  plan: string;
}

export const CreditsDisplay = ({ monthlyCredits, extraCredits, plan }: CreditsDisplayProps) => {
  const totalCredits = monthlyCredits + extraCredits;
  
  const maxMonthlyCredits = {
    'free': 3,
    'basic': 200,
    'pro': 600,
    'elite': 1500
  }[plan] || 3;
  
  const monthlyPercentage = (monthlyCredits / maxMonthlyCredits) * 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Your Credits
        </CardTitle>
        <CardDescription>
          Total: {totalCredits} credits available
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Monthly Credits */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium flex items-center gap-1">
              <Zap className="w-4 h-4 text-primary" />
              Monthly Credits
            </span>
            <span className="text-sm text-muted-foreground">
              {monthlyCredits} / {maxMonthlyCredits}
            </span>
          </div>
          <Progress value={monthlyPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Resets monthly with your {plan} plan
          </p>
        </div>
        
        {/* Extra Credits */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium flex items-center gap-1">
              <Coins className="w-4 h-4 text-green-600" />
              Extra Credits
            </span>
            <span className="text-sm text-muted-foreground">
              {extraCredits}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-green-600" style={{ width: extraCredits > 0 ? '100%' : '0%' }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Never expires • Purchased separately
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
