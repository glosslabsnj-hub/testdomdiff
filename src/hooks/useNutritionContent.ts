import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export interface NutritionGuideline {
  id: string;
  content_type: "meal_structure" | "grocery_list" | "rule" | "template";
  title: string;
  content: Json;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useNutritionGuidelines() {
  const [guidelines, setGuidelines] = useState<NutritionGuideline[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGuidelines = async () => {
    try {
      const { data, error } = await supabase
        .from("nutrition_guidelines")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setGuidelines((data || []) as NutritionGuideline[]);
    } catch (e: any) {
      console.error("Error fetching nutrition guidelines:", e);
    } finally {
      setLoading(false);
    }
  };

  const createGuideline = async (guideline: Omit<NutritionGuideline, "id" | "created_at" | "updated_at">) => {
    try {
      const { error } = await supabase.from("nutrition_guidelines").insert(guideline);
      if (error) throw error;
      await fetchGuidelines();
      toast({ title: "Success", description: "Guideline created" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const updateGuideline = async (id: string, updates: Partial<NutritionGuideline>) => {
    try {
      const { error } = await supabase.from("nutrition_guidelines").update(updates).eq("id", id);
      if (error) throw error;
      await fetchGuidelines();
      toast({ title: "Success", description: "Guideline updated" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  const deleteGuideline = async (id: string) => {
    try {
      const { error } = await supabase.from("nutrition_guidelines").delete().eq("id", id);
      if (error) throw error;
      await fetchGuidelines();
      toast({ title: "Success", description: "Guideline deleted" });
      return true;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, []);

  return { guidelines, loading, fetchGuidelines, createGuideline, updateGuideline, deleteGuideline };
}
