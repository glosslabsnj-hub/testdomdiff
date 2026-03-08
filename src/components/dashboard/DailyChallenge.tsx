import { useState, useMemo, useEffect } from "react";
import { Zap, CheckCircle2, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

// Rotating daily challenges - different one each day
const CHALLENGES = [
  { id: "cold_shower", title: "Cold Shower Challenge", description: "End your shower with 60 seconds of cold water. Builds mental toughness.", difficulty: "Medium", xp: 15 },
  { id: "extra_pushups", title: "50 Extra Push-Ups", description: "Drop and give me 50. Spread them throughout the day if needed.", difficulty: "Hard", xp: 20 },
  { id: "no_phone_morning", title: "No Phone First Hour", description: "Don't touch your phone for the first hour after waking. Be present.", difficulty: "Medium", xp: 15 },
  { id: "gratitude_list", title: "Write 10 Gratitudes", description: "Write down 10 things you're grateful for. Shift your mindset.", difficulty: "Easy", xp: 10 },
  { id: "walk_mile", title: "Walk a Mile", description: "Get outside and walk at least one mile today. Fresh air heals.", difficulty: "Easy", xp: 10 },
  { id: "extra_water", title: "Gallon of Water", description: "Drink a full gallon of water today. Hydration is discipline.", difficulty: "Medium", xp: 15 },
  { id: "memorize_verse", title: "Memorize a Verse", description: "Pick a Bible verse and memorize it word for word by end of day.", difficulty: "Medium", xp: 15 },
  { id: "plank_hold", title: "5-Minute Plank Hold", description: "Accumulate 5 minutes of plank hold today. Break it up however you need.", difficulty: "Hard", xp: 20 },
  { id: "no_sugar", title: "Zero Sugar Day", description: "No added sugar today. Read labels. Build food discipline.", difficulty: "Hard", xp: 20 },
  { id: "encourage_someone", title: "Encourage Someone", description: "Send a genuine encouraging message to someone today.", difficulty: "Easy", xp: 10 },
  { id: "early_wake", title: "5 AM Wake-Up", description: "Set your alarm for 5 AM. Win the morning, win the day.", difficulty: "Hard", xp: 20 },
  { id: "stretch_15", title: "15-Min Stretch", description: "Spend 15 minutes stretching and mobilizing. Your body will thank you.", difficulty: "Easy", xp: 10 },
  { id: "journal_page", title: "Full Page Journal", description: "Write at least one full page in your journal. Raw, honest thoughts.", difficulty: "Medium", xp: 15 },
  { id: "burpee_challenge", title: "30 Burpees", description: "Complete 30 burpees. All at once or spread out. Just finish them.", difficulty: "Hard", xp: 20 },
  { id: "pray_15", title: "15-Min Prayer", description: "Set a timer and pray for 15 uninterrupted minutes.", difficulty: "Medium", xp: 15 },
  { id: "no_complaints", title: "Zero Complaints Day", description: "Don't complain about anything today. Catch yourself and redirect.", difficulty: "Hard", xp: 20 },
  { id: "clean_space", title: "Clean Your Space", description: "Deep clean your room or workspace. External order creates internal order.", difficulty: "Easy", xp: 10 },
  { id: "abs_circuit", title: "Ab Circuit", description: "100 crunches, 50 leg raises, 60-second plank. Core strength.", difficulty: "Medium", xp: 15 },
  { id: "fast_meal", title: "Skip One Meal", description: "Practice intermittent fasting. Skip one meal today (not breakfast if training).", difficulty: "Hard", xp: 20 },
  { id: "read_chapter", title: "Read a Chapter", description: "Read one full chapter of a book today. Feed your mind.", difficulty: "Easy", xp: 10 },
  { id: "sprint_intervals", title: "Sprint Intervals", description: "Do 6 x 30-second all-out sprints with 90-sec rest between.", difficulty: "Hard", xp: 20 },
];

function getTodaysChallenge(): typeof CHALLENGES[0] {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return CHALLENGES[dayOfYear % CHALLENGES.length];
}

export function DailyChallenge() {
  const { user } = useAuth();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");
  const challenge = useMemo(() => getTodaysChallenge(), []);

  // Check if already completed today
  useEffect(() => {
    if (!user) return;
    supabase
      .from("habit_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .eq("habit_name", `challenge_${challenge.id}`)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCompleted(true);
      });
  }, [user, today, challenge.id]);

  const handleComplete = async () => {
    if (!user || completed) return;
    setLoading(true);
    try {
      await supabase.from("habit_logs").insert({
        user_id: user.id,
        log_date: today,
        habit_name: `challenge_${challenge.id}`,
        completed: true,
      });
      setCompleted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#C9A54D", "#FFD700"],
      });
    } catch (e) {
      console.error("Error completing challenge:", e);
    } finally {
      setLoading(false);
    }
  };

  const difficultyColor = challenge.difficulty === "Hard" ? "text-red-400 bg-red-400/15" :
    challenge.difficulty === "Medium" ? "text-yellow-400 bg-yellow-400/15" : "text-green-400 bg-green-400/15";

  return (
    <Card className={cn(
      "mb-6 border-primary/20 overflow-hidden transition-all",
      completed && "border-green-500/30 bg-green-500/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            completed ? "bg-green-500/20" : "bg-primary/20"
          )}>
            {completed ? (
              <Trophy className="w-5 h-5 text-green-400" />
            ) : (
              <Zap className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-medium text-sm">Daily Challenge</h4>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", difficultyColor)}>
                {challenge.difficulty}
              </span>
              <span className="text-[10px] text-primary font-medium">+{challenge.xp} XP</span>
            </div>
            <p className="font-semibold text-sm mb-0.5">{challenge.title}</p>
            <p className="text-xs text-muted-foreground mb-2">{challenge.description}</p>
            {completed ? (
              <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Challenge Completed!
              </div>
            ) : (
              <Button
                size="sm"
                variant="gold"
                onClick={handleComplete}
                disabled={loading}
                className="gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Complete Challenge
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
