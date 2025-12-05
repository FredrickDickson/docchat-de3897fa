import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does DocChat ensure my document privacy?",
    answer: "We take security seriously. Your documents are encrypted both in transit and at rest. We automatically delete processed files after a set period, and we never use your data to train our models without your explicit permission."
  },
  {
    question: "What file formats do you support?",
    answer: "We support PDF, Microsoft Word (DOCX), PowerPoint (PPTX), and plain text files (TXT). We are constantly adding support for more formats."
  },
  {
    question: "Is there a limit to the file size?",
    answer: "Yes, currently we support files up to 100MB. For larger files, please contact our enterprise support team."
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Absolutely. You can cancel your subscription instantly from your dashboard. You will retain access until the end of your current billing period."
  },
  {
    question: "How accurate are the AI summaries?",
    answer: "Our AI models are state-of-the-art and highly accurate. However, we always recommend reviewing the original document for critical decisions, as AI can occasionally make mistakes."
  }
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showChat={false} />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about DocChat.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
