import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProgramTrack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  goal_match: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useProgramTracks() {
  const [tracks, setTracks] = useState<ProgramTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTracks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("program_tracks")
      .select("*")
      .order("display_order");

    if (error) {
      console.error("Error fetching tracks:", error);
      toast({ title: "Error", description: "Failed to load program tracks", variant: "destructive" });
    } else {
      setTracks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const createTrack = async (track: Omit<ProgramTrack, "id" | "created_at" | "updated_at">): Promise<ProgramTrack | null> => {
    const { data, error } = await supabase
      .from("program_tracks")
      .insert(track)
      .select()
      .single();

    if (error) {
      console.error("Error creating track:", error);
      toast({ title: "Error", description: "Failed to create track", variant: "destructive" });
      return null;
    }
    toast({ title: "Success", description: "Track created" });
    await fetchTracks();
    return data;
  };

  const updateTrack = async (id: string, updates: Partial<ProgramTrack>): Promise<boolean> => {
    const { error } = await supabase
      .from("program_tracks")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating track:", error);
      toast({ title: "Error", description: "Failed to update track", variant: "destructive" });
      return false;
    }
    toast({ title: "Success", description: "Track updated" });
    await fetchTracks();
    return true;
  };

  const deleteTrack = async (id: string): Promise<boolean> => {
    // First unlink all weeks from this track
    await supabase.from("program_weeks").update({ track_id: null }).eq("track_id", id);
    
    const { error } = await supabase
      .from("program_tracks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting track:", error);
      toast({ title: "Error", description: "Failed to delete track", variant: "destructive" });
      return false;
    }
    toast({ title: "Success", description: "Track deleted" });
    await fetchTracks();
    return true;
  };

  const duplicateTrack = async (sourceTrackId: string, newName: string, newGoalMatch: string): Promise<ProgramTrack | null> => {
    // Get the source track
    const sourceTrack = tracks.find(t => t.id === sourceTrackId);
    if (!sourceTrack) return null;

    // Create new track
    const newSlug = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newTrack = await createTrack({
      name: newName,
      slug: newSlug,
      description: sourceTrack.description,
      goal_match: newGoalMatch,
      display_order: tracks.length + 1,
      is_active: true,
    });

    if (!newTrack) return null;

    // Get all weeks for the source track
    const { data: sourceWeeks, error: weeksError } = await supabase
      .from("program_weeks")
      .select("*")
      .eq("track_id", sourceTrackId)
      .order("week_number");

    if (weeksError || !sourceWeeks) {
      console.error("Error fetching source weeks:", weeksError);
      return newTrack;
    }

    // Duplicate each week
    for (const week of sourceWeeks) {
      const { data: newWeek, error: weekError } = await supabase
        .from("program_weeks")
        .insert({
          week_number: week.week_number,
          phase: week.phase,
          title: week.title,
          focus_description: week.focus_description,
          conditioning_notes: week.conditioning_notes,
          recovery_notes: week.recovery_notes,
          scripture_reference: week.scripture_reference,
          video_url: week.video_url,
          video_title: week.video_title,
          video_description: week.video_description,
          track_id: newTrack.id,
        })
        .select()
        .single();

      if (weekError || !newWeek) continue;

      // Get all day workouts for this week
      const { data: dayWorkouts } = await supabase
        .from("program_day_workouts")
        .select("*")
        .eq("week_id", week.id);

      if (!dayWorkouts) continue;

      // Duplicate each day workout
      for (const dayWorkout of dayWorkouts) {
        const { data: newDayWorkout, error: dayError } = await supabase
          .from("program_day_workouts")
          .insert({
            week_id: newWeek.id,
            day_of_week: dayWorkout.day_of_week,
            workout_name: dayWorkout.workout_name,
            workout_description: dayWorkout.workout_description,
            is_rest_day: dayWorkout.is_rest_day,
            display_order: dayWorkout.display_order,
          })
          .select()
          .single();

        if (dayError || !newDayWorkout) continue;

        // Get all exercises for this day workout
        const { data: exercises } = await supabase
          .from("program_day_exercises")
          .select("*")
          .eq("day_workout_id", dayWorkout.id);

        if (!exercises || exercises.length === 0) continue;

        // Duplicate all exercises
        const newExercises = exercises.map(ex => ({
          day_workout_id: newDayWorkout.id,
          exercise_name: ex.exercise_name,
          sets: ex.sets,
          reps_or_time: ex.reps_or_time,
          rest: ex.rest,
          notes: ex.notes,
          section_type: ex.section_type,
          scaling_options: ex.scaling_options,
          display_order: ex.display_order,
        }));

        await supabase.from("program_day_exercises").insert(newExercises);
      }
    }

    toast({ title: "Success", description: `Track "${newName}" duplicated with all weeks, workouts, and exercises` });
    return newTrack;
  };

  const getTrackByGoal = (goal: string | null): ProgramTrack | null => {
    if (!goal) return tracks[0] || null;
    // Case-insensitive match
    const normalizedGoal = goal.toLowerCase().trim();
    return tracks.find(t => t.goal_match.toLowerCase().trim() === normalizedGoal) || tracks[0] || null;
  };

  return {
    tracks,
    loading,
    fetchTracks,
    createTrack,
    updateTrack,
    deleteTrack,
    duplicateTrack,
    getTrackByGoal,
  };
}
