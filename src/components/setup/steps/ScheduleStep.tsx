import { useState, useEffect } from "react";
import { Sun, Moon, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSetupProgress } from "@/hooks/useSetupProgress";
import { cn } from "@/lib/utils";

interface ScheduleStepProps {
  onReady: () => void;
}

// Common wake/sleep time presets
const WAKE_PRESETS = [
  { label: "5:00 AM", value: "05:00:00", emoji: "🌅" },
  { label: "5:30 AM", value: "05:30:00", emoji: "🌅" },
  { label: "6:00 AM", value: "06:00:00", emoji: "☀️" },
  { label: "6:30 AM", value: "06:30:00", emoji: "☀️" },
  { label: "7:00 AM", value: "07:00:00", emoji: "🌤️" },
  { label: "7:30 AM", value: "07:30:00", emoji: "🌤️" },
];

const SLEEP_PRESETS = [
  { label: "9:00 PM", value: "21:00:00", emoji: "🌙" },
  { label: "9:30 PM", value: "21:30:00", emoji: "🌙" },
  { label: "10:00 PM", value: "22:00:00", emoji: "🌃" },
  { label: "10:30 PM", value: "22:30:00", emoji: "🌃" },
  { label: "11:00 PM", value: "23:00:00", emoji: "🌃" },
  { label: "11:30 PM", value: "23:30:00", emoji: "🌃" },
];

export default function ScheduleStep({ onReady }: ScheduleStepProps) {
  const { wakeTime, sleepTime, updateSchedule } = useSetupProgress();
  const [selectedWake, setSelectedWake] = useState(wakeTime || "06:00:00");
  const [selectedSleep, setSelectedSleep] = useState(sleepTime || "22:00:00");
  const [saved, setSaved] = useState(false);

  // Enable proceed when schedule is set
  useEffect(() => {
    onReady();
  }, [onReady]);

  const handleSave = async () => {
    await updateSchedule.mutateAsync({
      wakeTime: selectedWake,
      sleepTime: selectedSleep,
    });
    setSaved(true);
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hours] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${time.split(":")[1]} ${ampm}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Set Your Daily Schedule</h2>
        <p className="text-muted-foreground">
          When do you wake up and go to bed? This sets your "Lights On" and "Lights Out" routine times.
        </p>
      </div>

      <div className="space-y-8">
        {/* Wake Time */}
        <div className="bg-charcoal rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Sun className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <Label className="text-lg font-semibold">Lights On (Wake Time)</Label>
              <p className="text-sm text-muted-foreground">When your morning routine starts</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {WAKE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  setSelectedWake(preset.value);
                  setSaved(false);
                }}
                className={cn(
                  "p-3 rounded-lg border text-center transition-all",
                  selectedWake === preset.value
                    ? "bg-primary/20 border-primary text-foreground"
                    : "bg-background border-border hover:border-primary/50"
                )}
              >
                <span className="text-lg mb-1 block">{preset.emoji}</span>
                <span className="text-sm font-medium">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sleep Time */}
        <div className="bg-charcoal rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Moon className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <Label className="text-lg font-semibold">Lights Out (Bedtime)</Label>
              <p className="text-sm text-muted-foreground">When your evening routine ends</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SLEEP_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  setSelectedSleep(preset.value);
                  setSaved(false);
                }}
                className={cn(
                  "p-3 rounded-lg border text-center transition-all",
                  selectedSleep === preset.value
                    ? "bg-primary/20 border-primary text-foreground"
                    : "bg-background border-border hover:border-primary/50"
                )}
              >
                <span className="text-lg mb-1 block">{preset.emoji}</span>
                <span className="text-sm font-medium">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-charcoal rounded-xl border border-primary/30 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Your Daily Structure
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-500">Morning Routine</span>
              </div>
              <p className="text-lg font-bold text-foreground">{formatTime(selectedWake)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                8 items • Prayer, journaling, movement, hygiene
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-indigo-500">Evening Routine</span>
              </div>
              <p className="text-lg font-bold text-foreground">{formatTime(selectedSleep)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                6 items • Review, planning, reading, prayer
              </p>
            </div>
          </div>

          <Button 
            variant={saved ? "steel" : "gold"} 
            className="w-full mt-4 gap-2"
            onClick={handleSave}
            disabled={updateSchedule.isPending}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Schedule Saved
              </>
            ) : (
              "Save Schedule"
            )}
          </Button>
        </div>
      </div>

      {/* Why This Matters */}
      <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <h4 className="font-medium text-foreground text-sm mb-1">💡 Why This Matters</h4>
        <p className="text-sm text-muted-foreground">
          Structure breeds discipline. Your morning and evening routines are the bookends of a successful day. 
          These times will be used to schedule your daily discipline checklist.
        </p>
      </div>
    </div>
  );
}
