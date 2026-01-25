import { useState, useEffect } from "react";
import { Zap, Lock, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { useAuth } from "@/contexts/AuthContext";
import { jailSounds } from "@/lib/sounds";
import { useLocation } from "react-router-dom";

interface RoutineTask {
  id: string;
  actionText: string;
  timeSlot: string;
  routineType: "morning" | "evening";
}

interface GlobalQuickActionProps {
  compact?: boolean;
  onExpandChange?: (isExpanded: boolean) => void;
  className?: string;
}

export function GlobalQuickAction({ 
  compact = false, 
  onExpandChange,
  className 
}: GlobalQuickActionProps) {
  const { user, subscription } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [soundEnabled] = useState(true);

  const {
    morningRoutines,
    eveningRoutines,
    isRoutineCompleted,
    toggleRoutineCompletion,
    loading,
  } = useDailyDiscipline();

  // Don't show on the discipline page (it has its own FAB)
  const isDisciplinePage = location.pathname.startsWith("/dashboard/discipline");

  // Count remaining tasks
  const allRoutines = [...morningRoutines, ...eveningRoutines];
  const remainingCount = allRoutines.filter(r => !isRoutineCompleted(r.id)).length;
  const allComplete = remainingCount === 0 && allRoutines.length > 0;

  // Get the next uncompleted task
  const getNextTask = (): RoutineTask | null => {
    const hour = new Date().getHours();
    
    // Priority: current time of day, then the other
    const routinesToCheck = hour < 12 
      ? [...morningRoutines, ...eveningRoutines]
      : [...eveningRoutines, ...morningRoutines];

    for (const routine of routinesToCheck) {
      if (!isRoutineCompleted(routine.id)) {
        return {
          id: routine.id,
          actionText: routine.action_text,
          timeSlot: routine.time_slot,
          routineType: routine.routine_type,
        };
      }
    }
    return null;
  };

  const nextTask = getNextTask();

  // Handle expand toggle
  const handleExpandToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpandChange?.(newState);
  };

  // Handle task completion
  const handleComplete = async () => {
    if (!nextTask) return;

    // Play sound
    if (soundEnabled) {
      jailSounds.cellDoor();
    }

    // Show celebration
    setCelebrating(true);
    
    // Toggle completion
    await toggleRoutineCompletion(nextTask.id);
    
    // Reset celebration after delay
    setTimeout(() => {
      setCelebrating(false);
    }, 1500);
  };

  // Play whistle when all complete
  useEffect(() => {
    if (allComplete && soundEnabled) {
      jailSounds.whistle();
    }
  }, [allComplete, soundEnabled]);

  // Only show for authenticated users with active subscription
  // Don't show if loading or no routines
  if (!user || !subscription || isDisciplinePage || loading || allRoutines.length === 0) return null;

  // Compact mode: just show a small pill
  if (compact || !isExpanded) {
    return (
      <button
        onClick={handleExpandToggle}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full",
          "bg-charcoal-dark border border-gold/30 shadow-lg",
          "hover:border-gold/50 transition-all duration-200",
          allComplete && "border-green-500/50",
          className
        )}
        aria-label={allComplete ? "All routines complete" : `${remainingCount} routines remaining`}
      >
        {allComplete ? (
          <>
            <Lock className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium text-green-500">Locked In</span>
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 text-gold" />
            <span className="text-xs font-medium text-gold">{remainingCount} left</span>
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          </>
        )}
      </button>
    );
  }

  // Expanded mode: show full card
  return (
    <div
      className={cn(
        "w-72 rounded-xl overflow-hidden shadow-xl",
        "bg-charcoal-dark border border-gold/30",
        "animate-scale-in",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-charcoal border-b border-gold/20">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-gold" />
          <span className="text-sm font-semibold text-gold">Quick Action</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{remainingCount} remaining</span>
          <button
            onClick={handleExpandToggle}
            className="p-1 hover:bg-charcoal-light rounded transition-colors"
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {celebrating ? (
          // Celebration state
          <div className="flex flex-col items-center justify-center py-4 animate-iron-slam">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-6 w-6 text-green-500 animate-check-pop" />
            </div>
            <p className="text-sm font-bold text-green-500">LOCKED IN</p>
          </div>
        ) : allComplete ? (
          // All complete state
          <div className="flex flex-col items-center justify-center py-4">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
              <Lock className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-sm font-semibold text-green-500">All Routines Complete</p>
            <p className="text-xs text-muted-foreground mt-1">Yard time earned.</p>
          </div>
        ) : nextTask ? (
          // Next task
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {nextTask.routineType === "morning" ? "Lights On" : "Lights Out"} • {nextTask.timeSlot}
              </p>
              <p className="text-sm font-medium text-foreground mt-1 line-clamp-2">
                {nextTask.actionText}
              </p>
            </div>
            <Button
              onClick={handleComplete}
              className="w-full bg-gold hover:bg-gold-light text-charcoal-dark font-bold"
              size="sm"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              LOCK IT IN
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default GlobalQuickAction;
