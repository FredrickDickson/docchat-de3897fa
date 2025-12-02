import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isCurrent?: boolean;
  isPopular?: boolean;
  onUpgrade?: () => void;
  isLoading?: boolean;
}

export const PricingCard = ({
  title,
  price,
  description,
  features,
  isCurrent,
  isPopular,
  onUpgrade,
  isLoading
}: PricingCardProps) => {
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
          disabled={isCurrent || isLoading}
          onClick={onUpgrade}
        >
          {isCurrent ? "Current Plan" : "Upgrade"}
        </Button>
      </CardFooter>
    </Card>
  );
};
