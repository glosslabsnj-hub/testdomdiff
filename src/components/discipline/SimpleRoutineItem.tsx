import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import jailSounds from "@/lib/sounds";

interface SimpleRoutineItemProps {
  id: string;
  actionText: string;
  timeSlot?: string;
  displayOrder?: number;
  completed: boolean;
  completionTime?: string | null;
  onToggle: (id: string) => void;
  onSaveTime?: (displayOrder: number, newTime: string) => Promise<void>;
  isCustom?: boolean;
  soundEnabled?: boolean;
}

export default function SimpleRoutineItem({
  id,
  actionText,
  timeSlot,
  displayOrder,
  completed,
  completionTime,
  onToggle,
  onSaveTime,
  isCustom = false,
  soundEnabled = true,
}: SimpleRoutineItemProps) {
  const [justCompleted, setJustCompleted] = useState(false);
  const [editingTime, setEditingTime] = useState(false);
  const [tempTime, setTempTime] = useState(timeSlot || "");

  const handleToggle = () => {
    if (!completed) {
      jailSounds.complete({ enabled: soundEnabled });
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 600);
    }
    onToggle(id);
  };

  const handleSaveTime = async () => {
    if (onSaveTime && displayOrder !== undefined && tempTime.trim()) {
      await onSaveTime(displayOrder, tempTime.trim());
    }
    setEditingTime(false);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 min-h-[56px]",
        completed
          ? "bg-primary/10"
          : "hover:bg-muted/30",
        justCompleted && "animate-success-pulse"
      )}
    >
      {/* Checkbox with 48x48 touch target for better mobile UX */}
      <button
        onClick={handleToggle}
        className="min-w-[48px] min-h-[48px] flex items-center justify-center -m-2 flex-shrink-0 touch-manipulation"
        aria-label={completed ? "Mark incomplete" : "Mark complete"}
      >
        <div
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
            completed
              ? "bg-primary border-primary"
              : "border-muted-foreground/40 hover:border-primary/70"
          )}
        >
          {completed && (
            <Check
              className={cn(
                "w-3.5 h-3.5 text-primary-foreground",
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

      {/* Editable time display */}
      {timeSlot && !completed && (
        onSaveTime && displayOrder !== undefined ? (
          <Popover open={editingTime} onOpenChange={setEditingTime}>
            <PopoverTrigger asChild>
              <button 
                className="text-xs text-muted-foreground/60 hover:text-primary transition-colors flex-shrink-0"
                onClick={() => {
                  setTempTime(timeSlot);
                  setEditingTime(true);
                }}
              >
                {timeSlot}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" align="end">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Edit time</p>
                <Input
                  value={tempTime}
                  onChange={(e) => setTempTime(e.target.value)}
                  placeholder="e.g., 6:00 AM"
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTime();
                    if (e.key === "Escape") setEditingTime(false);
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 h-7"
                    onClick={() => setEditingTime(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="gold"
                    className="flex-1 h-7"
                    onClick={handleSaveTime}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <span className="text-xs text-muted-foreground/60 flex-shrink-0">
            {timeSlot}
          </span>
        )
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
