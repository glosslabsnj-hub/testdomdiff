import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, loading, dataLoaded, refreshSubscription } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (loading) return;

    const verify = async () => {
      if (!sessionId) {
        setError("No session ID found");
        setVerifying(false);
        return;
      }

      if (!user?.id) {
        setError("Please log in to complete your setup");
        setVerifying(false);
        return;
      }

      try {
        const res = await supabase.functions.invoke("verify-checkout-session", {
          body: { sessionId, userId: user.id },
        });

        if (res.error) {
          const errMsg = typeof res.error === "object"
            ? (res.error as any).message || JSON.stringify(res.error)
            : String(res.error);
          setError(errMsg);
        } else if (res.data?.success) {
          setVerified(true);
          sessionStorage.setItem("rs_fresh_signup", "true");
          await refreshSubscription();
        } else if (res.data?.error) {
          setError(res.data.error);
        } else {
          setError("Unexpected response from server");
        }
      } catch (err: any) {
        setError(err?.message || "Verification failed");
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [user?.id, sessionId, loading]);

  const getNextPath = () => {
    if (!profile?.intake_completed_at) return "/intake";
    return "/dashboard";
  };

  const handleContinue = () => {
    navigate(getNextPath(), { replace: true });
  };

  // Auto-redirect after successful verification
  useEffect(() => {
    if (verified) {
      const timer = setTimeout(() => {
        navigate(getNextPath(), { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [verified, profile]);

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
                <p className="text-muted-foreground mb-4">
                  Your payment has been confirmed. Time to begin your transformation.
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  Redirecting you now...
                </p>
                <Button variant="gold" size="xl" className="w-full" onClick={handleContinue}>
                  {!profile?.intake_completed_at ? "Complete Your Intake" : "Enter Your Cell Block"}
                </Button>
              </>
            ) : error ? (
              <>
                <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
                <h1 className="headline-section mb-4">
                  Almost <span className="text-primary">There</span>
                </h1>
                <p className="text-muted-foreground mb-4">
                  {!user
                    ? "Please log in to activate your access."
                    : "Your access is being set up. This can take a few seconds."}
                </p>
                <div className="space-y-3">
                  {!user ? (
                    <Button variant="gold" size="xl" className="w-full" onClick={() => navigate("/login", { replace: true })}>
                      Log In to Continue
                    </Button>
                  ) : (
                    <Button variant="gold" size="xl" className="w-full" onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    If this keeps happening, contact support@domdifferent.com
                  </p>
                </div>
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
