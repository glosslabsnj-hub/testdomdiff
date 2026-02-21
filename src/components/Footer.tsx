import { useState } from "react";
import { Link } from "react-router-dom";
import { Cross, Instagram, Youtube, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("email-subscribe", {
        body: { email: email.trim() },
      });
      if (error) throw error;

      toast({ title: "You're in.", description: "Weekly discipline drops incoming." });
      setEmail("");
    } catch {
      toast({
        title: "Couldn't subscribe",
        description: "Try again or email support@domdifferent.com.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-charcoal-dark border-t border-border">
      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand + Email Capture */}
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Cross className="w-6 h-6 text-primary" />
              <span className="font-display text-2xl tracking-wider">
                DOM <span className="text-primary">DIFFERENT</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md mb-6">
              Faith-based transformation coaching for men. Prison-proof discipline
              meets God-led identity change. Built different.
            </p>

            {/* Email Signup */}
            <form onSubmit={handleEmailSubscribe} className="flex gap-2 max-w-sm">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border"
                required
              />
              <Button type="submit" variant="gold" size="default" disabled={isSubmitting}>
                {isSubmitting ? "..." : <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              Weekly discipline tips. No spam. Unsubscribe anytime.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.instagram.com/dom_different"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@domdifferent"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="mailto:support@domdifferent.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email support"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Programs */}
          <div className="md:col-span-3">
            <h4 className="font-display text-lg tracking-wider mb-4 text-primary">
              Programs
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/checkout?plan=membership"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Solitary Confinement
                </Link>
              </li>
              <li>
                <Link
                  to="/checkout?plan=transformation"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  General Population
                </Link>
              </li>
              <li>
                <Link
                  to="/checkout?plan=coaching"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Free World Coaching
                </Link>
              </li>
              <li>
                <Link
                  to="/book-call"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Book a Call
                </Link>
              </li>
            </ul>
          </div>

          {/* Company + Legal */}
          <div className="md:col-span-2">
            <h4 className="font-display text-lg tracking-wider mb-4 text-primary">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Dom
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  Commissary
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display text-lg tracking-wider mb-4 text-primary">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-muted-foreground hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-muted-foreground hover:text-primary transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Bar + Bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Secure Payments</span>
              </div>
              <span>|</span>
              <span>support@domdifferent.com</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Dom Different. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
