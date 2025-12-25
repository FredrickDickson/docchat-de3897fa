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
import { Separator } from "@/components/ui/separator"; // Uncommented for the "Or continue with" divider



const Auth = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();

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

  // Google Sign-in handler (restored)
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // Note: Supabase OAuth will automatically redirect after successful sign-in
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 accent-gradient p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2 text-primary-foreground">
            <div className="w-10 h-10 rounded-lg bg-background/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="font-serif text-2xl font-semibold">DocChat</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="font-serif text-4xl font-bold text-primary-foreground leading-tight">
            Chat with any document in seconds
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Upload PDFs, presentations, and documents. Get instant answers, summaries, and insights through natural conversation.
          </p>
        </div>

        <div className="flex items-center gap-8 text-primary-foreground/70 text-sm">
          <span>100+ page support</span>
          <span>•</span>
          <span>Multiple formats</span>
          <span>•</span>
          <span>Secure & private</span>
        </div>
      </div>

      {/* Right side - Auth form */}
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

          {/* Restored Google Sign-in Button */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.84c-.25 1.31-.98 2.42-2.07 3.16v2.63h3.35c1.96-1.81 3.1-4.47 3.1-7.99z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.35-2.63c-.98.66-2.23 1.06-3.93 1.06-3.02 0-5.58-2.04-6.49-4.78H.96v2.67C2.77 20.39 7.01 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.51 14.22c-.23-.66-.36-1.37-.36-2.22s.13-1.56.36-2.22V7.15H.96C.35 8.57 0 10.22 0 12s.35 3.43.96 4.85l4.55-2.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 4.98c1.66 0 3.14.57 4.31 1.69l3.23-3.23C17.46 1.98 14.97 1 12 1 7.01 1 2.77 3.61.96 7.15l4.55 2.63C6.42 7.02 8.98 4.98 12 4.98z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

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