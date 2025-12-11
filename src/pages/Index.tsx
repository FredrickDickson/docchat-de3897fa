import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import { Testimonials } from "@/components/landing/Testimonials";
import { SampleSummaries } from "@/components/landing/SampleSummaries";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <SampleSummaries />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
