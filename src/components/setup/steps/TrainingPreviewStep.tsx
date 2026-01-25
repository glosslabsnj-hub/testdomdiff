import { useState, useEffect } from "react";
import { Dumbbell, Calendar, Check, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface TrainingPreviewStepProps {
  onReady: () => void;
}

interface DayWorkout {
  id: string;
  workout_name: string;
  is_rest_day: boolean;
  display_order: number;
}

export default function TrainingPreviewStep({ onReady }: TrainingPreviewStepProps) {
  const { isMembership, isCoaching, isTransformation } = useEffectiveSubscription();
  const [dayWorkouts, setDayWorkouts] = useState<DayWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  // Fetch Week 1 workouts
  useEffect(() => {
    const fetchWeek1Workouts = async () => {
      try {
        // First get Week 1
        const { data: weekData } = await supabase
          .from("program_weeks")
          .select("id")
          .eq("week_number", 1)
          .single();

        if (weekData?.id) {
          const { data: workoutsData } = await supabase
            .from("program_day_workouts")
            .select("id, workout_name, is_rest_day, display_order")
            .eq("week_id", weekData.id)
            .order("display_order");

          setDayWorkouts(workoutsData || []);
        }
      } catch (error) {
        console.error("Error fetching workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeek1Workouts();
  }, []);

  // Enable proceed when confirmed
  useEffect(() => {
    if (confirmed) {
      onReady();
    }
  }, [confirmed, onReady]);

  // Auto-enable for membership (simpler flow)
  useEffect(() => {
    if (isMembership) {
      onReady();
    }
  }, [isMembership, onReady]);

  const handleConfirm = () => {
    setConfirmed(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Day name mapping
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Preview Your Training</h2>
        <p className="text-muted-foreground">
          {isMembership 
            ? "Here are your 4 bodyweight workout templates."
            : "Here's what Week 1 of your program looks like."}
        </p>
      </div>

      {/* Week 1 Preview */}
      <div className="bg-charcoal rounded-xl border border-border overflow-hidden mb-6">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">
              {isMembership ? "Your Workout Templates" : "Week 1 Schedule"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isMembership ? "Use these anytime" : "Your first 7 days"}
            </p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {dayWorkouts && dayWorkouts.length > 0 ? (
            dayWorkouts.slice(0, 7).map((workout, idx) => (
              <div 
                key={workout.id}
                className={cn(
                  "p-4 flex items-center gap-4",
                  workout.is_rest_day && "bg-muted/20"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                  workout.is_rest_day 
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary/20 text-primary"
                )}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">
                    {dayNames[idx]}
                  </p>
                  <p className={cn(
                    "text-sm truncate",
                    workout.is_rest_day ? "text-muted-foreground italic" : "text-muted-foreground"
                  )}>
                    {workout.is_rest_day ? "Active Recovery" : workout.workout_name}
                  </p>
                </div>
                {!workout.is_rest_day && (
                  <Dumbbell className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            ))
          ) : (
            // Fallback for membership or no data
            <>
              {["Push Day", "Pull Day", "Legs Day", "Full Body"].map((name, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{name}</p>
                    <p className="text-sm text-muted-foreground">Bodyweight template</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Confirmation */}
      <div className="bg-charcoal rounded-xl border border-primary/30 p-6 text-center">
        <h3 className="font-semibold mb-2">
          {confirmed ? "You're Ready to Train!" : "Does This Look Right?"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {confirmed 
            ? "We'll remind you when it's time to train."
            : "You can always adjust your workouts later."}
        </p>
        
        <Button 
          variant={confirmed ? "steel" : "gold"} 
          onClick={handleConfirm}
          className="gap-2"
          disabled={confirmed}
        >
          {confirmed ? (
            <>
              <Check className="w-4 h-4" />
              Looks Good
            </>
          ) : (
            "Confirm Training Plan"
          )}
        </Button>
      </div>

      {/* Why This Matters */}
      <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <h4 className="font-medium text-foreground text-sm mb-1">💡 Why This Matters</h4>
        <p className="text-sm text-muted-foreground">
          Knowing what's coming helps you mentally prepare. Each workout is designed to build 
          progressively, so trust the process and show up every day.
        </p>
      </div>
    </div>
  );
}
