import { format } from "date-fns";

export interface CalendarEvent {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
}

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
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@redeemedstrength.com`;
  
  // Escape special characters for ICS format
  const escapeICS = (text: string): string => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  };

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
