import { useCredits } from "@/hooks/useCredits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Zap, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export const CreditsDashboardWidget = () => {
  const { credits, isLoading } = useCredits();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!credits) return null;

  const totalCredits = credits.monthlyCredits + credits.extraCredits;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Credits
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link to="/pricing">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy More
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Total Credits */}
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <div className="text-3xl font-bold">{totalCredits}</div>
            <div className="text-sm text-muted-foreground">Total Credits Available</div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-lg font-semibold">{credits.monthlyCredits}</span>
              </div>
              <div className="text-xs text-muted-foreground">Monthly</div>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Coins className="w-4 h-4 text-green-600" />
                <span className="text-lg font-semibold">{credits.extraCredits}</span>
              </div>
              <div className="text-xs text-muted-foreground">Extra</div>
            </div>
          </div>

          {/* Renewal Info */}
          {credits.subscriptionRenewsAt && (
            <div className="text-xs text-center text-muted-foreground pt-2 border-t">
              Monthly credits reset on{' '}
              {new Date(credits.subscriptionRenewsAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
