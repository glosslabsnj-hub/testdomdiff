import { useState } from "react";
import { Plus, Clock, Loader2, Timer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
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
  const [timeSlot, setTimeSlot] = useState(routineType === "morning" ? "8:00 AM" : "8:00 PM");
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionText.trim()) return;

    setSaving(true);
    const success = await onAdd({
      routine_type: routineType,
      time_slot: timeSlot,
      action_text: actionText.trim(),
      duration_minutes: durationMinutes,
      description: description.trim() || null,
    });
    setSaving(false);

    if (success) {
      setActionText("");
      setTimeSlot(routineType === "morning" ? "8:00 AM" : "8:00 PM");
      setDurationMinutes(5);
      setDescription("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full mt-4 border-dashed",
            routineType === "morning" 
              ? "border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50" 
              : "border-secondary/30 text-secondary-foreground hover:bg-secondary/10 hover:border-secondary/50"
          )}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to {routineType === "morning" ? "Morning" : "Evening"} Routine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add {routineType === "morning" ? "Morning" : "Evening"} Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="actionText">What do you need to do?</Label>
            <Input
              id="actionText"
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder="e.g., Take vitamins, Read for 15 min..."
              className="mt-2 bg-charcoal"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeSlot" className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Time
              </Label>
              <Input
                id="timeSlot"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="e.g., 6:00 AM"
                className="mt-2 bg-charcoal"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Timer className="w-4 h-4" /> Duration
              </Label>
              <div className="mt-2">
                <div className="flex items-center gap-3">
                  <Slider
                    value={[durationMinutes]}
                    onValueChange={(v) => setDurationMinutes(v[0])}
                    min={1}
                    max={60}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-16 text-right">{durationMinutes} min</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Notes (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details or notes (shown in calendar event)"
              className="mt-2 bg-charcoal resize-none h-20"
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
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add to Schedule"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
