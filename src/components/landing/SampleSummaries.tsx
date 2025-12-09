import { FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const samples = [
  {
    title: "Legal Contract Summary",
    type: "Legal",
    description: "A complex 50-page service agreement summarized into key terms, obligations, and termination clauses.",
    features: ["Risk Analysis", "Key Dates", "Obligations"]
  },
  {
    title: "Financial Report Analysis",
    type: "Finance",
    description: "Quarterly earnings report broken down into revenue highlights, growth metrics, and future outlook.",
    features: ["Revenue Data", "YoY Growth", "Market Outlook"]
  },
  {
    title: "Academic Paper Abstract",
    type: "Research",
    description: "Technical research paper summarized to explain methodology, results, and practical implications.",
    features: ["Methodology", "Key Findings", "Citations"]
  }
];

export const SampleSummaries = () => {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl mb-4 sm:mb-6">
              See What's Possible
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground md:text-xl mb-6 sm:mb-8">
              From legal contracts to academic papers, our AI understands context and nuance. 
              Get accurate, readable summaries in seconds.
            </p>
            <div className="flex flex-col gap-3 sm:gap-4">
              {samples.map((sample, index) => (
                <div key={index} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                  <div className="mt-0.5 sm:mt-1 flex-shrink-0">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg">{sample.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">{sample.description}</p>
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                      {sample.features.map((feature, i) => (
                        <span key={i} className="inline-flex items-center text-[10px] sm:text-xs font-medium text-primary bg-primary/5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                          <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 sm:mt-8">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/auth">Try It Yourself</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
            <div className="relative bg-card border shadow-2xl rounded-xl overflow-hidden">
              <div className="bg-muted/50 border-b p-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="ml-4 h-6 w-64 bg-background rounded-md" />
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <span className="text-xl">✨</span> AI Summary
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    The document outlines the terms of service for the software platform. 
                    Key points include:
                    <br />• User data privacy and protection measures
                    <br />• Subscription cancellation policies (30-day notice)
                    <br />• Intellectual property rights retention
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
