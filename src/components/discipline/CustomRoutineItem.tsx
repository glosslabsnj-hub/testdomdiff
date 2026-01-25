import { useState } from "react";
import { Check, Clock, Trash2, Edit2, X, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { CustomRoutine } from "@/hooks/useCustomRoutines";

interface CustomRoutineItemProps {
  routine: CustomRoutine;
  completed: boolean;
  completionTime?: string;
  onToggle: () => void;
  onUpdate: (id: string, updates: { time_slot?: string; action_text?: string }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function CustomRoutineItem({
  routine,
  completed,
  completionTime,
  onToggle,
  onUpdate,
  onDelete,
}: CustomRoutineItemProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(routine.action_text);
  const [editTime, setEditTime] = useState(routine.time_slot);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    const success = await onUpdate(routine.id, {
      action_text: editText.trim(),
      time_slot: editTime,
    });
    setSaving(false);
    if (success) setEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(routine.id);
    setDeleting(false);
  };

  if (editing) {
    return (
      <div className="p-4 rounded-lg border border-primary/50 bg-primary/5 space-y-3">
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          placeholder="Task description"
          className="bg-charcoal"
          autoFocus
        />
        <Input
          value={editTime}
          onChange={(e) => setEditTime(e.target.value)}
          placeholder="Time (e.g., 8:00 AM)"
          className="bg-charcoal"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditText(routine.action_text);
              setEditTime(routine.time_slot);
              setEditing(false);
            }}
            disabled={saving}
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="gold"
            onClick={handleSave}
            disabled={saving || !editText.trim()}
            className="flex-1"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border transition-all",
        completed
          ? "bg-primary/10 border-primary/30"
          : "bg-charcoal/50 border-border/50 hover:border-primary/30"
      )}
    >
      {/* Custom badge indicator */}
      <div className="absolute -top-1 -left-1 hidden">
        <div className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
          <User className="w-2.5 h-2.5" /> Custom
        </div>
      </div>

      {/* Toggle button with accessible touch target */}
      <button
        onClick={onToggle}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 flex-shrink-0"
        aria-label={completed ? "Mark task incomplete" : "Mark task complete"}
      >
        <div
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
            completed ? "bg-primary border-primary" : "border-muted-foreground/50 hover:border-primary"
          )}
        >
          {completed && <Check className="w-4 h-4 text-primary-foreground" />}
        </div>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm font-semibold",
              completed && "line-through text-muted-foreground"
            )}
          >
            {routine.action_text}
          </p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground flex items-center gap-1">
            <User className="w-2.5 h-2.5" /> Custom
          </span>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <Clock className="w-3 h-3" /> {routine.time_slot}
        </p>
      </div>

      {/* Completion time */}
      {completed && completionTime && (
        <div className="flex items-center gap-1 text-xs text-primary">
          <Clock className="w-3 h-3" />
          {format(new Date(completionTime), "h:mm a")}
        </div>
      )}

      {/* Actions */}
      {!completed && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Edit task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            aria-label="Delete task"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
