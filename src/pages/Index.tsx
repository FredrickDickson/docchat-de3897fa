import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import DocumentChat from "@/components/DocumentChat";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import { Testimonials } from "@/components/landing/Testimonials";
import { SampleSummaries } from "@/components/landing/SampleSummaries";

const Index = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header showChat={showChat} />
      
      {showChat ? (
        <DocumentChat onBack={() => setShowChat(false)} />
      ) : (
        <>
          <Hero onGetStarted={() => setShowChat(true)} />
          <Features />
          <SampleSummaries />
          <HowItWorks />
          <Testimonials />
          <Pricing />
          <Footer />
        </>
      )}
    </div>
  );
};

export default Index;
