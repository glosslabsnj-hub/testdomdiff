import { useState } from "react";
import { Calendar, Download, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  calculateSequentialTimes, 
  createTodayAtTime, 
  downloadMultiEventICSFile,
  generateGoogleCalendarUrl,
  formatDuration,
  RoutineWithDuration,
  CalendarEvent,
} from "@/lib/calendarUtils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ExportScheduleDialogProps {
  routineType: "morning" | "evening";
  routines: RoutineWithDuration[];
  baseTime: string;
  trigger?: React.ReactNode;
}

export default function ExportScheduleDialog({ 
  routineType, 
  routines,
  baseTime,
  trigger,
}: ExportScheduleDialogProps) {
  const [open, setOpen] = useState(false);

  if (routines.length === 0) return null;

  const baseStartTime = createTodayAtTime(baseTime);
  const events = calculateSequentialTimes(routines, baseStartTime);
  
  // Calculate total duration
  const totalMinutes = routines.reduce((sum, r) => sum + (r.duration_minutes || 5), 0);
  
  // Get end time
  const lastEvent = events[events.length - 1];
  const scheduleEndTime = lastEvent ? lastEvent.endTime : baseStartTime;

  const handleDownloadICS = () => {
    downloadMultiEventICSFile(
      events, 
      routineType,
      `${routineType}-discipline-schedule`
    );
  };

  const handleGoogleCalendar = () => {
    // Open each event in a new tab (Google Calendar doesn't support multi-event URLs)
    // For UX, we'll open the first one and notify the user
    if (events.length > 0) {
      const firstEvent = events[0];
      const completeLink = firstEvent.id 
        ? `\n\n---\nMark Complete: https://testdomdiff.lovable.app/dashboard/discipline?complete=${firstEvent.id}&type=${routineType}\n\nRedeemed Strength - ${routineType === "morning" ? "Lights On" : "Lights Out"} Protocol`
        : "";
      
      const eventWithLink: CalendarEvent = {
        ...firstEvent,
        description: (firstEvent.description || "") + completeLink,
      };
      
      const url = generateGoogleCalendarUrl(eventWithLink);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const protocolName = routineType === "morning" ? "Lights On" : "Lights Out";
  const protocolSubtitle = routineType === "morning" ? "Reveille → Word → Work" : "Lockdown → Reflect → Rest";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" />
            Export Schedule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Export {protocolName} Schedule
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Schedule Summary */}
          <div className={cn(
            "p-4 rounded-lg border",
            routineType === "morning" 
              ? "bg-amber-500/10 border-amber-500/30" 
              : "bg-blue-500/10 border-blue-500/30"
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {format(baseStartTime, "h:mm a")} - {format(scheduleEndTime, "h:mm a")}
                </span>
              </div>
              <span className={cn(
                "text-sm font-semibold",
                routineType === "morning" ? "text-amber-400" : "text-blue-400"
              )}>
                {formatDuration(totalMinutes)} total
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{protocolSubtitle}</p>
          </div>

          {/* Task Preview List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {events.map((event, index) => {
              const routine = routines[index];
              return (
                <div 
                  key={event.id || index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-charcoal border border-border"
                >
                  <div className="text-xs font-mono text-primary w-24 flex-shrink-0 pt-0.5">
                    {format(event.startTime, "h:mm a")}
                    <span className="text-muted-foreground"> - </span>
                    {format(event.endTime, "h:mm a")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(routine.duration_minutes || 5)}
                      {routine.description && ` • ${routine.description.slice(0, 30)}${routine.description.length > 30 ? "..." : ""}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deep Link Info */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-muted-foreground">
              <ExternalLink className="w-3 h-3 inline mr-1" />
              Each event includes a "Mark Complete" link that opens the app to check off the task.
            </p>
          </div>

          {/* Export Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleGoogleCalendar}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              Google Calendar
            </Button>
            <Button
              variant="gold"
              onClick={handleDownloadICS}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download .ics
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            .ics works with Apple Calendar, Outlook, and most calendar apps
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
