import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface DailyDevotional {
  id: string;
  user_id: string;
  devotional_date: string;
  scripture_reference: string;
  scripture_text: string;
  message: string;
  challenge: string;
  prayer_focus: string;
  theme: string;
  generated_at: string;
}

export function useDailyDevotional() {
  const { user, session } = useAuth();
  const [devotional, setDevotional] = useState<DailyDevotional | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevotional = useCallback(async (forceRefresh = false) => {
    if (!user || !session) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/daily-devotional`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ forceRefresh }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch devotional");
      }

      const data = await response.json();
      setDevotional(data);
    } catch (err: any) {
      console.error("Error fetching devotional:", err);
      setError(err.message || "Failed to load your morning briefing");
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    if (user && session) {
      fetchDevotional();
    }
  }, [user, session, fetchDevotional]);

  return {
    devotional,
    loading,
    error,
    refresh: () => fetchDevotional(true),
  };
}
