import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Play, CheckSquare, Dumbbell, Crown, Calendar, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalytics } from "@/hooks/useAnalytics";

const IntakeComplete = () => {
  const { subscription } = useAuth();
  const { trackIntakeComplete } = useAnalytics();
  const isCoaching = subscription?.plan_type === "coaching";
  const isTransformation = subscription?.plan_type === "transformation";

  // Track intake completion (Lead conversion event)
  useEffect(() => {
    trackIntakeComplete();
  }, []);

  // Pre-generate onboarding video for this tier (fire and forget)
  useEffect(() => {
    const tierKey = isCoaching ? "coaching" : isTransformation ? "transformation" : "membership";
    
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tier-onboarding-generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ tier_key: tierKey }),
    }).catch((err) => console.error("Video pre-generation error:", err));
  }, [isCoaching, isTransformation]);

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
