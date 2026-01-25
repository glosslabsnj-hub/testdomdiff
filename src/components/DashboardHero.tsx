import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Flame, BookOpen, ArrowRight, Quote, Sun, Moon, Sunset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyVerse } from "@/hooks/useDailyVerse";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { calculateCurrentWeek } from "@/lib/weekCalculator";

export function DashboardHero() {
  const { profile, subscription } = useAuth();
  const { verse } = useDailyVerse();
  const { streak } = useDailyDiscipline();

  const planType = subscription?.plan_type;
  const isCoaching = planType === "coaching";

  // Calculate current week in program
  const currentWeek = useMemo(() => {
    if (subscription?.started_at) {
      return calculateCurrentWeek(subscription.started_at);
    }
    return 1;
  }, [subscription?.started_at]);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", icon: Sun, period: "morning" };
    if (hour < 17) return { text: "Good afternoon", icon: Sunset, period: "afternoon" };
    return { text: "Good evening", icon: Moon, period: "evening" };
  }, []);

  // Personalized message based on progress
  const motivationalMessage = useMemo(() => {
    if (!profile?.intake_completed_at) {
      return "Your journey begins now.";
    }
    
    const daysSinceStart = subscription?.started_at
      ? Math.floor((Date.now() - new Date(subscription.started_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysSinceStart <= 7) {
      return "Week 1 — Build the foundation.";
    } else if (currentWeek <= 4) {
      return `Week ${currentWeek} of 12 — Momentum is building.`;
    } else if (currentWeek <= 8) {
      return `Week ${currentWeek} of 12 — You're in the thick of it. Stay locked in.`;
    } else if (currentWeek <= 11) {
      return `Week ${currentWeek} of 12 — The finish line is in sight.`;
    } else if (currentWeek >= 12) {
      return "Final week — Finish what you started.";
    }
    
    return "Every rep counts. Every day matters.";
  }, [profile, subscription, currentWeek]);

  const firstName = profile?.first_name || "Warrior";
  const GreetingIcon = greeting.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-charcoal via-charcoal-dark to-charcoal border border-steel-light/20 p-6 md:p-8 mb-8">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10">
        {/* Top row: Greeting + Streak */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <GreetingIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">{greeting.text},</p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {firstName}
              </h2>
            </div>
          </div>

          {/* Streak Badge */}
          {streak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30">
              <Flame className="w-5 h-5 text-primary animate-pulse" />
              <div>
                <span className="text-primary font-bold text-lg">{streak}</span>
                <span className="text-primary/80 text-sm ml-1">Day Streak</span>
              </div>
            </div>
          )}
        </div>

        {/* Motivational message */}
        <p className="text-muted-foreground mb-6 text-sm md:text-base">
          {motivationalMessage}
        </p>

        {/* Scripture of the Day */}
        <div className="relative p-4 md:p-5 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
          <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-charcoal border border-steel-light/20 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Scripture of the Day</span>
          </div>

          <div className="mt-2">
            <Quote className="w-6 h-6 text-primary/30 mb-2" />
            <p className="text-foreground font-medium leading-relaxed text-sm md:text-base italic">
              "{verse.text}"
            </p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-primary text-sm font-semibold">
                — {verse.reference}
              </p>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
                <Link to="/dashboard/faith" className="flex items-center gap-1">
                  {isCoaching ? "More in Faith & Mindset" : "More in Chapel"}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
