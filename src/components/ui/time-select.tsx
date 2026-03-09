import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimeSelectProps {
  value: string; // "6:00 AM" format
  onChange: (value: string) => void;
  className?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const PERIODS = ["AM", "PM"] as const;

/** Parse "6:00 AM" or "12:30 PM" into { hour, minute, period } */
function parseTimeString(time: string): { hour: number; minute: string; period: "AM" | "PM" } {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    return {
      hour: parseInt(match[1]),
      minute: match[2],
      period: match[3].toUpperCase() as "AM" | "PM",
    };
  }
  // Fallback
  return { hour: 6, minute: "00", period: "AM" };
}

/** Snap a minute value to the nearest 5-minute increment */
function snapMinute(min: string): string {
  const num = parseInt(min);
  const snapped = Math.round(num / 5) * 5;
  return snapped === 60 ? "55" : snapped.toString().padStart(2, "0");
}

export function TimeSelect({ value, onChange, className }: TimeSelectProps) {
  const parsed = parseTimeString(value);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(snapMinute(parsed.minute));
  const [period, setPeriod] = useState(parsed.period);

  // Sync back to parent on any change
  useEffect(() => {
    const formatted = `${hour}:${minute} ${period}`;
    if (formatted !== value) {
      onChange(formatted);
    }
  }, [hour, minute, period]);

  // Re-parse if value changes externally
  useEffect(() => {
    const p = parseTimeString(value);
    setHour(p.hour);
    setMinute(snapMinute(p.minute));
    setPeriod(p.period);
  }, [value]);

  const colClass = "flex flex-col gap-0.5 max-h-[200px] overflow-y-auto scrollbar-hide px-0.5";
  const itemClass = (active: boolean) =>
    cn(
      "px-3 py-1.5 rounded text-sm text-center cursor-pointer transition-all min-h-[36px] flex items-center justify-center",
      active
        ? "bg-primary text-primary-foreground font-bold"
        : "text-muted-foreground hover:bg-muted/40"
    );

  return (
    <div className={cn("flex gap-1", className)}>
      {/* Hour column */}
      <div className={colClass}>
        {HOURS.map((h) => (
          <button key={h} type="button" className={itemClass(h === hour)} onClick={() => setHour(h)}>
            {h}
          </button>
        ))}
      </div>

      <div className="flex items-center text-muted-foreground font-bold px-0.5">:</div>

      {/* Minute column */}
      <div className={colClass}>
        {MINUTES.map((m) => (
          <button key={m} type="button" className={itemClass(m === minute)} onClick={() => setMinute(m)}>
            {m}
          </button>
        ))}
      </div>

      {/* AM/PM column */}
      <div className="flex flex-col gap-0.5 px-0.5">
        {PERIODS.map((p) => (
          <button key={p} type="button" className={itemClass(p === period)} onClick={() => setPeriod(p)}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
