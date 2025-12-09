import { FileText, MessageSquare, Download, Shield, Globe, Sparkles } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Natural Conversations",
    description: "Ask questions about your documents in plain English. Our AI understands context, nuance, and specific terminology for accurate answers.",
  },
  {
    icon: FileText,
    title: "Universal Format Support",
    description: "Upload PDFs, Word documents, PowerPoints, and text files. Perfect for legal contracts, financial statements, and research papers.",
  },
  {
    icon: Sparkles,
    title: "Instant Summaries",
    description: "Get concise summaries of long documents instantly. Choose from brief overviews to detailed breakdowns of key points and arguments.",
  },
  {
    icon: Download,
    title: "Export & Share",
    description: "Download your summaries and chat history as TXT or PDF. Share insights directly with your team via Slack, Notion, or email.",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description: "Your data is encrypted at rest and in transit. Documents are automatically processed and can be deleted immediately after use.",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Upload documents in any language and chat in your preferred language. Break down language barriers in international business.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-3 sm:mb-4">
            Document intelligence, reimagined
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            Stop skimming. Start understanding. Every feature designed to help you extract value from documents faster.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-4 sm:p-6 rounded-2xl border border-border bg-card hover:shadow-card transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
