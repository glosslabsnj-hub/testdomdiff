import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Clock, 
  Dumbbell, 
  Utensils, 
  Camera, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Sun,
  Moon,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSetupProgress } from "@/hooks/useSetupProgress";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { fireVictoryConfetti } from "@/lib/confetti";

// Import step components
import WelcomeVideoStep from "./steps/WelcomeVideoStep";
import ScheduleStep from "./steps/ScheduleStep";
import TrainingPreviewStep from "./steps/TrainingPreviewStep";
import NutritionPreviewStep from "./steps/NutritionPreviewStep";
import PhotosStep from "./steps/PhotosStep";
import SetupCompleteStep from "./steps/SetupCompleteStep";

const STEPS = [
  { id: 0, title: "Welcome", icon: Play, description: "Watch Dom's welcome message" },
  { id: 1, title: "Schedule", icon: Clock, description: "Set your daily routine times" },
  { id: 2, title: "Training", icon: Dumbbell, description: "Preview your workouts" },
  { id: 3, title: "Nutrition", icon: Utensils, description: "Review your meal plan" },
  { id: 4, title: "Photos", icon: Camera, description: "Document your starting point" },
];

interface SetupWizardProps {
  onComplete: () => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const { currentStep, updateStep, completeSetup, isLoading } = useSetupProgress();
  const { isCoaching, isMembership, isTransformation } = useEffectiveSubscription();
  const [activeStep, setActiveStep] = useState(currentStep);
  const [canProceed, setCanProceed] = useState(false);
  const navigate = useNavigate();

  // Sync active step with saved progress
  useEffect(() => {
    if (currentStep > 0 && currentStep < 5) {
      setActiveStep(currentStep);
    }
  }, [currentStep]);

  const handleNext = async () => {
    if (activeStep < 4) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      await updateStep.mutateAsync(nextStep);
      setCanProceed(false);
    } else {
      // Complete setup
      await completeSetup.mutateAsync();
      fireVictoryConfetti();
      setActiveStep(5); // Show completion screen
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    navigate("/dashboard");
  };

  // Get tier-specific content
  const getTierLabel = () => {
    if (isCoaching) return "Free World";
    if (isTransformation) return "General Population";
    return "Solitary";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show completion screen
  if (activeStep === 5) {
    return <SetupCompleteStep onComplete={handleComplete} />;
  }

  const progressPercent = ((activeStep) / 5) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="section-container py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs text-primary uppercase tracking-widest">{getTierLabel()} Setup</span>
              <h1 className="text-lg font-bold text-foreground">
                Step {activeStep + 1} of 5: {STEPS[activeStep].title}
              </h1>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{Math.round(progressPercent)}%</span>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isComplete = idx < activeStep;
              const isCurrent = idx === activeStep;
              
              return (
                <div 
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center gap-1",
                    isComplete && "text-primary",
                    isCurrent && "text-primary",
                    !isComplete && !isCurrent && "text-muted-foreground/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                    isComplete && "bg-primary border-primary",
                    isCurrent && "border-primary bg-primary/10",
                    !isComplete && !isCurrent && "border-muted-foreground/30"
                  )}>
                    {isComplete ? (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="section-container py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeStep === 0 && (
              <WelcomeVideoStep onReady={() => setCanProceed(true)} />
            )}
            {activeStep === 1 && (
              <ScheduleStep onReady={() => setCanProceed(true)} />
            )}
            {activeStep === 2 && (
              <TrainingPreviewStep onReady={() => setCanProceed(true)} />
            )}
            {activeStep === 3 && (
              <NutritionPreviewStep onReady={() => setCanProceed(true)} />
            )}
            {activeStep === 4 && (
              <PhotosStep onReady={() => setCanProceed(true)} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={activeStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            
            <Button
              variant="gold"
              onClick={handleNext}
              disabled={!canProceed}
              className="gap-2 min-w-[140px]"
            >
              {activeStep === 4 ? (
                <>
                  Complete Setup
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
