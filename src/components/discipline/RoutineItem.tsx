import { useState } from "react";
import { Check, Clock, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import RoutineTimeEditor from "./RoutineTimeEditor";

interface RoutineItemProps {
  id: string;
  actionText: string;
  timeSlot: string;
  description?: string | null;
  displayOrder: number;
  completed: boolean;
  completionTime?: string | null;
  onToggle: (id: string) => void;
  getTime: (displayOrder: number, defaultTime: string) => string;
  onSaveTime: (displayOrder: number, newTime: string) => Promise<void>;
}

export default function RoutineItem({
  id,
  actionText,
  timeSlot,
  description,
  displayOrder,
  completed,
  completionTime,
  onToggle,
  getTime,
  onSaveTime,
}: RoutineItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasDescription = description && description.trim().length > 0;

  return (
    <div
      className={cn(
        "w-full rounded-lg border transition-all",
        completed 
          ? "bg-primary/10 border-primary/30 animate-success-pulse" 
          : "bg-charcoal border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Checkbox - ONLY toggles completion */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(id);
          }}
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
            completed 
              ? "bg-primary border-primary animate-check-pop" 
              : "border-muted-foreground/50 hover:border-primary/70"
          )}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
        >
          {completed && <Check className="w-4 h-4 text-primary-foreground" />}
        </button>

        {/* Content area - expands for instructions */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1 min-w-0">
          <CollapsibleTrigger asChild>
            <button 
              className={cn(
                "w-full text-left flex items-center justify-between gap-2",
                hasDescription && "cursor-pointer"
              )}
              disabled={!hasDescription}
            >
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-semibold transition-all",
                  completed && "line-through text-muted-foreground"
                )}>
                  {actionText}
                </p>
                <RoutineTimeEditor
                  currentTime={getTime(displayOrder, timeSlot)}
                  onSave={(newTime) => onSaveTime(displayOrder, newTime)}
                />
              </div>
              {hasDescription && (
                <ChevronDown 
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform flex-shrink-0",
                    isOpen && "rotate-180"
                  )} 
                />
              )}
            </button>
          </CollapsibleTrigger>
          
          {hasDescription && (
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50">
                {description}
              </p>
            </CollapsibleContent>
          )}
        </Collapsible>

        {/* Completion timestamp */}
        {completed && completionTime && (
          <div className="flex items-center gap-1 text-xs text-primary flex-shrink-0">
            <Clock className="w-3 h-3" />
            {format(new Date(completionTime), "h:mm a")}
          </div>
        )}
      </div>
    </div>
  );
}
