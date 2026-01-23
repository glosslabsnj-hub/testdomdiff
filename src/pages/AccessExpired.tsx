import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, RefreshCw, ArrowRight, LogOut } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AccessExpired = () => {
  const navigate = useNavigate();
  const { user, subscription, signOut, hasAccess } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // If user regains access, redirect to dashboard
  useEffect(() => {
    if (hasAccess) {
      navigate("/dashboard");
    }
  }, [hasAccess, navigate]);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    navigate("/");
  };

  const getExpiredMessage = () => {
    if (!subscription) {
      return {
        title: "No Active Subscription",
        message: "You don't have an active subscription. Choose a program to get started.",
      };
    }

    switch (subscription.plan_type) {
      case "transformation":
        return {
          title: "Your 12-Week Program Has Ended",
          message: "Congratulations on completing your transformation! Continue your journey with the Discipline Membership.",
          renewText: "Continue with Membership",
          renewLink: "/programs/membership",
        };
      case "membership":
        return {
          title: "Membership Cancelled",
          message: "Your Discipline Membership has been cancelled. Renew to regain access to your dashboard.",
          renewText: "Renew Membership",
          renewLink: "/checkout?plan=membership",
        };
      case "coaching":
        return {
          title: "Coaching Subscription Ended",
          message: "Your 1:1 Coaching subscription has been cancelled. Renew to continue working directly with Dom.",
          renewText: "Renew Coaching",
          renewLink: "/checkout?plan=coaching",
        };
      default:
        return {
          title: "Access Expired",
          message: "Your subscription has expired. Choose a plan to regain access.",
        };
    }
  };

  const expiredInfo = getExpiredMessage();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20">
        <div className="section-container">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <Clock className="w-10 h-10 text-primary" />
            </div>

            <h1 className="headline-section mb-4">
              {expiredInfo.title}
            </h1>
            
            <p className="text-muted-foreground text-lg mb-8">
              {expiredInfo.message}
            </p>

            <div className="divider-gold mb-8" />

            <div className="space-y-4">
              {expiredInfo.renewLink ? (
                <Link to={expiredInfo.renewLink}>
                  <Button variant="gold" size="xl" className="w-full gap-2">
                    <RefreshCw className="w-5 h-5" />
                    {expiredInfo.renewText}
                  </Button>
                </Link>
              ) : (
                <Link to="/programs">
                  <Button variant="gold" size="xl" className="w-full gap-2">
                    View Programs <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              )}

              <Link to="/programs">
                <Button variant="outline" size="lg" className="w-full gap-2 mt-4">
                  Explore All Programs
                </Button>
              </Link>

              <Button
                variant="ghost"
                onClick={handleSignOut}
                disabled={isLoading}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>

            {/* Support info */}
            <div className="mt-12 p-6 bg-card rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                Need help? Contact us at{" "}
                <a href="mailto:support@domdifferent.com" className="text-primary hover:underline">
                  support@domdifferent.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AccessExpired;
