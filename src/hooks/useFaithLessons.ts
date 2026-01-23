import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FaithLesson {
  id: string;
  week_number: number;
  title: string | null;
  big_idea: string | null;
  scripture: string | null;
  teaching_content: string | null;
  action_steps: string | null;
  reflection_questions: string | null;
  weekly_challenge: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export function useFaithLessons(publishedOnly = true) {
  const [lessons, setLessons] = useState<FaithLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLessons = async () => {
    try {
      let query = supabase.from("faith_lessons").select("*").order("week_number");
      
      // Note: For non-admin users, RLS will filter to only published lessons
      const { data, error } = await query;

      if (error) throw error;
      setLessons((data || []) as FaithLesson[]);
    } catch (e: any) {
      console.error("Error fetching faith lessons:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateLesson = async (id: string, updates: Partial<FaithLesson>) => {
    try {
      const { error } = await supabase.from("faith_lessons").update(updates).eq("id", id);
      if (error) throw error;
      await fetchLessons();
      toast({ title: "Success", description: "Lesson updated" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [publishedOnly]);

  return { lessons, loading, fetchLessons, updateLesson };
}
