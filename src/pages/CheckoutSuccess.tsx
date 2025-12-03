import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    refreshSubscription();

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
  }, [navigate, refreshSubscription]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-3xl font-serif font-bold mb-3">Welcome to Pro!</h1>
        <p className="text-muted-foreground mb-8">
          Your subscription is now active. You have unlimited access to all features.
        </p>

        <div className="space-y-4">
          <Button variant="hero" className="w-full" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
          
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
