import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { plan, refreshSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [purchaseType, setPurchaseType] = useState<'subscription' | 'credits'>('subscription');

  useEffect(() => {
    refreshSubscription();

    // Detect purchase type from URL params
    const type = searchParams.get('type');
    if (type === 'credits') {
      setPurchaseType('credits');
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, refreshSubscription, searchParams]);

  const planNames = {
    basic: 'Basic',
    pro: 'Pro',
    elite: 'Elite'
  };

  const planCredits = {
    basic: 200,
    pro: 600,
    elite: 1500
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          {purchaseType === 'subscription' ? (
            <>
              <CardTitle className="text-3xl font-serif">
                Welcome to {planNames[plan as keyof typeof planNames] || 'Pro'}!
              </CardTitle>
              <CardDescription className="text-base">
                Your subscription is now active
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-3xl font-serif">
                Credits Added!
              </CardTitle>
              <CardDescription className="text-base">
                Your credits have been added to your account
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {purchaseType === 'subscription' && (
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan:</span>
                <Badge variant="default">
                  {planNames[plan as keyof typeof planNames] || 'Pro'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Credits:</span>
                <span className="text-sm font-semibold">
                  {planCredits[plan as keyof typeof planCredits] || 600}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Credits reset monthly
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              variant="default" 
              className="w-full" 
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
            
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting in {countdown} seconds...
            </p>
          </div>

          <div className="pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground mb-2">
              What's next?
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Upload PDF documents</li>
              <li>✓ Chat with your documents</li>
              <li>✓ Generate AI summaries</li>
              <li>✓ Extract text with OCR</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutSuccess;

