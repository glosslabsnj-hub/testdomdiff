import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Lock, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plan = searchParams.get("plan") || "transformation";
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = {
    membership: {
      name: "Discipline Membership",
      price: "$79.99",
      period: "/month",
      description: "Monthly structure and accountability",
    },
    transformation: {
      name: "12-Week Transformation",
      price: "$749.99",
      period: "one-time",
      description: "Complete 12-week transformation program",
    },
    coaching: {
      name: "1:1 Redemption Coaching",
      price: "$1,250",
      period: "/month",
      description: "Maximum accountability with direct access",
    },
  };

  const selectedPlan = plans[plan as keyof typeof plans] || plans.transformation;

  const handleCheckout = async () => {
    setIsProcessing(true);
    // Stripe integration placeholder
    // In production, this would redirect to Stripe Checkout
    setTimeout(() => {
      setIsProcessing(false);
      // Navigate to login with signup mode and selected plan
      navigate(`/login?mode=signup&plan=${plan}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20">
        <div className="section-container">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="headline-section mb-4">
                Complete Your <span className="text-primary">Order</span>
              </h1>
              <div className="divider-gold" />
            </div>

            {/* Order Summary */}
            <div className="bg-charcoal p-8 rounded-lg border border-border mb-8">
              <h2 className="headline-card mb-4">Order Summary</h2>
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <p className="font-semibold">{selectedPlan.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-display text-primary">{selectedPlan.price}</p>
                  <p className="text-sm text-muted-foreground">{selectedPlan.period}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-4 font-bold">
                <span>Total</span>
                <span className="text-primary text-xl">{selectedPlan.price}</span>
              </div>
            </div>

            {/* Plan Selection */}
            <div className="bg-charcoal p-6 rounded-lg border border-border mb-8">
              <p className="text-sm text-muted-foreground mb-4">Select a different plan:</p>
              <div className="space-y-3">
                {Object.entries(plans).map(([key, planInfo]) => (
                  <button
                    key={key}
                    onClick={() => navigate(`/checkout?plan=${key}`)}
                    className={`w-full p-4 rounded-lg border transition-all text-left flex items-center justify-between ${
                      plan === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{planInfo.name}</p>
                      <p className="text-sm text-muted-foreground">{planInfo.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-primary">{planInfo.price}</p>
                      <p className="text-xs text-muted-foreground">{planInfo.period}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stripe Checkout Placeholder */}
            <div className="bg-charcoal p-8 rounded-lg border border-border mb-8">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Payment Information</h3>
              </div>
              
              {/* Placeholder for Stripe Elements */}
              <div className="space-y-4">
                <div className="p-4 bg-background rounded border border-border text-center text-muted-foreground">
                  <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm">Stripe Payment Integration</p>
                  <p className="text-xs mt-1">Secure payment processing will be configured here</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Secure checkout powered by Stripe</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              variant="gold"
              size="xl"
              className="w-full"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : `Pay ${selectedPlan.price}`}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              After payment, you'll complete a required intake form to access your dashboard.
            </p>

            {/* What happens next */}
            <div className="mt-8 p-6 bg-charcoal rounded-lg border border-border">
              <h4 className="font-semibold mb-4">What happens next:</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <p className="text-sm text-muted-foreground">Complete your payment securely</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <p className="text-sm text-muted-foreground">Fill out the required intake form</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <p className="text-sm text-muted-foreground">Get instant access to your dashboard</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;
