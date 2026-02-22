import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { verifySubscription } from "@/lib/verifySubscription";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, refreshSubscription } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verify = async () => {
      if (!user?.id) {
        // Wait for auth to load
        return;
      }

      try {
        // Wait for webhook to process and subscription to appear
        const success = await verifySubscription(user.id);
        if (success) {
          setVerified(true);
          sessionStorage.setItem("rs_fresh_signup", "true");
          await refreshSubscription();
        }
      } catch {
        // Verification failed, but payment may still be processing
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [user?.id, refreshSubscription]);

  const handleContinue = () => {
    if (!profile?.intake_completed_at) {
      navigate("/intake", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20">
        <div className="section-container">
          <div className="max-w-md mx-auto text-center">
            {verifying ? (
              <>
                <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />
                <h1 className="headline-section mb-4">
                  Processing Your <span className="text-primary">Payment</span>
                </h1>
                <p className="text-muted-foreground">
                  Confirming your payment and setting up your access...
                </p>
              </>
            ) : verified ? (
              <>
                <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-primary" />
                <h1 className="headline-section mb-4">
                  Welcome to the <span className="text-primary">System</span>
                </h1>
                <p className="text-muted-foreground mb-8">
                  Your payment has been confirmed. Time to begin your transformation.
                </p>
                <Button variant="gold" size="xl" className="w-full" onClick={handleContinue}>
                  {!profile?.intake_completed_at ? "Complete Your Intake" : "Enter Your Cell Block"}
                </Button>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-primary" />
                <h1 className="headline-section mb-4">
                  Payment <span className="text-primary">Received</span>
                </h1>
                <p className="text-muted-foreground mb-4">
                  Your payment is being processed. Your access may take a moment to activate.
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  If your access isn't ready yet, try refreshing in a few seconds.
                </p>
                <div className="space-y-3">
                  <Button variant="gold" size="xl" className="w-full" onClick={handleContinue}>
                    Continue
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.reload()}
                  >
                    Refresh
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
