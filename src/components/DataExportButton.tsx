import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function DataExportButton() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);

    try {
      const userId = user.id;

      // Fetch all user data in parallel
      const [
        profileRes,
        checkInsRes,
        habitsRes,
        mealFeedbackRes,
        workoutLogsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("check_ins").select("*").eq("user_id", userId).order("submitted_at", { ascending: false }),
        supabase.from("habit_logs").select("*").eq("user_id", userId).order("log_date", { ascending: false }),
        supabase.from("meal_feedback").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("workout_logs").select("*").eq("user_id", userId).order("completed_at", { ascending: false }),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        profile: profileRes.data || null,
        check_ins: checkInsRes.data || [],
        habit_logs: habitsRes.data || [],
        meal_feedback: mealFeedbackRes.data || [],
        workout_logs: workoutLogsRes.data || [],
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `redeemed-strength-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch (err) {
      console.error("Export failed:", err);
      toast({
        title: "Export Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
      className="gap-2"
    >
      {exporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {exporting ? "Exporting..." : "Export My Data"}
    </Button>
  );
}
