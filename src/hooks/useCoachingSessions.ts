import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CoachingSession {
  id: string;
  client_id: string;
  coach_id: string;
  scheduled_at: string;
  completed_at: string | null;
  session_type: string;
  notes: string | null;
  notes_visible_to_client: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionInput {
  client_id: string;
  scheduled_at: string;
  session_type: string;
  notes?: string;
  notes_visible_to_client?: boolean;
}

export function useCoachingSessions(clientId?: string) {
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("coaching_sessions")
        .select("*")
        .order("scheduled_at", { ascending: false });

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSessions((data || []) as CoachingSession[]);
    } catch (err: any) {
      console.error("Error fetching coaching sessions:", err);
      toast({
        title: "Error",
        description: "Failed to load coaching sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [clientId, toast]);

  const createSession = async (input: CreateSessionInput): Promise<CoachingSession | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("coaching_sessions")
        .insert({
          ...input,
          coach_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Session scheduled",
        description: "The coaching session has been added",
      });

      await fetchSessions();
      return data as CoachingSession;
    } catch (err: any) {
      console.error("Error creating session:", err);
      toast({
        title: "Error",
        description: "Failed to schedule session",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSession = async (
    sessionId: string,
    updates: Partial<CoachingSession>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("coaching_sessions")
        .update(updates)
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Session updated",
        description: "The session has been updated",
      });

      await fetchSessions();
      return true;
    } catch (err: any) {
      console.error("Error updating session:", err);
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      });
      return false;
    }
  };

  const completeSession = async (sessionId: string, notes?: string): Promise<boolean> => {
    return updateSession(sessionId, {
      completed_at: new Date().toISOString(),
      notes: notes || undefined,
    });
  };

  const deleteSession = async (sessionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("coaching_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Session deleted",
        description: "The session has been removed",
      });

      await fetchSessions();
      return true;
    } catch (err: any) {
      console.error("Error deleting session:", err);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    createSession,
    updateSession,
    completeSession,
    deleteSession,
    refetch: fetchSessions,
  };
}
