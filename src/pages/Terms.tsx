import { MessageSquare, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg accent-gradient flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold">DocChat</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-serif text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: November 30, 2024</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using DocChat, you agree to be bound by these Terms of Service and all 
              applicable laws and regulations. If you do not agree with any of these terms, you are 
              prohibited from using or accessing this service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              DocChat provides an AI-powered document analysis service that allows users to upload 
              documents and interact with them through natural language conversations. The service 
              includes document parsing, AI-powered responses, and export functionality.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and 
              for all activities that occur under your account. You must immediately notify us of any 
              unauthorized use of your account or any other breach of security.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to use the service to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Upload documents containing illegal content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for any fraudulent or malicious purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain all rights to the documents you upload. By using our service, you grant us 
              a limited license to process your documents solely for the purpose of providing the 
              service. We do not claim ownership of your content.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">6. Payment and Subscriptions</h2>
            <p className="text-muted-foreground leading-relaxed">
              Paid subscriptions are billed in advance on a monthly basis. You may cancel your 
              subscription at any time, and you will continue to have access until the end of your 
              current billing period. Refunds are provided at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              DocChat is provided "as is" without warranties of any kind. We shall not be liable for 
              any indirect, incidental, special, consequential, or punitive damages resulting from 
              your use of the service or any AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">8. AI-Generated Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              The AI responses provided by DocChat are generated automatically and should not be 
              considered as professional advice. Users should verify important information 
              independently. We are not responsible for decisions made based on AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to terminate or suspend your account at any time for violations 
              of these terms or for any other reason at our sole discretion. Upon termination, your 
              right to use the service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will provide notice of 
              significant changes by posting the new terms on this page. Your continued use of the 
              service after such changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">11. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:legal@docchat.com" className="text-primary hover:underline">
                legal@docchat.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;