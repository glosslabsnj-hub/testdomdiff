import { useState } from "react";
import { Check, Pencil, Trash2, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubStep } from "@/hooks/useRoutineSubSteps";
import jailSounds from "@/lib/sounds";

interface SubStepItemProps {
  subStep: SubStep;
  completed: boolean;
  onToggle: () => void;
  onEdit: (newText: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  soundEnabled?: boolean;
}

export default function SubStepItem({
  subStep,
  completed,
  onToggle,
  onEdit,
  onDelete,
  soundEnabled = true,
}: SubStepItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(subStep.action_text);
  const [saving, setSaving] = useState(false);

  const handleToggle = () => {
    if (!completed && soundEnabled) {
      jailSounds.tap({ enabled: soundEnabled });
    }
    onToggle();
  };

  const handleSave = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    const success = await onEdit(editText.trim());
    setSaving(false);
    if (success) setIsEditing(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    await onDelete();
    setSaving(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 bg-charcoal rounded border border-primary/30">
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="flex-1 h-8 text-sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-3.5 w-3.5 text-primary" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => setIsEditing(false)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 py-2 px-3 rounded transition-all",
        completed 
          ? "bg-primary/5 text-muted-foreground" 
          : "hover:bg-charcoal/50"
      )}
    >
      {/* Mini checkbox */}
      <button
        onClick={handleToggle}
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0",
          completed
            ? "bg-primary/80 border-primary animate-check-pop"
            : "border-muted-foreground/40 hover:border-primary/60"
        )}
      >
        {completed && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
      </button>

      {/* Text */}
      <span
        className={cn(
          "flex-1 text-sm transition-all",
          completed && "line-through opacity-60"
        )}
      >
        {subStep.action_text}
      </span>

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => {
            setEditText(subStep.action_text);
            setIsEditing(true);
          }}
          className="p-1 text-muted-foreground hover:text-primary"
          title="Edit step"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={handleDelete}
          disabled={saving}
          className="p-1 text-muted-foreground hover:text-destructive"
          title="Remove step"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* User-created badge */}
      {subStep.is_user_created && (
        <span className="text-[10px] text-primary/60 uppercase tracking-wider">
          Custom
        </span>
      )}
    </div>
  );
}
