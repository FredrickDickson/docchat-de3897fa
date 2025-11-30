import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold">DocChat</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link to="/privacy" className="text-background/70 hover:text-background transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-background/70 hover:text-background transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-background/70 hover:text-background transition-colors">
              Contact
            </Link>
          </nav>

          <p className="text-sm text-background/50">
            © 2024 DocChat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
