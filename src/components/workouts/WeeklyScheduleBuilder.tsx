import { useState, useCallback } from "react";
import { 
  Calendar, 
  Download, 
  X, 
  GripVertical, 
  Dumbbell,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { WorkoutTemplate } from "@/hooks/useWorkoutContent";
import { 
  generateWeeklyScheduleICS, 
  generateGoogleCalendarUrl,
  CalendarEvent,
  addMinutes 
} from "@/lib/calendarUtils";
import { cn } from "@/lib/utils";
import { addDays, startOfWeek, format } from "date-fns";

interface WeeklyScheduleBuilderProps {
  templates: WorkoutTemplate[];
}

type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

const DAYS: { key: DayOfWeek; label: string; shortLabel: string }[] = [
  { key: "monday", label: "Monday", shortLabel: "Mon" },
  { key: "tuesday", label: "Tuesday", shortLabel: "Tue" },
  { key: "wednesday", label: "Wednesday", shortLabel: "Wed" },
  { key: "thursday", label: "Thursday", shortLabel: "Thu" },
  { key: "friday", label: "Friday", shortLabel: "Fri" },
  { key: "saturday", label: "Saturday", shortLabel: "Sat" },
  { key: "sunday", label: "Sunday", shortLabel: "Sun" },
];

export default function WeeklyScheduleBuilder({ templates }: WeeklyScheduleBuilderProps) {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<Record<DayOfWeek, WorkoutTemplate | null>>({
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  });
  const [draggedTemplate, setDraggedTemplate] = useState<WorkoutTemplate | null>(null);
  const [dragOverDay, setDragOverDay] = useState<DayOfWeek | null>(null);

  const handleDragStart = useCallback((template: WorkoutTemplate) => {
    setDraggedTemplate(template);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTemplate(null);
    setDragOverDay(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, day: DayOfWeek) => {
    e.preventDefault();
    setDragOverDay(day);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverDay(null);
  }, []);

  const handleDrop = useCallback((day: DayOfWeek) => {
    if (draggedTemplate) {
      setSchedule(prev => ({ ...prev, [day]: draggedTemplate }));
      toast({
        title: "Workout assigned",
        description: `${draggedTemplate.name} → ${DAYS.find(d => d.key === day)?.label}`,
      });
    }
    setDraggedTemplate(null);
    setDragOverDay(null);
  }, [draggedTemplate, toast]);

  const handleTouchStart = useCallback((template: WorkoutTemplate) => {
    setDraggedTemplate(template);
  }, []);

  const handleTouchEnd = useCallback((day: DayOfWeek) => {
    if (draggedTemplate) {
      setSchedule(prev => ({ ...prev, [day]: draggedTemplate }));
      toast({
        title: "Workout assigned",
        description: `${draggedTemplate.name} → ${DAYS.find(d => d.key === day)?.label}`,
      });
    }
    setDraggedTemplate(null);
  }, [draggedTemplate, toast]);

  const removeFromDay = useCallback((day: DayOfWeek) => {
    setSchedule(prev => ({ ...prev, [day]: null }));
  }, []);

  const clearSchedule = useCallback(() => {
    setSchedule({
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null,
    });
    toast({ title: "Schedule cleared" });
  }, [toast]);

  const assignedCount = Object.values(schedule).filter(Boolean).length;

  // Generate calendar events for the week
  const generateWeekEvents = useCallback((): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start

    DAYS.forEach((day, index) => {
      const template = schedule[day.key];
      if (template) {
        const dayDate = addDays(weekStart, index);
        dayDate.setHours(6, 0, 0, 0); // Default 6 AM workout time
        
        events.push({
          id: template.id,
          title: `Workout: ${template.name}`,
          description: [
            template.focus || "",
            "",
            template.description || "Complete this workout with intensity and purpose.",
            "",
            "---",
            "Redeemed Strength - Iron Pile Training",
          ].filter(Boolean).join("\n"),
          startTime: dayDate,
          endTime: addMinutes(dayDate, 60),
        });
      }
    });

    return events;
  }, [schedule]);

  const handleDownloadICS = useCallback(() => {
    const events = generateWeekEvents();
    if (events.length === 0) {
      toast({ 
        title: "No workouts scheduled", 
        description: "Drag templates to days first",
        variant: "destructive" 
      });
      return;
    }

    const icsContent = generateWeeklyScheduleICS(events);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "weekly-training-schedule.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ 
      title: "Schedule exported", 
      description: "Open the .ics file to add all workouts to your calendar" 
    });
  }, [generateWeekEvents, toast]);

  const handleGoogleCalendar = useCallback(() => {
    const events = generateWeekEvents();
    if (events.length === 0) {
      toast({ 
        title: "No workouts scheduled", 
        description: "Drag templates to days first",
        variant: "destructive" 
      });
      return;
    }

    // Google Calendar doesn't support multi-event URLs, so open first event
    const url = generateGoogleCalendarUrl(events[0]);
    window.open(url, "_blank", "noopener,noreferrer");
    
    toast({ 
      title: "Opening Google Calendar", 
      description: `Adding ${events.length} workouts - repeat for each day` 
    });
  }, [generateWeekEvents, toast]);

  return (
    <Card className="bg-card border-primary/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="headline-card flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Weekly Schedule Builder
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Drag templates to build your week, then export to your calendar
            </p>
          </div>
          <div className="flex items-center gap-2">
            {assignedCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearSchedule}
                className="text-muted-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="gold" 
                  size="sm" 
                  disabled={assignedCount === 0}
                  className="gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Export Week
                  {assignedCount > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {assignedCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer">
                  <Calendar className="w-4 h-4 mr-2" />
                  Google Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadICS} className="cursor-pointer">
                  <Download className="w-4 h-4 mr-2" />
                  Download .ics
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Draggable Templates */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Drag to Schedule
          </p>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <div
                key={template.id}
                draggable
                onDragStart={() => handleDragStart(template)}
                onDragEnd={handleDragEnd}
                onTouchStart={() => handleTouchStart(template)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing",
                  "bg-charcoal border-border hover:border-primary/50 transition-all",
                  "touch-none select-none",
                  draggedTemplate?.id === template.id && "opacity-50 border-primary"
                )}
              >
                <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <Dumbbell className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {template.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day) => {
            const assigned = schedule[day.key];
            const isDragOver = dragOverDay === day.key;
            
            return (
              <div
                key={day.key}
                onDragOver={(e) => handleDragOver(e, day.key)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(day.key)}
                onTouchEnd={() => draggedTemplate && handleTouchEnd(day.key)}
                className={cn(
                  "min-h-[100px] rounded-lg border-2 border-dashed p-2 transition-all flex flex-col",
                  isDragOver 
                    ? "border-primary bg-primary/10" 
                    : assigned 
                      ? "border-primary/50 bg-primary/5" 
                      : "border-border bg-charcoal/50",
                )}
              >
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2 text-center">
                  {day.shortLabel}
                </p>
                
                {assigned ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <Dumbbell className="w-4 h-4 text-primary mx-auto mb-1" />
                        <p className="text-[10px] sm:text-xs font-medium line-clamp-2">
                          {assigned.name}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromDay(day.key)}
                      className="h-6 w-full mt-1 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-[10px] text-muted-foreground/50 text-center">
                      {isDragOver ? "Drop here" : "Rest"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick tip */}
        {assignedCount === 0 && (
          <p className="text-xs text-center text-muted-foreground">
            💡 Drag workout templates above into the days to build your weekly schedule
          </p>
        )}
      </CardContent>
    </Card>
  );
}
