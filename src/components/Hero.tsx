import { ArrowRight, Sparkles, FileText, MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="pt-32 pb-20 hero-gradient relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-foreground px-4 py-2 rounded-full mb-6 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Document Intelligence</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Chat with any
            <br />
            <span className="text-primary">document.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Turn PDFs, presentations, and documents into interactive conversations. 
            Ask questions, get summaries, and extract insights in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" onClick={onGetStarted}>
              Start chatting free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="soft" size="xl">
              Watch demo
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            5 free chats daily • No credit card required
          </p>
        </div>
        
        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto mt-16 animate-fade-up" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm">PDFs & Documents</span>
          </div>
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm">Natural Conversations</span>
          </div>
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm">Instant Answers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
