import { useState } from "react";
import { MessageSquare, ArrowLeft, Mail, Send, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {

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

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold mb-4">Get in Touch</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have a question or feedback? We'd love to hear from you. Send us a message
              and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 justify-center">
            {/* Contact Info */}
            <div className="space-y-8 lg:col-start-2">
              <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                <div className="w-12 h-12 rounded-xl accent-gradient flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  For general inquiries and support
                </p>
                <a href="mailto:hello@docchat.com" className="text-primary hover:underline">
                  info@docchat.com
                </a>
              </div>

              <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-secondary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Response Time</h3>
                <p className="text-muted-foreground text-sm">
                  We typically respond within 24 hours during business days.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-secondary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Location</h3>
                <p className="text-muted-foreground text-sm">
                  San Francisco, CA<br />
                  United States
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;