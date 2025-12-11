import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation, Trans } from 'react-i18next';
import { MessageSquare, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Google sign-in removed from active use
  const { user, loading: authLoading /* signInWithGoogle */ } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        navigate("/dashboard");
      } else {
        const redirectUrl = `${window.location.origin}/dashboard`;

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              display_name: name,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      let message = error.message;
      if (error.message.includes("User already registered")) {
        message = "This email is already registered. Please sign in instead.";
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // GOOGLE SIGN-IN IS DISABLED
  /*
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  */

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 accent-gradient p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary-foreground">
          <div className="w-10 h-10 rounded-lg bg-background/20 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <span className="font-serif text-2xl font-semibold">DocChat</span>
        </Link>

        <div className="space-y-6">
          <h1 className="font-serif text-4xl font-bold text-primary-foreground leading-tight">
            Chat with any document in seconds
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Upload PDFs, presentations, and documents. Get instant answers, summaries, and insights.
          </p>
        </div>

        <div className="flex items-center gap-8 text-primary-foreground/70 text-sm">
          <span>100+ page support</span>•<span>Multiple formats</span>•<span>Secure & private</span>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">Back to home</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="font-serif text-3xl font-bold">
              {isLogin ? t('auth.welcome_back') : t('auth.create_account')}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isLogin ? t('auth.sign_in_desc') : t('auth.sign_up_desc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.full_name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:underline">
                  {t('auth.forgot_password')}
                </button>
              </div>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Please wait...
                </>
              ) : isLogin ? t('auth.sign_in_button') : t('auth.create_account_button')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* GOOGLE BUTTON DISABLED */}
          {/* <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            …
            {isLoading ? "Signing in..." : t('auth.continue_google')}
          </Button> */}

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? t('auth.no_account') : t('auth.have_account')}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? t('auth.create_account_button') : t('auth.sign_in_button')}
            </button>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            <Trans i18nKey="auth.terms_privacy" components={{
              terms: <Link to="/terms" className="underline hover:text-foreground">{t('footer.terms')}</Link>,
              privacy: <Link to="/privacy" className="underline hover:text-foreground">{t('footer.privacy')}</Link>
            }} />
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
