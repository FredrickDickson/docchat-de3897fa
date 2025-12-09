import { Upload, Sparkles, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload your document",
    description: "Drag and drop any PDF, PowerPoint, or Word document. We handle files up to 100MB.",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "AI analyzes it",
    description: "Our AI reads and understands the full context, structure, and key information.",
  },
  {
    icon: MessageSquare,
    step: "03",
    title: "Start chatting",
    description: "Ask questions, request summaries, or explore specific sections naturally.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-3 sm:mb-4">
            How it works
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            From upload to insight in under 30 seconds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.step} className="relative text-center">
              {/* Connector line - only on desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-border" />
              )}
              
              <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-card border border-border shadow-soft mb-4 sm:mb-6">
                <step.icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                <span className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full accent-gradient text-primary-foreground text-xs sm:text-sm font-bold flex items-center justify-center">
                  {step.step}
                </span>
              </div>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
