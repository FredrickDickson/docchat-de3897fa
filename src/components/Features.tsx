import { FileText, MessageSquare, Download, Shield, Globe, Sparkles } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: MessageSquare,
      title: t('features_section.items.natural_conversations.title'),
      description: t('features_section.items.natural_conversations.description'),
    },
    {
      icon: FileText,
      title: t('features_section.items.universal_format.title'),
      description: t('features_section.items.universal_format.description'),
    },
    {
      icon: Sparkles,
      title: t('features_section.items.instant_summaries.title'),
      description: t('features_section.items.instant_summaries.description'),
    },
    {
      icon: Download,
      title: t('features_section.items.export_share.title'),
      description: t('features_section.items.export_share.description'),
    },
    {
      icon: Shield,
      title: t('features_section.items.security.title'),
      description: t('features_section.items.security.description'),
    },
    {
      icon: Globe,
      title: t('features_section.items.multi_language.title'),
      description: t('features_section.items.multi_language.description'),
    },
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            {t('features_section.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('features_section.subtitle')}
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
