import { format } from "date-fns";

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
}

export interface RoutineWithDuration {
  id: string;
  action_text: string;
  time_slot: string;
  duration_minutes: number;
  description?: string | null;
  routine_type: "morning" | "evening";
}

/**
 * Generate a unique ID for calendar events
 */
const generateUID = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format a date for Google Calendar URL (YYYYMMDDTHHmmssZ format)
 */
const formatDateForGoogle = (date: Date): string => {
  return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
};

/**
 * Format a date for ICS file (YYYYMMDDTHHmmssZ format)
 */
const formatDateForICS = (date: Date): string => {
  return date.toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0, -1) + "Z";
};

/**
 * Escape special characters for ICS format
 */
const escapeICS = (text: string): string => {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
};

/**
 * Generate a deep link for completing a specific routine
 */
export const generateCompleteLink = (
  routineId: string,
  routineType: "morning" | "evening",
  baseUrl: string = typeof window !== "undefined" ? window.location.origin : "https://domdifferent.com"
): string => {
  return `${baseUrl}/dashboard/discipline?complete=${routineId}&type=${routineType}`;
};

/**
 * Generate a Google Calendar URL that opens with the event pre-filled
 */
export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatDateForGoogle(event.startTime)}/${formatDateForGoogle(event.endTime)}`,
    details: event.description || "",
    location: event.location || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate an ICS file content string for Apple Calendar / Outlook
 */
export const generateICSContent = (event: CalendarEvent): string => {
  const uid = `${generateUID()}@redeemedstrength.com`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Redeemed Strength//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(event.startTime)}
DTEND:${formatDateForICS(event.endTime)}
SUMMARY:${escapeICS(event.title)}
DESCRIPTION:${escapeICS(event.description || "")}
${event.location ? `LOCATION:${escapeICS(event.location)}` : ""}
END:VEVENT
END:VCALENDAR`;
};

/**
 * Generate multi-event ICS file with all routines
 */
export const generateMultiEventICS = (
  events: CalendarEvent[],
  routineType: "morning" | "evening"
): string => {
  const protocolName = routineType === "morning" ? "Lights On" : "Lights Out";
  
  const vEvents = events.map((event) => {
    const uid = `${generateUID()}-${event.id || "task"}@redeemedstrength.com`;
    const completeLink = event.id ? generateCompleteLink(event.id, routineType) : "";
    
    const fullDescription = [
      event.description || "",
      "",
      "---",
      completeLink ? `Mark Complete: ${completeLink}` : "",
      "",
      `Redeemed Strength - ${protocolName} Protocol`,
    ].filter(Boolean).join("\\n");

    return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(event.startTime)}
DTEND:${formatDateForICS(event.endTime)}
SUMMARY:${escapeICS(event.title)}
DESCRIPTION:${escapeICS(fullDescription)}
END:VEVENT`;
  }).join("\n");

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Redeemed Strength//Discipline//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${vEvents}
END:VCALENDAR`;
};

/**
 * Generate a weekly workout schedule ICS file
 */
export const generateWeeklyScheduleICS = (events: CalendarEvent[]): string => {
  const vEvents = events.map((event) => {
    const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${event.id || "workout"}@redeemedstrength.com`;
    
    const fullDescription = [
      event.description || "",
      "",
      "---",
      "Redeemed Strength - Iron Pile Training",
    ].filter(Boolean).join("\\n");

    return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(event.startTime)}
DTEND:${formatDateForICS(event.endTime)}
SUMMARY:${escapeICS(event.title)}
DESCRIPTION:${escapeICS(fullDescription)}
END:VEVENT`;
  }).join("\n");

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Redeemed Strength//Iron Pile//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${vEvents}
END:VCALENDAR`;
};

/**
 * Calculate sequential start/end times based on durations
 */
export const calculateSequentialTimes = (
  routines: RoutineWithDuration[],
  baseStartTime: Date
): CalendarEvent[] => {
  let currentTime = new Date(baseStartTime);

  return routines.map((routine) => {
    const startTime = new Date(currentTime);
    const duration = routine.duration_minutes || 5;
    const endTime = new Date(currentTime.getTime() + duration * 60 * 1000);
    currentTime = endTime;

    return {
      id: routine.id,
      title: routine.action_text,
      startTime,
      endTime,
      description: routine.description || undefined,
    };
  });
};

/**
 * Download an ICS file to the user's device
 */
export const downloadICSFile = (event: CalendarEvent): void => {
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Download a multi-event ICS file
 */
export const downloadMultiEventICSFile = (
  events: CalendarEvent[],
  routineType: "morning" | "evening",
  fileName: string = "discipline-schedule"
): void => {
  const icsContent = generateMultiEventICS(events, routineType);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Parse a time string like "5:30 AM" into hours and minutes
 */
export const parseTimeString = (timeStr: string): { hours: number; minutes: number } => {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) {
    return { hours: 8, minutes: 0 }; // Default to 8:00 AM
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
};

/**
 * Create a date object for today at a specific time
 */
export const createTodayAtTime = (timeStr: string): Date => {
  const { hours, minutes } = parseTimeString(timeStr);
  const today = new Date();
  today.setHours(hours, minutes, 0, 0);
  return today;
};

/**
 * Add minutes to a date
 */
export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

/**
 * Format duration in minutes to human readable string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMins}m`;
};
