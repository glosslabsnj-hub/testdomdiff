import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TRANSFORMATION_DURATION_DAYS } from "@/lib/constants";

type PlanType = "membership" | "transformation" | "coaching";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, refreshSubscription } = useAuth();
  const { toast } = useToast();

  const planParam = searchParams.get("plan");
  const plan: PlanType =
    planParam === "membership" || planParam === "transformation" || planParam === "coaching"
      ? planParam
      : "transformation";
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = {
    membership: {
      name: "Solitary Confinement",
      price: "$19.99",
      period: "/month",
      description: "The foundation — essentials only",
    },
    transformation: {
      name: "General Population",
      price: "$299.99",
      period: "one-time",
      description: "Earn your place — full program access",
    },
    coaching: {
      name: "Free World 1:1 Coaching",
      price: "$999.99",
      period: "/month",
      description: "Live free with direct access to Dom",
    },
  };

  const selectedPlan = plans[plan as keyof typeof plans] || plans.transformation;

  const createDevSubscription = async (userId: string, planType: PlanType) => {
    const now = new Date();
    const expiresAt = planType === "transformation"
      ? new Date(now.getTime() + TRANSFORMATION_DURATION_DAYS * 24 * 60 * 60 * 1000)
      : null;

    const { error } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan_type: planType,
      status: "active",
      started_at: now.toISOString(),
      expires_at: expiresAt?.toISOString() || null,
    });

    if (error) throw error;
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Stripe integration placeholder
      // In production, this would redirect to Stripe Checkout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // If not logged in, start at account creation
      if (!user) {
        navigate(`/login?mode=signup&plan=${plan}`);
        return;
      }

      // Dev mode: create subscription for existing logged-in user
      await createDevSubscription(user.id, plan);
      await refreshSubscription();

      // Keep your required flow: intake must be completed after purchase
      if (!profile?.intake_completed_at) {
        navigate("/intake", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      toast({
        title: "Checkout Error",
        description: err?.message || "Unable to complete checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
