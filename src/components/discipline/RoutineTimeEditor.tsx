import { useState } from "react";
import { Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimeSelect } from "@/components/ui/time-select";
import { cn } from "@/lib/utils";

interface RoutineTimeEditorProps {
  currentTime: string;
  onSave: (newTime: string) => Promise<void>;
  disabled?: boolean;
}

export default function RoutineTimeEditor({
  currentTime,
  onSave,
  disabled = false
}: RoutineTimeEditorProps) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(currentTime);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (time === currentTime) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(time);
      setOpen(false);
    } catch (e) {
      console.error("Error saving time:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTime(currentTime);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={(o) => {
      if (o) setTime(currentTime);
      setOpen(o);
    }}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {currentTime}
          <Clock className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Set Time</p>
          <TimeSelect value={time} onChange={setTime} />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 h-8 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              variant="gold"
              onClick={handleSave}
              disabled={saving || !time.trim()}
              className="flex-1 h-8 text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              {saving ? "..." : "Save"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
