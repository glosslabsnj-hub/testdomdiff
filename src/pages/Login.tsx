import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, Crown, Sparkles, User, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TRANSFORMATION_DURATION_DAYS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type PlanType = "membership" | "transformation" | "coaching";

const planOptions: { value: PlanType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "membership",
    label: "Solitary Confinement",
    icon: <User className="w-5 h-5" />,
    description: "$49.99/mo - The Foundation",
  },
  {
    value: "transformation",
    label: "General Population",
    icon: <Sparkles className="w-5 h-5" />,
    description: "$379.99 - One-Time",
  },
  {
    value: "coaching",
    label: "Free World Coaching",
    icon: <Crown className="w-5 h-5" />,
    description: "$999.99/mo - Limited Spots",
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

  // Determine if user is coming from checkout (plan already selected)
  const isFromCheckout = urlPlan && urlMode === "signup";

  const [isSignUp, setIsSignUp] = useState(urlMode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
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

  // Get the selected plan info for display
  const selectedPlanInfo = planOptions.find(p => p.value === selectedPlan) || planOptions[1];

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

    if (error) {
      console.error("Error creating dev subscription:", error);
      throw error;
    }
  };

  // Verify subscription exists and is readable before navigation
  const verifySubscription = async (userId: string, maxAttempts = 5): Promise<boolean> => {
    for (let i = 0; i < maxAttempts; i++) {
      const { data } = await supabase
        .from("subscriptions")
        .select("id, status")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      
      if (data) return true;
      await new Promise(r => setTimeout(r, 300)); // Wait 300ms between attempts
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setIsLoading(true);

    const safeEmail = email.trim().toLowerCase();

    if (isSignUp) {
      // Validate password confirmation
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (password.length < 8) {
        setPasswordError("Password must be at least 8 characters");
        setIsLoading(false);
        return;
      }

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
          
          // Verify subscription is readable before proceeding
          const verified = await verifySubscription(newUserId);
          if (!verified) {
            throw new Error("Subscription verification timed out");
          }
          
          // Mark that we just completed signup (for ProtectedRoute safety net)
          sessionStorage.setItem("rs_fresh_signup", "true");
          
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
                  <>Enter <span className="text-primary">The System</span></>
                ) : (
                  <>Check <span className="text-primary">Back In</span></>
                )}
              </h1>
              <p className="text-muted-foreground">
                {isSignUp 
                  ? "Begin processing to access your cell block" 
                  : "Re-enter the system to access your block"
                }
              </p>
              <div className="divider-gold mt-4" />
            </div>

            <div className="bg-card p-8 rounded-lg border border-border">
              {/* Show purchased plan confirmation when coming from checkout */}
              {isSignUp && isFromCheckout && (
                <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary text-primary-foreground">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Your Selected Block</p>
                      <p className="font-semibold text-foreground">{selectedPlanInfo.label}</p>
                      <p className="text-xs text-primary">{selectedPlanInfo.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dev Mode Banner - only show if NOT from checkout */}
              {isSignUp && !isFromCheckout && (
                <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-xs text-primary text-center font-medium">
                    🛠️ Processing Center — Select your block assignment
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                      <Link
                        to="/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot your access code?
                      </Link>
                    )}
                  </div>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError("");
                      }}
                      className={cn(
                        "bg-charcoal border-border pr-10",
                        passwordError && "border-destructive"
                      )}
                      placeholder="••••••••"
                      required
                      minLength={8}
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

                {/* Confirm Password (only for sign up) */}
                {isSignUp && (
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative mt-2">
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordError("");
                        }}
                        className={cn(
                          "bg-charcoal border-border pr-10",
                          passwordError && "border-destructive"
                        )}
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-sm text-destructive mt-2">{passwordError}</p>
                    )}
                  </div>
                )}

                {/* Plan Selection (only for sign up and NOT from checkout) */}
                {isSignUp && !isFromCheckout && (
                  <div>
                    <Label className="mb-3 block">Select Your Block</Label>
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
                      {isSignUp ? "Processing..." : "Re-entering..."}
                    </>
                  ) : (
                    isSignUp ? "Begin Processing" : "Re-Enter"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                {isSignUp ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setPasswordError("");
                      setConfirmPassword("");
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Already in the system? <span className="text-primary hover:underline">Re-Enter</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate("/programs")}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    New to the system? <span className="text-primary hover:underline">Choose Your Program</span>
                  </button>
                )}
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
