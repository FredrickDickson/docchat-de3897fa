import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CheckoutFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Get error message from URL params
    const message = searchParams.get('message') || 'Payment was not completed';
    setErrorMessage(message);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <CardDescription>
            Your payment could not be processed
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Don't worry, you haven't been charged. Please try again or contact support if the problem persists.
            </p>

            <div className="space-y-2">
              <Button 
                variant="default" 
                className="w-full" 
                onClick={() => navigate('/pricing')}
              >
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Need help? Contact us at support@example.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutFailure;
