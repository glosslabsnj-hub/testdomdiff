import { Link } from "react-router-dom";
import { Check, ArrowRight, Dumbbell, Clock, Utensils, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";

interface SetupCompleteStepProps {
  onComplete: () => void;
}

export default function SetupCompleteStep({ onComplete }: SetupCompleteStepProps) {
  const { isCoaching, isMembership } = useEffectiveSubscription();

  const nextSteps = [
    {
      icon: Dumbbell,
      title: isMembership ? "Start Yard Time" : "Begin Day 1",
      description: "Your first workout is ready",
      href: isMembership ? "/dashboard/workouts" : "/dashboard/program",
    },
    {
      icon: Clock,
      title: "Complete Morning Routine",
      description: "Start building daily discipline",
      href: "/dashboard/discipline",
    },
    {
      icon: Utensils,
      title: "Check Today's Meals",
      description: "See your meal plan for today",
      href: "/dashboard/nutrition",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Celebration Icon */}
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-primary animate-pulse" />
          <Sparkles className="absolute -bottom-1 -left-3 w-6 h-6 text-primary animate-pulse delay-300" />
        </div>

        <h1 className="text-3xl font-bold mb-4">
          You're <span className="text-primary">Ready</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {isCoaching 
            ? "Welcome to the Free World. Dom's got your back."
            : "Your setup is complete. Time to serve your sentence."}
        </p>

        {/* Next Steps */}
        <div className="space-y-3 mb-8">
          {nextSteps.map((step) => {
            const StepIcon = step.icon;
            return (
              <Link
                key={step.href}
                to={step.href}
                className="flex items-center gap-4 p-4 rounded-lg bg-charcoal border border-border hover:border-primary/50 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <StepIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            );
          })}
        </div>

        {/* Main CTA */}
        <Button 
          variant="hero" 
          size="hero" 
          onClick={onComplete}
          className="w-full gap-2"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
