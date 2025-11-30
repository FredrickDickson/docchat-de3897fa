import { FileText, Zap, Download, Shield, Globe, Sparkles } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning fast",
    description: "Get your summary in under 30 seconds, regardless of document length",
  },
  {
    icon: FileText,
    title: "100+ page support",
    description: "Handle massive PDFs up to 100MB with ease, including scanned documents",
  },
  {
    icon: Sparkles,
    title: "Context-aware AI",
    description: "Specialized for legal, finance, and academic documents with domain accuracy",
  },
  {
    icon: Download,
    title: "Multiple exports",
    description: "Download as TXT, CSV, JSON or push directly to Slack and Notion",
  },
  {
    icon: Shield,
    title: "Secure & private",
    description: "Your documents are encrypted and automatically deleted after processing",
  },
  {
    icon: Globe,
    title: "40+ languages",
    description: "Summarize documents in any language and get results in your preferred one",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Built for professionals
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every feature designed to save you time and deliver accurate insights
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
