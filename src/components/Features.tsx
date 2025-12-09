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
    <section id="features" className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-3 sm:mb-4">
            {t('features_section.title')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            {t('features_section.subtitle')}
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
