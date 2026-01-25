import { useState } from "react";
import { Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface RoutineDurationEditorProps {
  currentDuration: number;
  onSave: (durationMinutes: number) => Promise<void>;
  disabled?: boolean;
}

export default function RoutineDurationEditor({
  currentDuration,
  onSave,
  disabled = false,
}: RoutineDurationEditorProps) {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(currentDuration);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (duration === currentDuration || duration < 1) return;
    
    setSaving(true);
    try {
      await onSave(duration);
      setOpen(false);
    } catch (e) {
      console.error("Error saving duration:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDuration(currentDuration);
    setOpen(false);
  };

  const formatDuration = (mins: number): string => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  };

  // Quick duration presets
  const presets = [5, 10, 15, 20, 30, 45, 60];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-primary/70">({formatDuration(currentDuration)})</span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-56 p-3" 
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 text-primary" />
            <span>Duration</span>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setDuration(preset)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors",
                  duration === preset
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {formatDuration(preset)}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={180}
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-8 w-20 text-center"
            />
            <span className="text-xs text-muted-foreground">minutes</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleSave}
              disabled={saving || duration === currentDuration}
              className="flex-1 gap-1"
            >
              <Save className="h-3 w-3" />
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
