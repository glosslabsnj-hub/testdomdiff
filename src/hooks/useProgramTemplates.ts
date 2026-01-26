import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TemplateCategory {
  id: string;
  name: string;
  description: string | null;
  target_profile: string | null;
  icon: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

export interface ProgramTemplate {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  difficulty: string | null;
  days_per_week: number | null;
  equipment: string[] | null;
  goal_focus: string | null;
  display_order: number | null;
  is_active: boolean | null;
  category?: TemplateCategory;
}

export interface TemplateWeek {
  id: string;
  template_id: string | null;
  week_number: number;
  title: string | null;
  focus_description: string | null;
}

export interface TemplateDay {
  id: string;
  week_id: string | null;
  day_of_week: string;
  workout_name: string;
  workout_description: string | null;
  is_rest_day: boolean | null;
  display_order: number | null;
}

export interface TemplateExercise {
  id: string;
  day_id: string | null;
  section_type: string | null;
  exercise_name: string;
  sets: string | null;
  reps_or_time: string | null;
  rest: string | null;
  notes: string | null;
  demo_url: string | null;
  display_order: number | null;
}

// Fetch all categories
export function useTemplateCategories() {
  return useQuery({
    queryKey: ["template-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_template_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data as TemplateCategory[];
    },
  });
}

// Fetch all templates with optional category filter
export function useProgramTemplates(categoryId?: string) {
  return useQuery({
    queryKey: ["program-templates", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("program_templates")
        .select(`
          *,
          category:program_template_categories(*)
        `)
        .eq("is_active", true)
        .order("display_order");

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProgramTemplate[];
    },
  });
}

// Fetch a single template with all its weeks, days, and exercises
export function useTemplateDetails(templateId: string | null) {
  return useQuery({
    queryKey: ["template-details", templateId],
    queryFn: async () => {
      if (!templateId) return null;

      // Get template
      const { data: template, error: templateError } = await supabase
        .from("program_templates")
        .select(`
          *,
          category:program_template_categories(*)
        `)
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;

      // Get weeks
      const { data: weeks, error: weeksError } = await supabase
        .from("program_template_weeks")
        .select("*")
        .eq("template_id", templateId)
        .order("week_number");

      if (weeksError) throw weeksError;

      // Get days for all weeks
      const weekIds = weeks.map((w) => w.id);
      const { data: days, error: daysError } = await supabase
        .from("program_template_days")
        .select("*")
        .in("week_id", weekIds)
        .order("display_order");

      if (daysError) throw daysError;

      // Get exercises for all days
      const dayIds = days.map((d) => d.id);
      const { data: exercises, error: exercisesError } = await supabase
        .from("program_template_exercises")
        .select("*")
        .in("day_id", dayIds)
        .order("display_order");

      if (exercisesError) throw exercisesError;

      return {
        template: template as ProgramTemplate,
        weeks: weeks as TemplateWeek[],
        days: days as TemplateDay[],
        exercises: exercises as TemplateExercise[],
      };
    },
    enabled: !!templateId,
  });
}

// Create a new template
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<ProgramTemplate, "id" | "category">) => {
      const { data: template, error } = await supabase
        .from("program_templates")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-templates"] });
      toast.success("Template created");
    },
    onError: (error) => {
      toast.error("Failed to create template: " + error.message);
    },
  });
}

// Update a template
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ProgramTemplate> & { id: string }) => {
      const { data: template, error } = await supabase
        .from("program_templates")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-templates"] });
      queryClient.invalidateQueries({ queryKey: ["template-details"] });
      toast.success("Template updated");
    },
    onError: (error) => {
      toast.error("Failed to update template: " + error.message);
    },
  });
}

// Assign a template to a client (copies structure to client_program_* tables)
export function useAssignTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      templateId,
      suggestedCategoryId,
      matchScore,
    }: {
      clientId: string;
      templateId: string;
      suggestedCategoryId?: string;
      matchScore?: number;
    }) => {
      // Get the current user as assigner
      const { data: { user } } = await supabase.auth.getUser();

      // Record the assignment
      const { error: assignError } = await supabase
        .from("client_template_assignments")
        .insert({
          client_id: clientId,
          template_id: templateId,
          suggested_category_id: suggestedCategoryId || null,
          match_score: matchScore || null,
          assigned_by: user?.id || null,
        });

      if (assignError) throw assignError;

      // Get the template details
      const { data: weeks } = await supabase
        .from("program_template_weeks")
        .select("*")
        .eq("template_id", templateId)
        .order("week_number");

      if (!weeks) throw new Error("No weeks found for template");

      // Delete existing client program weeks
      await supabase
        .from("client_program_weeks")
        .delete()
        .eq("client_id", clientId);

      // Copy weeks to client_program_weeks
      for (const week of weeks) {
        const { data: clientWeek, error: weekError } = await supabase
          .from("client_program_weeks")
          .insert({
            client_id: clientId,
            week_number: week.week_number,
            title: week.title,
            focus_description: week.focus_description,
            phase: "custom",
          })
          .select()
          .single();

        if (weekError) throw weekError;

        // Get days for this week
        const { data: days } = await supabase
          .from("program_template_days")
          .select("*")
          .eq("week_id", week.id)
          .order("display_order");

        if (!days) continue;

        // Copy days to client_program_days
        for (const day of days) {
          const { data: clientDay, error: dayError } = await supabase
            .from("client_program_days")
            .insert({
              week_id: clientWeek.id,
              day_of_week: day.day_of_week,
              workout_name: day.workout_name,
              workout_description: day.workout_description,
              is_rest_day: day.is_rest_day,
              display_order: day.display_order,
            })
            .select()
            .single();

          if (dayError) throw dayError;

          // Get exercises for this day
          const { data: exercises } = await supabase
            .from("program_template_exercises")
            .select("*")
            .eq("day_id", day.id)
            .order("display_order");

          if (!exercises || exercises.length === 0) continue;

          // Copy exercises to client_program_exercises
          const clientExercises = exercises.map((ex) => ({
            day_id: clientDay.id,
            section_type: ex.section_type || "main",
            exercise_name: ex.exercise_name,
            sets: ex.sets,
            reps_or_time: ex.reps_or_time,
            rest: ex.rest,
            notes: ex.notes,
            demo_url: ex.demo_url,
            display_order: ex.display_order,
          }));

          const { error: exercisesError } = await supabase
            .from("client_program_exercises")
            .insert(clientExercises);

          if (exercisesError) throw exercisesError;
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-program"] });
      toast.success("Template assigned to client");
    },
    onError: (error) => {
      toast.error("Failed to assign template: " + error.message);
    },
  });
}
