import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, Crown, Sparkles, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type PlanType = "membership" | "transformation" | "coaching";

const planOptions: { value: PlanType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "membership",
    label: "Monthly Membership",
    icon: <User className="w-5 h-5" />,
    description: "$79.99/mo - Ongoing access",
  },
  {
    value: "transformation",
    label: "12-Week Transformation",
    icon: <Sparkles className="w-5 h-5" />,
    description: "$749.99 - 98 days access",
  },
  {
    value: "coaching",
    label: "1:1 Coaching",
    icon: <Crown className="w-5 h-5" />,
    description: "$1,250/mo - Premium access",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, refreshSubscription } = useAuth();
  const { toast } = useToast();

  // Check URL params for mode and plan (from checkout redirect)
  const urlMode = searchParams.get("mode");
  const urlPlan = searchParams.get("plan") as PlanType | null;

  const [isSignUp, setIsSignUp] = useState(urlMode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    urlPlan && ["membership", "transformation", "coaching"].includes(urlPlan) 
      ? urlPlan 
      : "transformation"
  );

  // Update state if URL params change
  useEffect(() => {
    if (urlMode === "signup") {
      setIsSignUp(true);
    }
    if (urlPlan && ["membership", "transformation", "coaching"].includes(urlPlan)) {
      setSelectedPlan(urlPlan);
    }
  }, [urlMode, urlPlan]);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  const createDevSubscription = async (userId: string, planType: PlanType) => {
    const now = new Date();
    const expiresAt = planType === "transformation" 
      ? new Date(now.getTime() + 98 * 24 * 60 * 60 * 1000) // 98 days
      : null;

    const { error } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan_type: planType,
      status: "active",
      started_at: now.toISOString(),
      expires_at: expiresAt?.toISOString() || null,
    });

    if (error) {
      console.error("Error creating dev subscription:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const safeEmail = email.trim().toLowerCase();

    if (isSignUp) {
      // Sign up flow
      const { error, data } = await signUp(safeEmail, password);

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const newUserId = data?.user?.id ?? data?.session?.user?.id;

      if (newUserId) {
        try {
          // Create dev subscription
          await createDevSubscription(newUserId, selectedPlan);
          await refreshSubscription();
          
          toast({
            title: "Account Created!",
            description: `Welcome! You have ${selectedPlan} access. Complete your intake to continue.`,
          });
          
          // Navigate to intake
          navigate("/intake", { replace: true });
        } catch (err) {
          toast({
            title: "Subscription Error",
            description: "Account created but subscription failed. Please contact support.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Sign Up Error",
          description: "Account created but session was not established. Please try signing in.",
          variant: "destructive",
        });
      }
    } else {
      // Sign in flow
      const { error } = await signIn(safeEmail, password);

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });

      navigate(from, { replace: true });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20">
        <div className="section-container">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="headline-section mb-4">
                {isSignUp ? (
                  <>Create <span className="text-primary">Account</span></>
                ) : (
                  <>Welcome <span className="text-primary">Back</span></>
                )}
              </h1>
              <p className="text-muted-foreground">
                {isSignUp 
                  ? "Sign up to access your training portal" 
                  : "Sign in to access your dashboard"
                }
              </p>
              <div className="divider-gold mt-4" />
            </div>

            <div className="bg-card p-8 rounded-lg border border-border">
              {/* Dev Mode Banner */}
              {isSignUp && (
                <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-xs text-primary text-center font-medium">
                    🛠️ Development Mode — Select a plan to test dashboard access
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-charcoal border-border mt-2"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-charcoal border-border pr-10"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Plan Selection (only for sign up) */}
                {isSignUp && (
                  <div>
                    <Label className="mb-3 block">Select Test Plan</Label>
                    <div className="space-y-2">
                      {planOptions.map((plan) => (
                        <button
                          key={plan.value}
                          type="button"
                          onClick={() => setSelectedPlan(plan.value)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                            selectedPlan === plan.value
                              ? "border-primary bg-primary/10"
                              : "border-border bg-charcoal hover:border-primary/50"
                          }`}
                        >
                          <div className={`p-2 rounded-full ${
                            selectedPlan === plan.value 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {plan.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{plan.label}</p>
                            <p className="text-xs text-muted-foreground">{plan.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="gold"
                  size="xl"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isSignUp ? "Creating Account..." : "Signing in..."}
                    </>
                  ) : (
                    isSignUp ? "Create Account" : "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {isSignUp ? (
                    <>Already have an account? <span className="text-primary hover:underline">Sign In</span></>
                  ) : (
                    <>Don't have an account? <span className="text-primary hover:underline">Create Account</span></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;
