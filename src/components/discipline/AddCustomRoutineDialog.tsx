import { useState } from "react";
import { Plus, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AddCustomRoutineDialogProps {
  routineType: "morning" | "evening";
  onAdd: (data: { 
    routine_type: "morning" | "evening"; 
    time_slot: string; 
    action_text: string;
    duration_minutes: number;
    description: string | null;
  }) => Promise<boolean>;
}

export default function AddCustomRoutineDialog({ routineType, onAdd }: AddCustomRoutineDialogProps) {
  const [open, setOpen] = useState(false);
  const [actionText, setActionText] = useState("");
  const [timeSlot, setTimeSlot] = useState(routineType === "morning" ? "6:00 AM" : "9:00 PM");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionText.trim()) return;

    setSaving(true);
    const success = await onAdd({
      routine_type: routineType,
      time_slot: timeSlot,
      action_text: actionText.trim(),
      duration_minutes: 10, // Default duration
      description: null,
    });
    setSaving(false);

    if (success) {
      setActionText("");
      setTimeSlot(routineType === "morning" ? "6:00 AM" : "9:00 PM");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "w-full mt-3 py-2 px-3 rounded-lg border border-dashed text-sm",
            "flex items-center justify-center gap-2 transition-colors",
            "text-muted-foreground hover:text-foreground",
            routineType === "morning"
              ? "border-primary/30 hover:border-primary/50 hover:bg-primary/5"
              : "border-secondary/30 hover:border-secondary/50 hover:bg-secondary/5"
          )}
        >
          <Plus className="w-4 h-4" />
          Add task
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add {routineType === "morning" ? "Morning" : "Evening"} Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="actionText">Task</Label>
            <Input
              id="actionText"
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder="e.g., Take vitamins, Read 10 pages..."
              className="mt-2 bg-charcoal"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="timeSlot" className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Time (optional)
            </Label>
            <Input
              id="timeSlot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              placeholder="e.g., 6:00 AM"
              className="mt-2 bg-charcoal"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              className="flex-1"
              disabled={saving || !actionText.trim()}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
