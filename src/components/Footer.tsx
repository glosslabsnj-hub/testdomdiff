import { Link } from "react-router-dom";
import { Cross } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-charcoal-dark border-t border-border">
      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Cross className="w-6 h-6 text-primary" />
              <span className="font-display text-2xl tracking-wider">
                DOM <span className="text-primary">DIFFERENT</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md">
              Faith-based transformation coaching for men. Prison-proof discipline 
              meets God-led identity change. Built different.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg tracking-wider mb-4 text-primary">
              Programs
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/programs/membership"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Solitary Confinement
                </Link>
              </li>
              <li>
                <Link
                  to="/programs/transformation"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  General Population
                </Link>
              </li>
              <li>
                <Link
                  to="/programs/coaching"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Free World Coaching
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display text-lg tracking-wider mb-4 text-primary">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/disclaimer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Fitness Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Dom Different. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with faith. Forged through discipline.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
