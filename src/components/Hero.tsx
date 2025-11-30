import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
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
            Read less.
            <br />
            <span className="text-primary">Understand more.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Transform 50+ page PDFs into concise summaries in seconds. 
            Save hours of reading time with AI that understands context.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl">
              Start summarizing free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="soft" size="xl">
              See it in action
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            3 free summaries daily • No credit card required
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 animate-fade-up" style={{ animationDelay: "0.5s" }}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-serif font-bold text-primary">70%</div>
            <div className="text-sm text-muted-foreground mt-1">Time saved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-serif font-bold text-primary">10k+</div>
            <div className="text-sm text-muted-foreground mt-1">PDFs summarized</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-serif font-bold text-primary">98%</div>
            <div className="text-sm text-muted-foreground mt-1">Accuracy rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
