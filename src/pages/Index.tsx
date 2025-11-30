import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PDFUploader from "@/components/PDFUploader";
import SummaryResult from "@/components/SummaryResult";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

// Mock summary for demo - in production this would come from AI
const MOCK_SUMMARY = `This document provides a comprehensive analysis of market trends and strategic recommendations for Q4 2024. The key findings indicate a 23% growth opportunity in the digital transformation sector, with particular emphasis on AI-driven automation solutions.

The report identifies three primary action items: First, investing in cloud infrastructure to support scalable operations. Second, developing strategic partnerships with established technology providers. Third, implementing data-driven decision-making processes across all departments.

Financial projections suggest a potential revenue increase of $2.4M annually if recommendations are implemented within the proposed timeline. The risk assessment indicates moderate market volatility but strong fundamentals for long-term growth.`;

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const handleFileSelect = async (file: File) => {
    setFileName(file.name);
    setIsProcessing(true);
    
    // Simulate AI processing - in production, this would call your API
    await new Promise((resolve) => setTimeout(resolve, 2500));
    
    setSummary(MOCK_SUMMARY);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setSummary(null);
    setFileName("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {summary ? (
        <div className="pt-16">
          <SummaryResult 
            summary={summary} 
            fileName={fileName} 
            onReset={handleReset} 
          />
        </div>
      ) : (
        <>
          <Hero />
          <PDFUploader 
            onFileSelect={handleFileSelect} 
            isProcessing={isProcessing} 
          />
        </>
      )}
      
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
