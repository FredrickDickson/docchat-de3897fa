import { MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeaderCreditsDisplay } from "@/components/pricing/HeaderCreditsDisplay";

interface HeaderProps {
  showChat: boolean;
}

const Header = ({ showChat }: HeaderProps) => {
  const { user, loading } = useAuth();
  const { profile } = useProfile();

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg accent-gradient flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-semibold">DocChat</span>
        </Link>
        
        {!showChat && (
          <>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {!loading && user ? (
                <div className="flex items-center gap-3">
                  <HeaderCreditsDisplay />
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={getDisplayName()} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getDisplayName().charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                      {getDisplayName()}
                    </span>
                  </Link>
                  <Button variant="hero" size="sm" asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/auth">Sign in</Link>
                  </Button>
                  <Button variant="hero" size="sm" asChild>
                    <Link to="/auth">Get started free</Link>
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
