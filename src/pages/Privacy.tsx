import { MessageSquare, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
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
        <h1 className="font-serif text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: November 30, 2024</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, 
              upload documents, or contact us for support. This includes your name, email address, 
              and the documents you choose to analyze.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services, 
              process your documents for AI analysis, send you technical notices and support messages, 
              and respond to your comments and questions.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">3. Document Processing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Documents you upload are processed securely to enable AI-powered chat functionality. 
              We do not store your documents permanently—they are processed in real-time and deleted 
              after your session ends unless you choose to save them to your account.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. All data 
              transmission is encrypted using industry-standard SSL/TLS protocols.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your account information for as long as your account is active. You can request 
              deletion of your account and associated data at any time by contacting our support team.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">6. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may use third-party services for analytics, payment processing, and AI model providers. 
              These services have their own privacy policies and we encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, correct, or delete your personal information. You may also 
              object to or restrict certain processing of your data. To exercise these rights, please 
              contact us at privacy@docchat.com.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@docchat.com" className="text-primary hover:underline">
                privacy@docchat.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;