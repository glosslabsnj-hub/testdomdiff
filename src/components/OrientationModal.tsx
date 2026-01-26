import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Play, 
  Dumbbell, 
  Clock, 
  Camera, 
  Users, 
  Book, 
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrientationStep {
  title: string;
  description: string;
  icon: React.ElementType;
  items: { label: string; description: string }[];
}

// Steps for Solitary Confinement (membership tier) - ONLY their features
const solitarySteps: OrientationStep[] = [
  {
    title: "Your Cell Operations",
    description: "Here's what you have access to in Solitary Confinement",
    icon: Play,
    items: [
      { label: "Intake Processing", description: "Your orientation hub - start here to get set up" },
      { label: "Yard Time", description: "4 bodyweight workout templates - no equipment needed" },
      { label: "Lights On/Out", description: "Morning and evening discipline routines" },
      { label: "Roll Call", description: "Weekly check-ins to track your progress" },
    ],
  },
  {
    title: "Daily Cell Block Routine",
    description: "Structure builds discipline, discipline builds freedom",
    icon: Clock,
    items: [
      { label: "Morning Routine", description: "Wake up with purpose - cold shower, prayer, movement" },
      { label: "Evening Routine", description: "Wind down right - reflection, gratitude, rest" },
      { label: "Time Served", description: "Track progress photos and measurements" },
      { label: "Basic Nutrition", description: "Simple meal guidance for your goals" },
    ],
  },
  {
    title: "Upgrading Your Status",
    description: "Ready for more? Here's what's waiting in Gen Pop",
    icon: Users,
    items: [
      { label: "The Sentence", description: "Upgrade to unlock the 12-week structured program" },
      { label: "Chapel", description: "Faith lessons and spiritual growth - Gen Pop only" },
      { label: "The Yard", description: "Community with your brothers - Gen Pop only" },
      { label: "Chow Hall", description: "Complete meal plans with macros - Gen Pop only" },
    ],
  },
];

// Steps for Gen Pop (transformation tier) - their full features
const genPopSteps: OrientationStep[] = [
  {
    title: "Welcome to Gen Pop",
    description: "You've got access to the full program. Here's how it works.",
    icon: Play,
    items: [
      { label: "Intake Processing", description: "Your orientation hub - start here to get set up" },
      { label: "The Sentence", description: "Your 12-week transformation program" },
      { label: "Yard Time", description: "Access your workout library and training" },
      { label: "Roll Call", description: "Weekly check-ins to track compliance" },
    ],
  },
  {
    title: "Daily Operations",
    description: "Structure builds discipline, discipline builds freedom",
    icon: Clock,
    items: [
      { label: "Lights On/Out", description: "Morning and evening routines to stay disciplined" },
      { label: "Chow Hall", description: "Complete nutrition plans with macros and recipes" },
      { label: "Chapel", description: "Weekly faith lessons and spiritual growth" },
      { label: "Time Served", description: "Track your progress over 12 weeks" },
    ],
  },
  {
    title: "Your Brotherhood",
    description: "You're not alone in here",
    icon: Users,
    items: [
      { label: "The Yard", description: "Connect with other inmates on the same journey" },
      { label: "The Warden", description: "Your AI coach - tap the shield icon anytime" },
      { label: "Progress Photos", description: "Document your transformation" },
      { label: "Work Release", description: "Skill-building for life on the outside" },
    ],
  },
];

const coachingSteps: OrientationStep[] = [
  {
    title: "Welcome Home, You're on Probation",
    description: "Dom is your parole officer. He's got your back and will help you succeed in your reintroduction to society.",
    icon: Play,
    items: [
      { label: "Welcome Home", description: "Your getting-started hub with orientation checklist" },
      { label: "Your Program", description: "Your personalized transformation journey" },
      { label: "Training Sessions", description: "Access your complete workout library" },
      { label: "Weekly Report", description: "Report to your P.O. each week" },
    ],
  },
  {
    title: "Daily Structure",
    description: "Probation means accountability. Build the habits that keep you free.",
    icon: Clock,
    items: [
      { label: "Daily Structure", description: "Morning and evening habit routines" },
      { label: "Meal Planning", description: "Nutrition guidance and templates" },
      { label: "Faith & Mindset", description: "Weekly growth and mindset lessons" },
      { label: "Progress Report", description: "Track your transformation metrics" },
    ],
  },
  {
    title: "Your Support System",
    description: "You've got a team now. Dom and your brothers have your back.",
    icon: Users,
    items: [
      { label: "The Network", description: "Connect with others on probation" },
      { label: "Your P.O. (Dom)", description: "Direct access to your parole officer" },
      { label: "Photo Gallery", description: "Document your new life" },
      { label: "Career Building", description: "Build legitimate income streams" },
    ],
  },
];

export default function OrientationModal() {
  const { subscription, profile, user, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const isCoaching = subscription?.plan_type === "coaching";
  const isTransformation = subscription?.plan_type === "transformation";
  const isMembership = subscription?.plan_type === "membership" || (!isCoaching && !isTransformation);
  
  // Select steps based on tier
  const steps = isCoaching ? coachingSteps : (isMembership ? solitarySteps : genPopSteps);

  // Check if user should see orientation
  useEffect(() => {
    if (!profile?.intake_completed_at) return;
    
    // Check if already dismissed in database
    if ((profile as any)?.orientation_dismissed) return;

    const intakeDate = new Date(profile.intake_completed_at);
    const daysSinceIntake = (Date.now() - intakeDate.getTime()) / (1000 * 60 * 60 * 24);

    // Only show to users within first 30 days who haven't dismissed it
    if (daysSinceIntake <= 30) {
      // Check localStorage as fallback (for older users before DB migration)
      const dismissed = localStorage.getItem("orientationModalDismissed");
      if (dismissed) return;
      
      // Small delay to let dashboard load first
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const handleDismiss = async () => {
    setOpen(false);
    
    // Save to database for persistence across devices
    if (user) {
      try {
        await supabase
          .from("profiles")
          .update({ orientation_dismissed: true })
          .eq("user_id", user.id);
        refreshProfile();
      } catch (e) {
        console.error("Error saving orientation dismissal:", e);
      }
    }
    
    // Keep localStorage as fallback
    localStorage.setItem("orientationModalDismissed", "true");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleDismiss()}>
      <DialogContent className="max-w-lg p-0 bg-card border-border overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-charcoal/80 hover:bg-charcoal text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/20">
              <StepIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Step {currentStep + 1} of {steps.length}
              </p>
              <h2 className="text-xl font-display font-bold">{currentStepData.title}</h2>
            </div>
          </div>
          <p className="text-muted-foreground">{currentStepData.description}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {currentStepData.items.map((item, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-charcoal/50 border border-border/50"
            >
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress dots and navigation */}
        <div className="p-6 border-t border-border bg-charcoal/30">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep 
                    ? "bg-primary w-6" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            <Button
              variant="gold"
              onClick={handleNext}
              className={cn("flex-1", currentStep === 0 && "w-full")}
            >
              {currentStep === steps.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Skip link */}
          <button
            onClick={handleDismiss}
            className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip orientation
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
