import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useMemo } from "react";

export type CalendarSlotStatus = "planned" | "drafted" | "recorded" | "posted" | "skipped";
export type Platform = "instagram" | "tiktok" | "youtube" | "twitter";
export type TimeSlot = "morning" | "afternoon" | "evening";

export interface CalendarSlot {
  id: string;
  scheduled_date: string;
  day_of_week: number;
  time_slot: TimeSlot;
  platform: Platform;
  content_type: string | null;
  content_post_id: string | null;
  title: string;
  notes: string | null;
  hook: string | null;
  talking_points: string[];
  filming_tips: string | null;
  cta: string | null;
  strategy_type: string | null;
  category: string | null;
  status: CalendarSlotStatus;
  created_at: string;
  updated_at: string;
}

export interface CalendarSlotInput {
  scheduled_date: string;
  day_of_week: number;
  time_slot: TimeSlot;
  platform: Platform;
  content_type?: string;
  content_post_id?: string;
  title: string;
  notes?: string;
  hook?: string;
  talking_points?: string[];
  filming_tips?: string;
  cta?: string;
  strategy_type?: string;
  category?: string;
  status?: CalendarSlotStatus;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function useContentCalendar() {
  const queryClient = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(0);

  const { weekStart, weekEnd, weekDates } = useMemo(() => {
    const now = new Date();
    const start = getWeekStart(now);
    start.setDate(start.getDate() + weekOffset * 7);
    const end = getWeekEnd(start);
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return { weekStart: start, weekEnd: end, weekDates: dates };
  }, [weekOffset]);

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["social-content-calendar", formatDate(weekStart), formatDate(weekEnd)],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("social_content_calendar")
        .select("*")
        .gte("scheduled_date", formatDate(weekStart))
        .lte("scheduled_date", formatDate(weekEnd))
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      return data as CalendarSlot[];
    },
  });

  const createSlot = useMutation({
    mutationFn: async (input: CalendarSlotInput) => {
      const { data, error } = await (supabase as any)
        .from("social_content_calendar")
        .insert({ ...input, status: input.status || "planned" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-content-calendar"] });
      toast.success("Slot added to calendar");
    },
    onError: (error: any) => {
      toast.error("Failed to create calendar slot");
      console.error(error);
    },
  });

  const updateSlot = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarSlot> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("social_content_calendar")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-content-calendar"] });
    },
    onError: (error: any) => {
      toast.error("Failed to update slot");
      console.error(error);
    },
  });

  const deleteSlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("social_content_calendar")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-content-calendar"] });
      toast.success("Slot removed");
    },
    onError: (error: any) => {
      toast.error("Failed to delete slot");
      console.error(error);
    },
  });

  const bulkCreateSlots = useMutation({
    mutationFn: async (inputs: CalendarSlotInput[]) => {
      const { data, error } = await (supabase as any)
        .from("social_content_calendar")
        .insert(inputs.map((i) => ({ ...i, status: i.status || "planned" })))
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-content-calendar"] });
      toast.success("Calendar auto-filled!");
    },
    onError: (error: any) => {
      toast.error("Failed to auto-fill calendar");
      console.error(error);
    },
  });

  const goToThisWeek = () => setWeekOffset(0);
  const goToPrevWeek = () => setWeekOffset((o) => o - 1);
  const goToNextWeek = () => setWeekOffset((o) => o + 1);

  const getSlotsByDayAndTime = (dayIndex: number, timeSlot: TimeSlot) =>
    slots.filter(
      (s) => s.day_of_week === dayIndex && s.time_slot === timeSlot
    );

  const stats = useMemo(() => {
    const posted = slots.filter((s) => s.status === "posted").length;
    const planned = slots.filter((s) => s.status === "planned").length;
    const drafted = slots.filter((s) => s.status === "drafted").length;
    const recorded = slots.filter((s) => s.status === "recorded").length;
    return { total: slots.length, posted, planned, drafted, recorded, remaining: planned + drafted + recorded };
  }, [slots]);

  return {
    slots,
    isLoading,
    weekStart,
    weekEnd,
    weekDates,
    weekOffset,
    createSlot,
    updateSlot,
    deleteSlot,
    bulkCreateSlots,
    goToThisWeek,
    goToPrevWeek,
    goToNextWeek,
    getSlotsByDayAndTime,
    stats,
  };
}
