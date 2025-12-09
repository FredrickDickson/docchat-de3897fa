import { useCredits } from '@/hooks/useCredits';
import { Coins, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export const HeaderCreditsDisplay = () => {
  const { credits, isLoading } = useCredits();

  if (isLoading) {
    return <Skeleton className="h-8 w-24" />;
  }

  if (!credits) {
    return null;
  }

  const totalCredits = credits.monthlyCredits + credits.extraCredits;
  const planColors: Record<string, string> = {
    free: 'bg-muted text-muted-foreground',
    basic: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    pro: 'bg-primary/10 text-primary',
    elite: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
  };

  return (
    <Link 
      to="/pricing" 
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
    >
      <div className="flex items-center gap-1.5">
        <Coins className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{totalCredits}</span>
      </div>
      <Badge 
        variant="secondary" 
        className={`text-xs capitalize ${planColors[credits.plan] || planColors.free}`}
      >
        {credits.plan === 'free' ? 'Free' : (
          <>
            <Crown className="w-3 h-3 mr-1" />
            {credits.plan}
          </>
        )}
      </Badge>
    </Link>
  );
};
