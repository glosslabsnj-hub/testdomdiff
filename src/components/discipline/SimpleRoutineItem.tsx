import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import jailSounds from "@/lib/sounds";

interface SimpleRoutineItemProps {
  id: string;
  actionText: string;
  timeSlot?: string;
  completed: boolean;
  completionTime?: string | null;
  onToggle: (id: string) => void;
  isCustom?: boolean;
  soundEnabled?: boolean;
}

export default function SimpleRoutineItem({
  id,
  actionText,
  timeSlot,
  completed,
  completionTime,
  onToggle,
  isCustom = false,
  soundEnabled = true,
}: SimpleRoutineItemProps) {
  const [justCompleted, setJustCompleted] = useState(false);

  const handleToggle = () => {
    if (!completed) {
      jailSounds.complete({ enabled: soundEnabled });
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 600);
    }
    onToggle(id);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200",
        completed
          ? "bg-primary/10"
          : "hover:bg-muted/30",
        justCompleted && "animate-success-pulse"
      )}
    >
      {/* Checkbox with 44x44 touch target */}
      <button
        onClick={handleToggle}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 flex-shrink-0"
        aria-label={completed ? "Mark incomplete" : "Mark complete"}
      >
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
            completed
              ? "bg-primary border-primary"
              : "border-muted-foreground/40 hover:border-primary/70"
          )}
        >
          {completed && (
            <Check
              className={cn(
                "w-3 h-3 text-primary-foreground",
                justCompleted && "animate-check-pop"
              )}
            />
          )}
        </div>
      </button>

      {/* Task title */}
      <span
        className={cn(
          "flex-1 text-sm font-medium transition-all",
          completed && "line-through text-muted-foreground"
        )}
      >
        {actionText}
        {isCustom && (
          <span className="ml-2 text-[10px] text-muted-foreground/60 uppercase">
            custom
          </span>
        )}
      </span>

      {/* Time display - subtle */}
      {timeSlot && !completed && (
        <span className="text-xs text-muted-foreground/60 flex-shrink-0">
          {timeSlot}
        </span>
      )}

      {/* Completion time */}
      {completed && completionTime && (
        <div className="flex items-center gap-1 text-xs text-primary flex-shrink-0">
          <Clock className="w-3 h-3" />
          {format(new Date(completionTime), "h:mm a")}
        </div>
      )}
    </div>
  );
}
