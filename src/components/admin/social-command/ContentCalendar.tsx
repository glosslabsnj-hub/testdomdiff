import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Wand2,
  Loader2,
  Plus,
  Download,
  Instagram,
  Youtube,
  Twitter,
  Zap,
  Clock,
  Film,
  Check,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useContentCalendar, type CalendarSlot, type CalendarSlotInput, type CalendarSlotStatus, type Platform, type TimeSlot } from "@/hooks/useContentCalendar";
import { useSocialCommand } from "@/hooks/useSocialCommand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ContentCalendarSlot from "./ContentCalendarSlot";
import { downloadCSV } from "@/lib/exportUtils";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS: TimeSlot[] = ["morning", "afternoon", "evening"];
const TIME_LABELS: Record<TimeSlot, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};
const TIME_LABELS_SHORT: Record<TimeSlot, string> = {
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
  const [detailSlot, setDetailSlot] = useState<CalendarSlot | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState<Platform>("instagram");
  const [mobileDayIndex, setMobileDayIndex] = useState(() => new Date().getDay());

  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
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
        hook: s.hook || null,
        talking_points: s.talking_points || [],
        filming_tips: s.filming_tips || null,
        cta: s.cta || null,
        strategy_type: s.strategy_type || null,
        category: s.category || null,
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

      const descParts: string[] = [];
      if (s.strategy_type) descParts.push(`Strategy: ${s.strategy_type.replace("_", " ")}`);
      if (s.category) descParts.push(`Category: ${s.category}`);
      if (s.content_type) descParts.push(`Format: ${s.content_type}`);
      if (s.hook) descParts.push(`\nHOOK:\n"${s.hook}"`);
      if (s.talking_points && s.talking_points.length > 0) {
        descParts.push(`\nWHAT TO SAY:\n${(s.talking_points as string[]).map((p: string) => `• ${p}`).join("\n")}`);
      }
      if (s.filming_tips) descParts.push(`\nHOW TO FILM IT:\n${s.filming_tips}`);
      if (s.cta) descParts.push(`\nCALL TO ACTION:\n"${s.cta}"`);
      if (s.notes) descParts.push(`\nNOTES:\n${s.notes}`);
      const description = descParts.join("\n");

      return `BEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${fmt(new Date())}\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:${esc(`[${s.platform.toUpperCase()}] ${s.title}`)}\nDESCRIPTION:${esc(description)}\nEND:VEVENT`;
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

  // Mobile: count slots per day for the day selector badges
  const slotsPerDay = weekDates.map((_, dayIndex) => {
    let count = 0;
    for (const ts of TIME_SLOTS) {
      count += getSlotsByDayAndTime(dayIndex, ts).length;
    }
    return count;
  });

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
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-[10px]">{stats.posted} posted</Badge>
            <Badge variant="secondary" className="text-[10px]">{stats.remaining} remaining</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={exportCalendar} className="text-xs gap-1">
            <Download className="h-3 w-3" /> .ics
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => {
              downloadCSV(
                slots.map((s) => ({
                  date: s.scheduled_date,
                  day: DAY_NAMES[s.day_of_week] || "",
                  time_slot: s.time_slot,
                  platform: s.platform,
                  title: s.title,
                  content_type: s.content_type || "",
                  category: s.category || "",
                  status: s.status,
                  hook: s.hook || "",
                  talking_points: (s.talking_points as string[])?.join("; ") || "",
                  filming_tips: s.filming_tips || "",
                  cta: s.cta || "",
                  notes: s.notes || "",
                })),
                `calendar-${weekDates[0].toISOString().split("T")[0]}.csv`,
                [
                  { key: "date", label: "Date" },
                  { key: "day", label: "Day" },
                  { key: "time_slot", label: "Time Slot" },
                  { key: "platform", label: "Platform" },
                  { key: "title", label: "Title" },
                  { key: "content_type", label: "Type" },
                  { key: "category", label: "Category" },
                  { key: "status", label: "Status" },
                  { key: "hook", label: "Hook" },
                  { key: "talking_points", label: "Talking Points" },
                  { key: "filming_tips", label: "Filming Tips" },
                  { key: "cta", label: "CTA" },
                  { key: "notes", label: "Notes" },
                ]
              );
            }}
          >
            <Download className="h-3 w-3" /> .csv
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

      {/* Mobile stats */}
      <div className="flex sm:hidden items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary" className="text-[10px]">{stats.posted} posted</Badge>
        <Badge variant="secondary" className="text-[10px]">{stats.remaining} remaining</Badge>
      </div>

      {/* ═══ MOBILE: Day selector + vertical cards ═══ */}
      <div className="sm:hidden">
        {/* Day Selector - horizontal scroll of day buttons */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
          {weekDates.map((date, i) => (
            <button
              key={i}
              onClick={() => setMobileDayIndex(i)}
              className={cn(
                "flex flex-col items-center min-w-[52px] py-2 px-2 rounded-lg border transition-all shrink-0",
                mobileDayIndex === i
                  ? "bg-orange-500/15 border-orange-500/40 ring-1 ring-orange-500/20"
                  : isToday(date)
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "border-border/50 hover:border-border"
              )}
            >
              <span className={cn(
                "text-[10px] font-medium",
                mobileDayIndex === i ? "text-orange-400" : isToday(date) ? "text-blue-400" : "text-muted-foreground"
              )}>
                {DAY_NAMES[i]}
              </span>
              <span className={cn(
                "text-lg font-bold",
                mobileDayIndex === i ? "text-orange-400" : "text-foreground"
              )}>
                {date.getDate()}
              </span>
              {slotsPerDay[i] > 0 && (
                <span className="text-[9px] text-muted-foreground">{slotsPerDay[i]} slot{slotsPerDay[i] !== 1 ? "s" : ""}</span>
              )}
            </button>
          ))}
        </div>

        {/* Selected Day's Content */}
        <div className="mt-3 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground">
            {FULL_DAY_NAMES[mobileDayIndex]}, {weekDates[mobileDayIndex]?.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </p>

          {TIME_SLOTS.map((timeSlot) => {
            const daySlots = getSlotsByDayAndTime(mobileDayIndex, timeSlot);
            return (
              <div key={timeSlot} className="rounded-lg border border-border bg-charcoal/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-muted-foreground uppercase">{TIME_LABELS[timeSlot]}</h5>
                  <button
                    className="text-[10px] text-muted-foreground hover:text-orange-400 flex items-center gap-1"
                    onClick={() => setAddDialog({ dayIndex: mobileDayIndex, timeSlot, date: weekDates[mobileDayIndex] })}
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                {daySlots.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground/50 italic">No content scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {daySlots.map((slot) => (
                      <ContentCalendarSlot
                        key={slot.id}
                        slot={slot}
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDelete}
                        onClick={(s) => setDetailSlot(s)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ DESKTOP: Grid Calendar ═══ */}
      <div className="hidden sm:block">
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
              {TIME_LABELS_SHORT[timeSlot]}
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
                      onClick={(s) => setDetailSlot(s)}
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

      {/* Slot Detail Dialog */}
      <Dialog open={!!detailSlot} onOpenChange={(o) => !o && setDetailSlot(null)}>
        <DialogContent className="sm:max-w-lg">
          {detailSlot && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  {detailSlot.platform === "instagram" && <Instagram className="h-5 w-5 text-pink-400" />}
                  {detailSlot.platform === "tiktok" && <Zap className="h-5 -5 text-cyan-400" />}
                  {detailSlot.platform === "youtube" && <Youtube className="h-5 w-5 text-red-400" />}
                  {detailSlot.platform === "twitter" && <Twitter className="h-5 w-5 text-blue-400" />}
                  <Badge variant="outline" className="text-xs capitalize">{detailSlot.platform}</Badge>
                  <Badge variant="outline" className="text-xs capitalize">{detailSlot.status}</Badge>
                </div>
                <DialogTitle className="text-lg">{detailSlot.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
                {/* Schedule Info */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(detailSlot.scheduled_date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">{detailSlot.time_slot} slot</Badge>
                  {detailSlot.content_type && (
                    <Badge variant="outline" className="text-xs">{detailSlot.content_type}</Badge>
                  )}
                  {detailSlot.strategy_type && (
                    <Badge variant="outline" className="text-xs capitalize border-orange-500/30 text-orange-400">{detailSlot.strategy_type.replace("_", " ")}</Badge>
                  )}
                  {detailSlot.category && (
                    <Badge variant="outline" className="text-xs capitalize">{detailSlot.category}</Badge>
                  )}
                </div>

                {detailSlot.hook && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Hook</h4>
                    <p className="text-sm text-muted-foreground bg-charcoal/50 rounded-lg p-3 border border-border italic">
                      "{detailSlot.hook}"
                    </p>
                  </div>
                )}

                {detailSlot.talking_points && detailSlot.talking_points.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">What to Say</h4>
                    <ul className="space-y-1.5">
                      {(detailSlot.talking_points as string[]).map((point: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-orange-400 mt-0.5 flex-shrink-0">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {detailSlot.filming_tips && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">How to Film It</h4>
                    <p className="text-sm text-muted-foreground bg-charcoal/50 rounded-lg p-3 border border-border">
                      {detailSlot.filming_tips}
                    </p>
                  </div>
                )}

                {detailSlot.cta && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Call to Action</h4>
                    <p className="text-sm text-muted-foreground bg-charcoal/50 rounded-lg p-3 border border-border italic">
                      "{detailSlot.cta}"
                    </p>
                  </div>
                )}

                {detailSlot.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Strategy & Notes</h4>
                    <p className="text-sm text-muted-foreground bg-charcoal/50 rounded-lg p-3 border border-border">
                      {detailSlot.notes}
                    </p>
                  </div>
                )}

                {/* Status Actions */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {(["planned", "drafted", "recorded", "posted", "skipped"] as CalendarSlotStatus[]).map((s) => {
                      const icons: Record<CalendarSlotStatus, React.ReactNode> = {
                        planned: <Clock className="h-3 w-3" />,
                        drafted: <Film className="h-3 w-3" />,
                        recorded: <Film className="h-3 w-3" />,
                        posted: <Check className="h-3 w-3" />,
                        skipped: <SkipForward className="h-3 w-3" />,
                      };
                      return (
                        <Button
                          key={s}
                          variant={detailSlot.status === s ? "default" : "outline"}
                          size="sm"
                          className={cn("gap-1 text-xs capitalize", detailSlot.status === s && "bg-orange-500 hover:bg-orange-600 text-white")}
                          onClick={() => {
                            handleUpdateStatus(detailSlot.id, s);
                            setDetailSlot({ ...detailSlot, status: s });
                          }}
                        >
                          {icons[s]} {s}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-row gap-2 sm:justify-between">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDelete(detailSlot.id);
                    setDetailSlot(null);
                  }}
                >
                  Delete Slot
                </Button>
                <Button variant="outline" onClick={() => setDetailSlot(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
