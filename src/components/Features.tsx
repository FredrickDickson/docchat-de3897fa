import { FileText, MessageSquare, Download, Shield, Globe, Sparkles } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Natural conversations",
    description: "Ask questions in plain English and get intelligent, context-aware answers instantly",
  },
  {
    icon: FileText,
    title: "Any document format",
    description: "PDFs, PowerPoints, Word docs—upload any document up to 100MB with ease",
  },
  {
    icon: Sparkles,
    title: "Smart analysis",
    description: "AI understands context, extracts key insights, and identifies important information",
  },
  {
    icon: Download,
    title: "Export anywhere",
    description: "Download summaries as TXT, or share insights directly to Slack and Notion",
  },
  {
    icon: Shield,
    title: "Secure & private",
    description: "Your documents are encrypted and automatically deleted after processing",
  },
  {
    icon: Globe,
    title: "40+ languages",
    description: "Chat about documents in any language and get responses in your preferred one",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Document intelligence, reimagined
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stop skimming. Start understanding. Every feature designed to help you extract value from documents faster.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl border border-border bg-card hover:shadow-card transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
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
