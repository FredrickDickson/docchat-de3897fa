import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePaystackPayment } from 'react-paystack';

interface CreditPackCardProps {
  credits: number;
  price: number;
  isPopular?: boolean;
  onSuccess: (reference: any) => void;
  email: string;
  publicKey: string;
  userId: string;
  isLoading?: boolean;
}

export const CreditPackCard = ({
  credits,
  price,
  isPopular,
  onSuccess,
  email,
  publicKey,
  userId,
  isLoading
}: CreditPackCardProps) => {
  const pricePerCredit = (price / credits).toFixed(3);

  const config = {
    reference: `CREDIT_${new Date().getTime()}_${userId?.slice(0, 5)}`,
    email: email,
    amount: price * 100, // Convert to Pesewas
    publicKey: publicKey,
    currency: 'GHS',
    metadata: {
      user_id: userId,
      credits: credits,
      custom_fields: []
    },
  };

  const initializePayment = usePaystackPayment(config);

  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          Best Value
        </Badge>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{credits} Credits</CardTitle>
        <CardDescription>
          GHS {pricePerCredit} per credit
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <span className="text-4xl font-bold">GHS {price}</span>
          <span className="text-muted-foreground ml-2">one-time</span>
        </div>

        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm">{credits} credits added to your account</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm">Never expires</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm">Use anytime</span>
          </li>
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={() => {
            (initializePayment as any)(onSuccess, () => { });
          }}
          disabled={isLoading || !publicKey || !email}
        >
          {isLoading ? 'Processing...' : 'Buy Credits'}
        </Button>
      </CardFooter>
    </Card>
  );
};
