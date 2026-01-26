import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Target, 
  Dumbbell, 
  Clock, 
  ClipboardCheck, 
  ChevronRight,
  Sunrise,
  Moon,
  Sparkles,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckIns } from "@/hooks/useCheckIns";

interface MissionItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  priority: number;
  isComplete: boolean;
  timeEstimate?: string;
  itemsRemaining?: number;
}

export function RollCallToday() {
  const { profile, subscription: authSubscription } = useAuth();
  const { isCoaching, isMembership } = useEffectiveSubscription();
  const { morningRoutines, eveningRoutines, completions, streak } = useDailyDiscipline();
  const { checkIns, getCurrentWeekNumber } = useCheckIns();
  
  const [currentHour] = useState(() => new Date().getHours());
  const isMorning = currentHour < 12;
  const isEvening = currentHour >= 18;
  
  // Calculate current week based on subscription
  const currentWeek = useMemo(() => {
    if (authSubscription?.started_at) {
      const startDate = new Date(authSubscription.started_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));
    }
    return getCurrentWeekNumber();
  }, [authSubscription, getCurrentWeekNumber]);
  
  // Calculate routine completions
  const morningComplete = morningRoutines.every(r => completions.has(r.id));
  const eveningComplete = eveningRoutines.every(r => completions.has(r.id));
  const morningRemaining = morningRoutines.filter(r => !completions.has(r.id)).length;
  const eveningRemaining = eveningRoutines.filter(r => !completions.has(r.id)).length;
  
  // Check if weekly check-in is due (Friday-Sunday)
  const dayOfWeek = new Date().getDay();
  const isCheckInDue = dayOfWeek >= 5 || dayOfWeek === 0; // Fri, Sat, Sun
  const hasSubmittedThisWeek = checkIns.some(c => c.week_number === currentWeek);
  
  // Check if user has completed orientation
  const hasWatchedVideo = profile?.onboarding_video_watched;
  const isNewUser = profile?.intake_completed_at 
    ? (Date.now() - new Date(profile.intake_completed_at).getTime()) / (1000 * 60 * 60 * 24) <= 7
    : false;
  
  // Build priority queue of missions
  const missions: MissionItem[] = useMemo(() => {
    const items: MissionItem[] = [];
    
    // Priority 1: Orientation (highest priority for new users)
    if (isNewUser && !hasWatchedVideo) {
      items.push({
        id: "orientation",
        title: isCoaching ? "Complete Orientation" : "Complete Intake Processing",
        subtitle: "Watch your welcome video and get set up",
        href: "/dashboard/start-here",
        icon: Target,
        priority: 1,
        isComplete: false,
        timeEstimate: "5 min",
      });
    }
    
    // Priority 2: Morning routine (before noon)
    if (isMorning && morningRoutines.length > 0) {
      items.push({
        id: "morning",
        title: isCoaching ? "Complete Morning Routine" : "Lights On",
        subtitle: morningComplete ? "Morning discipline ✓" : "Start your day with discipline",
        href: "/dashboard/discipline",
        icon: Sunrise,
        priority: 2,
        isComplete: morningComplete,
        itemsRemaining: morningRemaining,
        timeEstimate: "15 min",
      });
    }
    
    // Priority 3: Today's workout
    items.push({
      id: "workout",
      title: isCoaching 
        ? "Complete Today's Training" 
        : isMembership 
          ? "Hit Yard Time" 
          : "Continue The Sentence",
      subtitle: isCoaching 
        ? "Your personalized workout is ready" 
        : isMembership 
          ? "Your bodyweight session is ready" 
          : `Week ${currentWeek} training`,
      href: isMembership ? "/dashboard/workouts" : "/dashboard/program",
      icon: Dumbbell,
      priority: 3,
      isComplete: false, // We'd need to track daily workout completion
      timeEstimate: "45 min",
    });
    
    // Priority 4: Evening routine (after 6pm)
    if (isEvening && eveningRoutines.length > 0) {
      items.push({
        id: "evening",
        title: isCoaching ? "Complete Evening Routine" : "Lights Out",
        subtitle: eveningComplete ? "Evening discipline ✓" : "End your day with discipline",
        href: "/dashboard/discipline",
        icon: Moon,
        priority: 4,
        isComplete: eveningComplete,
        itemsRemaining: eveningRemaining,
        timeEstimate: "10 min",
      });
    }
    
    // Priority 5: Weekly check-in (Fri-Sun)
    if (isCheckInDue && !hasSubmittedThisWeek) {
      items.push({
        id: "checkin",
        title: isCoaching ? "Submit Weekly Report" : "Submit Roll Call",
        subtitle: `Week ${currentWeek} accountability due`,
        href: "/dashboard/check-in",
        icon: ClipboardCheck,
        priority: 5,
        isComplete: false,
      });
    }
    
    // Sort by priority and filter incomplete first
    return items.sort((a, b) => {
      if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1;
      return a.priority - b.priority;
    });
  }, [
    isNewUser, hasWatchedVideo, isCoaching, isMembership, isMorning, isEvening,
    morningRoutines, eveningRoutines, morningComplete, eveningComplete,
    morningRemaining, eveningRemaining, currentWeek, isCheckInDue, hasSubmittedThisWeek
  ]);
  
  // Get the next mission (first incomplete)
  const nextMission = missions.find(m => !m.isComplete);
  const completedCount = missions.filter(m => m.isComplete).length;
  const totalMissions = missions.length;
  const progressPercent = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;
  
  // All missions complete - show celebration state
  const allComplete = missions.length > 0 && missions.every(m => m.isComplete);
  
  if (missions.length === 0) return null;
  
  return (
    <Card className="mb-8 bg-gradient-to-br from-primary/10 via-card to-card border-primary/30 overflow-hidden">
      <CardContent className="p-0">
        {/* Header with streak */}
        <div className="p-4 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-lg">
              {isCoaching ? "Today's Mission" : "Today's Roll Call"}
            </h3>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary">{streak} day streak</span>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>{completedCount} of {totalMissions} complete</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        
        {allComplete ? (
          // Celebration state
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h4 className="text-xl font-display font-bold text-primary mb-2">
              {isCoaching ? "Mission Complete" : "Day Served"}
            </h4>
            <p className="text-muted-foreground text-sm mb-4">
              {isCoaching 
                ? "You've completed today's mission. Rest up and come back tomorrow."
                : "You've earned your rest today. Tomorrow, we go again."}
            </p>
            <Button variant="outline" asChild>
              <Link to="/dashboard/progress">
                View Progress
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        ) : nextMission && (
          // Next mission CTA
          <div className="p-4 pt-4">
            <Link 
              to={nextMission.href}
              className="block p-4 rounded-xl bg-charcoal/50 border border-primary/20 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <nextMission.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {nextMission.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {nextMission.subtitle}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {nextMission.timeEstimate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {nextMission.timeEstimate}
                      </span>
                    )}
                    {nextMission.itemsRemaining !== undefined && nextMission.itemsRemaining > 0 && (
                      <span className="text-xs text-primary">
                        {nextMission.itemsRemaining} items remaining
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
            
            {/* Up next preview */}
            {missions.filter(m => !m.isComplete && m.id !== nextMission.id).length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Up next:</p>
                <div className="flex flex-wrap gap-2">
                  {missions
                    .filter(m => !m.isComplete && m.id !== nextMission.id)
                    .slice(0, 3)
                    .map(mission => (
                      <Link
                        key={mission.id}
                        to={mission.href}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal/30 hover:bg-charcoal/50 border border-border/30 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <mission.icon className="w-3 h-3" />
                        {mission.title.replace("Complete ", "").replace("Hit ", "").replace("Submit ", "")}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RollCallToday;
