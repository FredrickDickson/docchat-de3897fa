import { FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold">SummarizeIt</span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <a href="#" className="text-background/70 hover:text-background transition-colors">
              Privacy
            </a>
            <a href="#" className="text-background/70 hover:text-background transition-colors">
              Terms
            </a>
            <a href="#" className="text-background/70 hover:text-background transition-colors">
              Contact
            </a>
          </nav>

          <p className="text-sm text-background/50">
            © 2024 SummarizeIt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
