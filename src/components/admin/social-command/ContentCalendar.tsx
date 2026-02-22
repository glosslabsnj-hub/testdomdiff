import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Wand2,
  Loader2,
  Plus,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useContentCalendar, type CalendarSlotInput, type CalendarSlotStatus, type Platform, type TimeSlot } from "@/hooks/useContentCalendar";
import { useSocialCommand } from "@/hooks/useSocialCommand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ContentCalendarSlot from "./ContentCalendarSlot";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_SLOTS: TimeSlot[] = ["morning", "afternoon", "evening"];
const TIME_LABELS: Record<TimeSlot, string> = {
  morning: "AM",
  afternoon: "PM",
  evening: "Eve",
};

export default function ContentCalendar() {
  const {
    slots,
    isLoading,
    weekStart,
    weekDates,
    createSlot,
    updateSlot,
    deleteSlot,
    bulkCreateSlots,
    goToThisWeek,
    goToPrevWeek,
    goToNextWeek,
    getSlotsByDayAndTime,
    stats,
  } = useContentCalendar();

  const { config, activePlatforms } = useSocialCommand();
  const [autoFilling, setAutoFilling] = useState(false);
  const [addDialog, setAddDialog] = useState<{ dayIndex: number; timeSlot: TimeSlot; date: Date } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState<Platform>("instagram");

  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
  };

  const autoFillWeek = async () => {
    setAutoFilling(true);
    try {
      const { data, error } = await supabase.functions.invoke("social-calendar-suggest", {
        body: {
          week_start: weekDates[0].toISOString().split("T")[0],
          active_platforms: activePlatforms,
          posting_cadence: config?.posting_cadence || {},
          content_pillars: config?.content_pillars || [],
        },
      });
      if (error) throw error;

      const suggestions = data.suggestions || [];
      if (suggestions.length === 0) {
        toast.info("No suggestions generated");
        return;
      }

      const inputs: CalendarSlotInput[] = suggestions.map((s: any) => ({
        scheduled_date: s.scheduled_date,
        day_of_week: s.day_of_week,
        time_slot: s.time_slot,
        platform: s.platform,
        content_type: s.content_type || null,
        title: s.title,
        notes: s.notes || null,
      }));

      await bulkCreateSlots.mutateAsync(inputs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to auto-fill. Check API key.");
    } finally {
      setAutoFilling(false);
    }
  };

  const handleAddSlot = () => {
    if (!addDialog || !newTitle.trim()) return;
    const dateStr = addDialog.date.toISOString().split("T")[0];
    createSlot.mutate({
      scheduled_date: dateStr,
      day_of_week: addDialog.dayIndex,
      time_slot: addDialog.timeSlot,
      platform: newPlatform,
      title: newTitle.trim(),
    });
    setAddDialog(null);
    setNewTitle("");
  };

  const handleUpdateStatus = (id: string, status: CalendarSlotStatus) => {
    updateSlot.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    deleteSlot.mutate(id);
  };

  const exportCalendar = () => {
    if (slots.length === 0) {
      toast.info("No slots to export");
      return;
    }
    // Build ICS manually for content calendar events
    const vEvents = slots.map((s) => {
      const timeMap: Record<string, string> = { morning: "09:00", afternoon: "13:00", evening: "18:00" };
      const time = timeMap[s.time_slot] || "09:00";
      const [h, m] = time.split(":").map(Number);
      const start = new Date(s.scheduled_date);
      start.setHours(h, m, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 30);
      const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@domdifferent.com`;
      const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0, -1) + "Z";
      const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
      return `BEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${fmt(new Date())}\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:${esc(`[${s.platform.toUpperCase()}] ${s.title}`)}\nDESCRIPTION:${esc(s.notes || "")}\nEND:VEVENT`;
    }).join("\n");

    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Dom Different//Social Command//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n${vEvents}\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `content-calendar-${weekDates[0].toISOString().split("T")[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Calendar exported!");
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToThisWeek} className="text-xs">
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium ml-2">{formatWeekRange()}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Stats */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-[10px]">{stats.posted} posted</Badge>
            <Badge variant="secondary" className="text-[10px]">{stats.remaining} remaining</Badge>
          </div>

          <Button variant="outline" size="sm" onClick={exportCalendar} className="text-xs gap-1">
            <Download className="h-3 w-3" /> Export
          </Button>
          <Button
            size="sm"
            onClick={autoFillWeek}
            disabled={autoFilling}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs gap-1"
          >
            {autoFilling ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
            Auto-Fill
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-1">
            <div />
            {weekDates.map((date, i) => (
              <div
                key={i}
                className={cn(
                  "text-center p-2 rounded-t-lg text-xs",
                  isToday(date) ? "bg-orange-500/20 text-orange-400 font-bold" : "text-muted-foreground"
                )}
              >
                <div className="font-medium">{DAY_NAMES[i]}</div>
                <div className="text-lg font-bold">{date.getDate()}</div>
              </div>
            ))}
          </div>

          {/* Time Rows */}
          {TIME_SLOTS.map((timeSlot) => (
            <div key={timeSlot} className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-1">
              <div className="flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                {TIME_LABELS[timeSlot]}
              </div>
              {weekDates.map((date, dayIndex) => {
                const daySlots = getSlotsByDayAndTime(dayIndex, timeSlot);
                return (
                  <div
                    key={`${dayIndex}-${timeSlot}`}
                    className={cn(
                      "min-h-[80px] rounded-lg border border-border/50 p-1 space-y-1",
                      isToday(date) ? "bg-orange-500/5" : "bg-charcoal/50",
                    )}
                  >
                    {daySlots.map((slot) => (
                      <ContentCalendarSlot
                        key={slot.id}
                        slot={slot}
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDelete}
                      />
                    ))}
                    <button
                      className="w-full h-6 rounded border border-dashed border-border/50 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity"
                      onClick={() => setAddDialog({ dayIndex, timeSlot, date })}
                    >
                      <Plus className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Add Slot Dialog */}
      <Dialog open={!!addDialog} onOpenChange={(o) => !o && setAddDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Content Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {addDialog && (
              <p className="text-sm text-muted-foreground">
                {DAY_NAMES[addDialog.dayIndex]} {addDialog.date.toLocaleDateString()} — {addDialog.timeSlot}
              </p>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Faith Hot Take — Why Most Christians..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Platform</label>
              <Select value={newPlatform} onValueChange={(v) => setNewPlatform(v as Platform)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(null)}>Cancel</Button>
            <Button
              onClick={handleAddSlot}
              disabled={!newTitle.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Add Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
