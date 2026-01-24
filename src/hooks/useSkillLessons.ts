import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SkillLesson {
  id: string;
  week_number: number;
  title: string;
  description: string | null;
  video_url: string | null;
  content: string | null;
  action_steps: string | null;
  resources: any[];
  is_published: boolean;
  is_advanced: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useSkillLessons(publishedOnly: boolean = true) {
  const [lessons, setLessons] = useState<SkillLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLessons = async () => {
    try {
      let query = supabase
        .from("skill_lessons")
        .select("*")
        .order("week_number")
        .order("display_order");

      if (publishedOnly) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLessons((data || []) as SkillLesson[]);
    } catch (e: any) {
      console.error("Error fetching skill lessons:", e);
    } finally {
      setLoading(false);
    }
  };

  const createLesson = async (lesson: Omit<SkillLesson, "id" | "created_at" | "updated_at">) => {
    try {
      const { error } = await supabase.from("skill_lessons").insert(lesson);
      if (error) throw error;
      await fetchLessons();
      toast({ title: "Success", description: "Lesson created" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const updateLesson = async (id: string, updates: Partial<SkillLesson>) => {
    try {
      const { error } = await supabase.from("skill_lessons").update(updates).eq("id", id);
      if (error) throw error;
      await fetchLessons();
      toast({ title: "Success", description: "Lesson updated" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const deleteLesson = async (id: string) => {
    try {
      const { error } = await supabase.from("skill_lessons").delete().eq("id", id);
      if (error) throw error;
      await fetchLessons();
      toast({ title: "Success", description: "Lesson deleted" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [publishedOnly]);

  return { lessons, loading, fetchLessons, createLesson, updateLesson, deleteLesson };
}
