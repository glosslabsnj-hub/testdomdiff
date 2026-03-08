import { useState, useEffect } from "react";

interface OfflineWorkoutData {
  dayWorkouts: any[];
  exercisesByDay: Record<string, any[]>;
  timestamp: number;
}

export function useOfflineWorkout(weekId: string | undefined, weekNumber: number) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [hasCachedData, setHasCachedData] = useState(false);
  const [cachedData, setCachedData] = useState<OfflineWorkoutData | null>(null);

  const storageKey = `offline_workout_week_${weekNumber}`;

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // On mount, check for cached data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: OfflineWorkoutData = JSON.parse(raw);
        setHasCachedData(true);
        if (!navigator.onLine) {
          setCachedData(parsed);
        }
      } else {
        setHasCachedData(false);
      }
    } catch {
      setHasCachedData(false);
    }
  }, [storageKey]);

  // Save workout data to localStorage when it loads
  const cacheWorkoutData = (dayWorkouts: any[], exercisesByDay: Record<string, any[]>) => {
    if (dayWorkouts.length === 0) return;
    try {
      const data: OfflineWorkoutData = {
        dayWorkouts,
        exercisesByDay,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
      setHasCachedData(true);
    } catch {
      // localStorage full or unavailable
    }
  };

  return {
    isOffline,
    hasCachedData,
    cachedData,
    cacheWorkoutData,
  };
}
