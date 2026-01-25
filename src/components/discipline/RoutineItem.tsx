import { useState } from "react";
import { Check, Clock, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import RoutineTimeEditor from "./RoutineTimeEditor";
import SubStepsList from "./SubStepsList";
import { SubStep } from "@/hooks/useRoutineSubSteps";
import jailSounds from "@/lib/sounds";

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
  // Sub-steps props
  subSteps?: SubStep[];
  onSubStepToggle?: (subStepId: string, isUserCreated: boolean) => void;
  onSubStepEdit?: (subStepId: string, newText: string, isUserCreated: boolean) => Promise<boolean>;
  onSubStepDelete?: (subStepId: string, isUserCreated: boolean) => Promise<boolean>;
  onSubStepAdd?: (text: string) => Promise<boolean>;
  isSubStepCompleted?: (subStepId: string) => boolean;
  soundEnabled?: boolean;
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
  subSteps = [],
  onSubStepToggle,
  onSubStepEdit,
  onSubStepDelete,
  onSubStepAdd,
  isSubStepCompleted,
  soundEnabled = true,
}: RoutineItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  
  const hasDescription = description && description.trim().length > 0;
  const hasSubSteps = subSteps.length > 0 || onSubStepAdd;
  const isExpandable = hasDescription || hasSubSteps;

  const handleToggle = () => {
    if (!completed) {
      // Play sound and trigger animation
      jailSounds.complete({ enabled: soundEnabled });
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 600);
    }
    onToggle(id);
  };

  return (
    <div
      className={cn(
        "w-full rounded-lg border transition-all duration-300",
        completed 
          ? "bg-primary/10 border-primary/30" 
          : "bg-charcoal border-border hover:border-primary/50",
        justCompleted && "animate-success-pulse"
      )}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Checkbox - ONLY toggles completion */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
            completed 
              ? "bg-primary border-primary" 
              : "border-muted-foreground/50 hover:border-primary/70"
          )}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
        >
          {completed && (
            <Check className={cn(
              "w-4 h-4 text-primary-foreground",
              justCompleted && "animate-check-pop"
            )} />
          )}
        </button>

        {/* Content area - expands for instructions/sub-steps */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1 min-w-0">
          <CollapsibleTrigger asChild>
            <button 
              className={cn(
                "w-full text-left flex items-center justify-between gap-2",
                isExpandable && "cursor-pointer"
              )}
              disabled={!isExpandable}
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
              {isExpandable && (
                <ChevronDown 
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
                    isOpen && "rotate-180"
                  )} 
                />
              )}
            </button>
          </CollapsibleTrigger>
          
          {isExpandable && (
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              {/* Description section */}
              {hasDescription && (
                <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50">
                  {description}
                </p>
              )}
              
              {/* Sub-steps section */}
              {(hasSubSteps && onSubStepToggle && onSubStepEdit && onSubStepDelete && onSubStepAdd && isSubStepCompleted) && (
                <SubStepsList
                  subSteps={subSteps}
                  onToggle={onSubStepToggle}
                  onEdit={onSubStepEdit}
                  onDelete={onSubStepDelete}
                  onAdd={onSubStepAdd}
                  isCompleted={isSubStepCompleted}
                  soundEnabled={soundEnabled}
                />
              )}
            </CollapsibleContent>
          )}
        </Collapsible>

        {/* Completion timestamp */}
        {completed && completionTime && (
          <div className="flex items-center gap-1 text-xs text-primary flex-shrink-0 animate-bar-slide">
            <Clock className="w-3 h-3" />
            {format(new Date(completionTime), "h:mm a")}
          </div>
        )}
      </div>
    </div>
  );
}
