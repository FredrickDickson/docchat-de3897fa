import { ArrowRight, Sparkles, FileText, MessageSquare, Zap, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 hero-gradient relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 animate-fade-up">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium">{t('hero.badge')}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif leading-tight mb-4 sm:mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            {t('hero.title_start')}
            <br />
            <span className="text-primary">{t('hero.title_highlight')}</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-up px-4" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="lg" className="w-full sm:w-auto" onClick={handleGetStarted}>
              {user ? (
                <>
                  <Upload className="w-5 h-5" />
                  {t('hero.upload_button')}
                </>
              ) : (
                <>
                  {t('hero.start_free_button')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
          
          {!loading && !user && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              {t('hero.free_text')}
            </p>
          )}
        </div>
        
        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-2xl mx-auto mt-10 sm:mt-16 px-2 animate-fade-up" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-card px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm">{t('hero.pill_pdf')}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-card px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border">
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm">{t('hero.pill_natural')}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-card px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm">{t('hero.pill_instant')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
