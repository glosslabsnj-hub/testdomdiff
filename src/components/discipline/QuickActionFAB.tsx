import { useState, useEffect } from "react";
import { Check, ChevronUp, Zap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import jailSounds from "@/lib/sounds";
import { useAuth } from "@/contexts/AuthContext";

interface RoutineTask {
  id: string;
  actionText: string;
  timeSlot: string;
  routineType: "morning" | "evening";
}

interface QuickActionFABProps {
  morningRoutines: Array<{ id: string; action_text: string; time_slot: string }>;
  eveningRoutines: Array<{ id: string; action_text: string; time_slot: string }>;
  isCompleted: (id: string) => boolean;
  onComplete: (id: string) => void;
  soundEnabled?: boolean;
}

export default function QuickActionFAB({
  morningRoutines,
  eveningRoutines,
  isCompleted,
  onComplete,
  soundEnabled = true,
}: QuickActionFABProps) {
  const { subscription } = useAuth();
  const [celebrating, setCelebrating] = useState(false);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Get tier-aware completion message
  const getCompletionMessage = () => {
    switch (subscription?.plan_type) {
      case "coaching":
        return "Training earned.";
      case "transformation":
        return "Sentence continues.";
      default:
        return "Iron earned.";
    }
  };

  // Find the next uncompleted task
  const getNextTask = (): RoutineTask | null => {
    const now = new Date();
    const isAfternoon = now.getHours() >= 12;

    // Prioritize based on time of day
    const primaryList = isAfternoon ? eveningRoutines : morningRoutines;
    const secondaryList = isAfternoon ? morningRoutines : eveningRoutines;
    const primaryType = isAfternoon ? "evening" : "morning";
    const secondaryType = isAfternoon ? "morning" : "evening";

    // Check primary list first
    for (const routine of primaryList) {
      if (!isCompleted(routine.id)) {
        return {
          id: routine.id,
          actionText: routine.action_text,
          timeSlot: routine.time_slot,
          routineType: primaryType,
        };
      }
    }

    // Then secondary list
    for (const routine of secondaryList) {
      if (!isCompleted(routine.id)) {
        return {
          id: routine.id,
          actionText: routine.action_text,
          timeSlot: routine.time_slot,
          routineType: secondaryType,
        };
      }
    }

    return null;
  };

  const nextTask = getNextTask();
  const allComplete = !nextTask;

  // Count remaining tasks
  const remainingMorning = morningRoutines.filter(r => !isCompleted(r.id)).length;
  const remainingEvening = eveningRoutines.filter(r => !isCompleted(r.id)).length;
  const totalRemaining = remainingMorning + remainingEvening;

  const handleComplete = () => {
    if (!nextTask || celebrating) return;

    // Play jail sound
    jailSounds.cellDoor({ enabled: soundEnabled });

    // Trigger celebration
    setCelebrating(true);
    setJustCompleted(nextTask.id);

    // Complete the task
    onComplete(nextTask.id);

    // After celebration, advance to next
    setTimeout(() => {
      setCelebrating(false);
      setJustCompleted(null);
    }, 1500);
  };

  // Play whistle when all complete
  useEffect(() => {
    if (allComplete && totalRemaining === 0 && morningRoutines.length + eveningRoutines.length > 0) {
      jailSounds.whistle({ enabled: soundEnabled });
    }
  }, [allComplete]);

  // Don't show if no routines at all
  if (morningRoutines.length === 0 && eveningRoutines.length === 0) {
    return null;
  }

  // Minimized state
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={cn(
          // Position above Warden FAB (which is at bottom-20 mobile, bottom-6 desktop)
          "fixed bottom-36 right-4 z-50 md:bottom-20",
          "w-12 h-12 rounded-full",
          "bg-charcoal border-2 border-primary/50",
          "flex items-center justify-center",
          "shadow-lg shadow-black/30",
          "transition-all hover:border-primary hover:scale-105"
        )}
      >
        {allComplete ? (
          <Lock className="w-5 h-5 text-primary" />
        ) : (
          <>
            <Zap className="w-5 h-5 text-primary" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {totalRemaining}
            </span>
          </>
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        // Position above Warden FAB (which is at bottom-20 mobile, bottom-6 desktop)
        "fixed bottom-36 right-4 z-50 md:bottom-20",
        "w-72 max-w-[calc(100vw-2rem)]",
        "transition-all duration-300"
      )}
    >
      {/* Card container */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl",
          "bg-charcoal/95 backdrop-blur-sm",
          "border-2 transition-all duration-300",
          celebrating 
            ? "border-primary shadow-[0_0_30px_rgba(212,175,55,0.4)] animate-pulse-gold" 
            : allComplete 
              ? "border-success/50 shadow-lg"
              : "border-primary/40 shadow-xl shadow-black/40",
          !celebrating && !allComplete && "animate-pulse-gold"
        )}
      >
        {/* Iron bar overlay for jail theme */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-4 w-0.5 h-full bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
          <div className="absolute top-0 right-4 w-0.5 h-full bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Quick Action
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!allComplete && (
              <span className="text-xs text-muted-foreground">
                {totalRemaining} left
              </span>
            )}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {allComplete ? (
            // All complete state
            <div className="text-center py-2">
              <div className={cn(
                "w-14 h-14 mx-auto mb-3 rounded-full",
                "bg-success/20 border-2 border-success",
                "flex items-center justify-center",
                "animate-iron-slam"
              )}>
                <Lock className="w-7 h-7 text-success" />
              </div>
              <p className="font-display text-lg text-success">LOCKED IN</p>
              <p className="text-xs text-muted-foreground mt-1">
                All routines complete. {getCompletionMessage()}
              </p>
            </div>
          ) : celebrating ? (
            // Celebration state
            <div className="text-center py-2">
              <div className={cn(
                "w-14 h-14 mx-auto mb-3 rounded-full",
                "bg-primary/20 border-2 border-primary",
                "flex items-center justify-center",
                "animate-iron-slam"
              )}>
                <Check className="w-7 h-7 text-primary" />
              </div>
              <p className="font-display text-lg text-primary animate-fade-in">
                LOCKED IN
              </p>
              <p className="text-xs text-muted-foreground mt-1 animate-fade-in">
                {totalRemaining > 0 
                  ? `${totalRemaining} more to go` 
                  : "All done!"}
              </p>
            </div>
          ) : (
            // Next task state
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {nextTask?.routineType === "morning" ? "AM Routine" : "PM Routine"} • {nextTask?.timeSlot}
              </p>
              <p className="font-semibold text-foreground mb-4 leading-tight">
                {nextTask?.actionText}
              </p>
              <Button
                onClick={handleComplete}
                variant="gold"
                className="w-full gap-2 font-display tracking-wide"
              >
                <Check className="w-4 h-4" />
                LOCK IT IN
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
