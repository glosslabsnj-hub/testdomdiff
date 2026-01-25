import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubStep } from "@/hooks/useRoutineSubSteps";
import SubStepItem from "./SubStepItem";
import { cn } from "@/lib/utils";

interface SubStepsListProps {
  subSteps: SubStep[];
  onToggle: (subStepId: string, isUserCreated: boolean) => void;
  onEdit: (subStepId: string, newText: string, isUserCreated: boolean) => Promise<boolean>;
  onDelete: (subStepId: string, isUserCreated: boolean) => Promise<boolean>;
  onAdd: (text: string) => Promise<boolean>;
  isCompleted: (subStepId: string) => boolean;
  soundEnabled?: boolean;
}

export default function SubStepsList({
  subSteps,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
  isCompleted,
  soundEnabled = true,
}: SubStepsListProps) {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newStepText, setNewStepText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newStepText.trim()) return;
    setAdding(true);
    const success = await onAdd(newStepText.trim());
    setAdding(false);
    if (success) {
      setNewStepText("");
      setShowAddInput(false);
    }
  };

  const completedCount = subSteps.filter(s => isCompleted(s.id)).length;
  const progress = subSteps.length > 0 ? Math.round((completedCount / subSteps.length) * 100) : 0;

  return (
    <div className="mt-3 pt-3 border-t border-border/30 space-y-2 animate-fade-in">
      {/* Progress indicator for sub-steps */}
      {subSteps.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1 bg-charcoal rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary/60 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{subSteps.length}
          </span>
        </div>
      )}

      {/* Sub-steps list */}
      {subSteps.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-2">
          No steps defined. Add your own below.
        </p>
      ) : (
        <div className="space-y-1">
          {subSteps.map((step) => (
            <SubStepItem
              key={step.id}
              subStep={step}
              completed={isCompleted(step.id)}
              onToggle={() => onToggle(step.id, step.is_user_created)}
              onEdit={(newText) => onEdit(step.id, newText, step.is_user_created)}
              onDelete={() => onDelete(step.id, step.is_user_created)}
              soundEnabled={soundEnabled}
            />
          ))}
        </div>
      )}

      {/* Add new step */}
      {showAddInput ? (
        <div className="flex items-center gap-2 pt-2">
          <Input
            value={newStepText}
            onChange={(e) => setNewStepText(e.target.value)}
            placeholder="Add a step..."
            className="flex-1 h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setShowAddInput(false);
                setNewStepText("");
              }
            }}
          />
          <Button
            size="sm"
            variant="gold"
            onClick={handleAdd}
            disabled={adding || !newStepText.trim()}
            className="h-8 px-3"
          >
            {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowAddInput(false);
              setNewStepText("");
            }}
            className="h-8 px-2"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddInput(true)}
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            "hover:text-primary transition-colors py-1"
          )}
        >
          <Plus className="h-3 w-3" />
          Add your own step
        </button>
      )}
    </div>
  );
}
