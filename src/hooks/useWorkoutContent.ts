import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WorkoutTemplate {
  id: string;
  template_slug: string;
  name: string;
  focus: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  is_bodyweight: boolean;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  template_id: string;
  section_type: "warmup" | "main" | "finisher" | "cooldown";
  exercise_name: string;
  sets: string | null;
  reps_or_time: string | null;
  rest: string | null;
  notes: string | null;
  scaling_options: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProgramWeek {
  id: string;
  week_number: number;
  phase: "foundation" | "build" | "peak";
  title: string | null;
  focus_description: string | null;
  workout_monday: string | null;
  workout_tuesday: string | null;
  workout_wednesday: string | null;
  workout_thursday: string | null;
  workout_friday: string | null;
  workout_saturday: string | null;
  conditioning_notes: string | null;
  recovery_notes: string | null;
  scripture_reference: string | null;
  video_url: string | null;
  video_title: string | null;
  video_description: string | null;
  track_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useWorkoutTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("workout_templates")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setTemplates(data || []);
    } catch (e: any) {
      console.error("Error fetching workout templates:", e);
      toast({ title: "Error", description: "Failed to load workout templates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Omit<WorkoutTemplate, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("workout_templates")
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      await fetchTemplates();
      toast({ title: "Success", description: "Template created" });
      return data as WorkoutTemplate;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return null;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<WorkoutTemplate>) => {
    try {
      const { error } = await supabase
        .from("workout_templates")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      await fetchTemplates();
      toast({ title: "Success", description: "Template updated" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      // First delete all exercises for this template
      await supabase.from("workout_exercises").delete().eq("template_id", id);
      
      const { error } = await supabase
        .from("workout_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchTemplates();
      toast({ title: "Success", description: "Template deleted" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return { templates, loading, fetchTemplates, createTemplate, updateTemplate, deleteTemplate };
}

export function useWorkoutExercises(templateId: string | null) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchExercises = async () => {
    if (!templateId) {
      setExercises([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("workout_exercises")
        .select("*")
        .eq("template_id", templateId)
        .order("display_order");

      if (error) throw error;
      setExercises((data || []) as WorkoutExercise[]);
    } catch (e: any) {
      console.error("Error fetching exercises:", e);
    } finally {
      setLoading(false);
    }
  };

  const createExercise = async (exercise: Omit<WorkoutExercise, "id" | "created_at" | "updated_at">) => {
    try {
      const { error } = await supabase.from("workout_exercises").insert(exercise);
      if (error) throw error;
      await fetchExercises();
      toast({ title: "Success", description: "Exercise added" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const updateExercise = async (id: string, updates: Partial<WorkoutExercise>) => {
    try {
      const { error } = await supabase.from("workout_exercises").update(updates).eq("id", id);
      if (error) throw error;
      await fetchExercises();
      toast({ title: "Success", description: "Exercise updated" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const { error } = await supabase.from("workout_exercises").delete().eq("id", id);
      if (error) throw error;
      await fetchExercises();
      toast({ title: "Success", description: "Exercise deleted" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [templateId]);

  return { exercises, loading, fetchExercises, createExercise, updateExercise, deleteExercise };
}

export function useProgramWeeks(trackId?: string | null) {
  const [weeks, setWeeks] = useState<ProgramWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWeeks = async (filterTrackId?: string | null) => {
    setLoading(true);
    try {
      let query = supabase
        .from("program_weeks")
        .select("*")
        .order("week_number");
      
      // If a specific track ID is provided, filter by it
      if (filterTrackId) {
        query = query.eq("track_id", filterTrackId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setWeeks((data || []) as ProgramWeek[]);
    } catch (e: any) {
      console.error("Error fetching program weeks:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateWeek = async (id: string, updates: Partial<ProgramWeek>) => {
    try {
      const { error } = await supabase.from("program_weeks").update(updates).eq("id", id);
      if (error) throw error;
      await fetchWeeks(trackId);
      toast({ title: "Success", description: "Week updated" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchWeeks(trackId);
  }, [trackId]);

  return { weeks, loading, fetchWeeks, updateWeek };
}
