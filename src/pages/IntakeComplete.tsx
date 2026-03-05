import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Play, CheckSquare, Dumbbell, Crown, Calendar, MessageCircle } from "lucide-react";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { useAnalytics } from "@/hooks/useAnalytics";
import { supabase } from "@/integrations/supabase/client";

const IntakeComplete = () => {
  const { isCoaching, isTransformation, isTestingFlow } = useEffectiveSubscription();
  const { trackIntakeComplete } = useAnalytics();

  // Track intake completion (Lead conversion event) — skip during admin test flow
  useEffect(() => {
    if (!isTestingFlow) trackIntakeComplete();
  }, [isTestingFlow]);

  // Pre-generate onboarding video for this tier (fire and forget) — skip during test flow
  useEffect(() => {
    if (isTestingFlow) return;
    const tierKey = isCoaching ? "coaching" : isTransformation ? "transformation" : "membership";

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tier-onboarding-generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ tier_key: tierKey }),
    }).catch((err) => console.error("Video pre-generation error:", err));
  }, [isCoaching, isTransformation, isTestingFlow]);

  // Generate personalized plans (fire and forget)
  // Gen Pop: direct plan generation. Free World: generate options for Dom to review.
  useEffect(() => {
    if (!isTransformation && !isCoaching) return;

    const generatePlans = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      };

      console.log(`Generating plans for user ${user.id} (coaching: ${isCoaching}, test flow: ${isTestingFlow})`);

      const regen = isTestingFlow;

      if (isCoaching) {
        // Free World: generate plan OPTIONS for Dom to review (workout + meal)
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-coaching-options`, {
          method: "POST",
          headers,
          body: JSON.stringify({ userId: user.id, planType: "workout" }),
        }).catch((err) => console.error("Coaching workout options error:", err));

        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-coaching-options`, {
          method: "POST",
          headers,
          body: JSON.stringify({ userId: user.id, planType: "meal" }),
        }).catch((err) => console.error("Coaching meal options error:", err));
      } else {
        // Gen Pop: direct plan generation (3 phases + meal plan)
        for (const phase of ["foundation", "build", "peak"]) {
          fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-workout-plan`, {
            method: "POST",
            headers,
            body: JSON.stringify({ userId: user.id, regenerate: regen, phase }),
          }).catch((err) => console.error(`Workout ${phase} generation error:`, err));
        }

        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-meal-plan`, {
          method: "POST",
          headers,
          body: JSON.stringify({ userId: user.id, regenerate: regen }),
        }).catch((err) => console.error("Meal plan generation error:", err));
      }
    };

    generatePlans();
  }, [isTransformation, isCoaching, isTestingFlow]);

  // Tier-specific content
  const getTierContent = () => {
    if (isCoaching) {
      return {
        title: "Welcome Aboard",
        subtitle: "You're officially in the Free World. Dom is your P.O. now.",
        description: "Your personalized coaching journey begins. Let's get to work.",
        steps: [
          {
            icon: Play,
            title: "Watch Dom's Welcome Video",
            description: "Get a personal message from your coach",
          },
          {
            icon: CheckSquare,
            title: "Complete Your Orientation",
            description: "Quick walkthrough of your Free World features",
          },
          {
            icon: Calendar,
            title: "Book Your First Call",
            description: "Schedule a 1:1 session with Dom",
          },
        ],
        primaryCta: {
          label: "Enter The Free World",
          href: "/onboarding",
          icon: Crown,
        },
      };
    }

    if (isTransformation) {
      return {
        title: "Processing Complete",
        subtitle: "You're officially on the inside. Your cell block is ready.",
        description: "Time to serve your 12-week sentence. Build different.",
        steps: [
          {
            icon: Play,
            title: "Watch Dom's Welcome Video",
            description: "Get a personal message from your coach",
          },
          {
            icon: CheckSquare,
            title: "Complete Your Orientation",
            description: "Quick walkthrough of your program features",
          },
          {
            icon: Calendar,
            title: "Start Week 1 of The Sentence",
            description: "Your 12-week transformation begins now",
          },
        ],
        primaryCta: {
          label: "Enter General Population",
          href: "/onboarding",
          icon: ArrowRight,
        },
      };
    }

    // Membership (Solitary)
    return {
      title: "Processing Complete",
      subtitle: "You're officially in Solitary. Your cell is ready.",
      description: "Time to build discipline with bodyweight training.",
      steps: [
        {
          icon: Play,
          title: "Watch Dom's Welcome Video",
          description: "Get a personal message from your coach",
        },
        {
          icon: CheckSquare,
          title: "Complete Your Orientation",
          description: "Quick walkthrough of your Solitary features",
        },
        {
          icon: Dumbbell,
          title: "Start Your First Workout",
          description: "Jump into Yard Time when you're ready",
        },
      ],
      primaryCta: {
        label: "Enter Solitary Confinement",
        href: "/onboarding",
        icon: ArrowRight,
      },
    };
  };

  const content = getTierContent();
  const PrimaryIcon = content.primaryCta.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="section-container py-20">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="headline-section mb-4">
            {content.title.split(" ")[0]}{" "}
            <span className="text-primary">{content.title.split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            {content.subtitle}
          </p>
          <p className="text-muted-foreground mb-8">
            {content.description}
          </p>
          <div className="bg-charcoal p-8 rounded-lg border border-border mb-8">
            <h3 className="headline-card mb-4">What's Next:</h3>
            <ul className="text-left space-y-4">
              {content.steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <StepIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex justify-center">
            <Button variant="hero" size="hero" asChild>
              <Link to={content.primaryCta.href} className="gap-2">
                {content.primaryCta.label} <PrimaryIcon className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeComplete;
