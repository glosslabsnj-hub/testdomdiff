import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RoutineItem {
  routine_type: "morning" | "evening";
  time_slot: string;
  action_text: string;
  display_order: number;
}

export interface DisciplineTemplate {
  id: string;
  name: string;
  description: string | null;
  category: "general" | "beginner" | "advanced" | "military" | "faith_focused";
  routines: RoutineItem[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useDisciplineTemplates() {
  const [templates, setTemplates] = useState<DisciplineTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("discipline_templates")
        .select("*")
        .order("display_order");

      if (error) throw error;
      
      // Parse the JSONB routines field
      const parsed = (data || []).map(t => ({
        ...t,
        routines: (t.routines as unknown as RoutineItem[]) || [],
      })) as DisciplineTemplate[];
      
      setTemplates(parsed);
    } catch (e: any) {
      console.error("Error fetching discipline templates:", e);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (
    template: Omit<DisciplineTemplate, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { error } = await supabase.from("discipline_templates").insert({
        ...template,
        routines: JSON.stringify(template.routines),
      });

      if (error) throw error;
      await fetchTemplates();
      toast({ title: "Success", description: "Template created" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const updateTemplate = async (
    id: string,
    updates: Partial<DisciplineTemplate>
  ) => {
    try {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.routines) {
        updateData.routines = JSON.stringify(updates.routines);
      }

      const { error } = await supabase
        .from("discipline_templates")
        .update(updateData)
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
      const { error } = await supabase
        .from("discipline_templates")
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

  return {
    templates,
    loading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
