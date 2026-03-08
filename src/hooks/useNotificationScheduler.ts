import { useEffect, useRef } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";

const REMINDER_MESSAGES = [
  "Time to hit The Yard. Your body won't build itself.",
  "Lights On. Morning discipline is waiting.",
  "Don't break the streak. You've got {streak} days locked in.",
];

const STORAGE_KEY = "rs_last_notification_date";
const MORNING_HOUR = 9; // 9 AM
const EVENING_HOUR = 17; // 5 PM

function getRandomMessage(streak: number): string {
  const msg = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
  return msg.replace("{streak}", String(streak));
}

function getMsUntilHour(hour: number): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, 0, 0, 0);

  // If target time has already passed today, schedule for tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function hasNotifiedToday(type: "morning" | "evening"): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const data = JSON.parse(stored);
    return data[type] === getTodayKey();
  } catch {
    return false;
  }
}

function markNotified(type: "morning" | "evening"): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : {};
    data[type] = getTodayKey();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

function showLocalNotification(title: string, body: string): void {
  if (Notification.permission !== "granted") return;

  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "rs-reminder",
    });
  } catch {
    // Notification constructor may fail in some environments
  }
}

export function useNotificationScheduler() {
  const { isSupported, permission } = usePushNotifications();
  const { getTodayCompliance, streak, loading } = useDailyDiscipline();
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Don't schedule if notifications aren't granted or still loading
    if (!isSupported || permission !== "granted" || loading) return;

    const { percent } = getTodayCompliance();
    const tasksComplete = percent >= 100;

    // Clear any previously set timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Schedule morning reminder (9 AM)
    if (!tasksComplete && !hasNotifiedToday("morning")) {
      const msUntilMorning = getMsUntilHour(MORNING_HOUR);
      // Only schedule if it's within the next 24 hours and makes sense
      const timer = setTimeout(() => {
        // Re-check that tasks haven't been completed in the interim
        if (!hasNotifiedToday("morning")) {
          showLocalNotification(
            "Lights On",
            getRandomMessage(streak)
          );
          markNotified("morning");
        }
      }, msUntilMorning);
      timersRef.current.push(timer);
    }

    // Schedule evening reminder (5 PM)
    if (!tasksComplete && !hasNotifiedToday("evening")) {
      const msUntilEvening = getMsUntilHour(EVENING_HOUR);
      const timer = setTimeout(() => {
        if (!hasNotifiedToday("evening")) {
          showLocalNotification(
            "Workout Reminder",
            getRandomMessage(streak)
          );
          markNotified("evening");
        }
      }, msUntilEvening);
      timersRef.current.push(timer);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [isSupported, permission, loading, getTodayCompliance, streak]);
}
