import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePaystackPayment } from 'react-paystack';

interface PricingCardProps {
  title: string;
  price: string;
  amount: number;
  description: string;
  features: string[];
  isCurrent?: boolean;
  isPopular?: boolean;
  email: string;
  publicKey: string;
  userId: string;
  onSuccess: (reference: any) => void;
  isLoading?: boolean;
}

export const PricingCard = ({
  title,
  price,
  amount,
  description,
  features,
  isCurrent,
  isPopular,
  email,
  publicKey,
  userId,
  onSuccess,
  isLoading
}: PricingCardProps) => {

  const config = {
    reference: `SUB_${new Date().getTime()}_${userId?.slice(0, 5)}`,
    email: email,
    amount: amount * 100, // Convert GHS to Pesewas
    publicKey: publicKey,
    currency: 'GHS',
    metadata: {
      plan: title.toLowerCase(),
      user_id: userId,
      custom_fields: []
    },
  };

  const initializePayment = usePaystackPayment(config);

  return (
    <Card className={`relative flex flex-col ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
          Most Popular
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          {price !== 'Free' && <span className="text-muted-foreground">/month</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrent ? "outline" : isPopular ? "default" : "secondary"}
          disabled={isCurrent || isLoading || !publicKey || !email}
          onClick={() => {
            (initializePayment as any)(onSuccess, () => { });
          }}
        >
          {isCurrent ? "Current Plan" : "Upgrade"}
        </Button>
      </CardFooter>
    </Card>
  );
};
