import { useState } from "react";
import {
  Star, Shield, ShieldCheck, Crown, Award, Swords,
  ClipboardCheck, Dumbbell, Flame, Trophy, Cog, Zap,
  BookOpen, Heart, MessageCircle, Users, Target, TrendingUp,
  KeyRound, ChevronDown, ChevronUp, Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useGamification, type Badge } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { UpgradeNudge } from "@/components/dashboard/UpgradeNudge";

const iconMap: Record<string, any> = {
  Star, Shield, ShieldCheck, Crown, Award, Swords,
  ClipboardCheck, Dumbbell, Flame, Trophy, Cog, Zap,
  BookOpen, Heart, MessageCircle, Users, Target, TrendingUp,
  KeyRound,
};

const categoryColors: Record<string, string> = {
  streak: "text-orange-400",
  workout: "text-red-400",
  discipline: "text-blue-400",
  faith: "text-purple-400",
  community: "text-green-400",
  milestone: "text-yellow-400",
};

const categoryLabels: Record<string, string> = {
  streak: "Streaks",
  workout: "Iron Pile",
  discipline: "Discipline",
  faith: "Chapel",
  community: "The Yard",
  milestone: "Milestones",
};

function BadgeItem({ badge }: { badge: Badge }) {
  const Icon = iconMap[badge.icon] || Star;
  const earned = badge.earnedAt !== null;

  return (
    <motion.div
      initial={earned ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all",
        earned
          ? "bg-primary/10 border-primary/30 shadow-sm"
          : "bg-muted/30 border-border/30 opacity-50"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center",
        earned ? "bg-primary/20" : "bg-muted/50"
      )}>
        {earned ? (
          <Icon className={cn("w-5 h-5", categoryColors[badge.category])} />
        ) : (
          <Lock className="w-4 h-4 text-muted-foreground/50" />
        )}
      </div>
      <span className={cn(
        "text-xs font-medium text-center leading-tight",
        earned ? "text-foreground" : "text-muted-foreground"
      )}>
        {badge.name}
      </span>
      <span className="text-xs text-muted-foreground text-center leading-tight">
        {earned ? badge.description : badge.requirement}
      </span>
    </motion.div>
  );
}

export function GamificationCard() {
  const {
    loading,
    currentStreak,
    longestStreak,
    badges,
    earnedCount,
    totalCount,
    accountabilityScore,
    scoreBreakdown,
  } = useGamification();
  const [showAllBadges, setShowAllBadges] = useState(false);

  if (loading) return null;

  const recentBadges = badges.filter(b => b.earnedAt).slice(0, 4);
  const categories = ["streak", "workout", "discipline", "faith", "community", "milestone"];

  return (
    <Card className="mb-6 border-primary/20 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Good Behavior Record
          </CardTitle>
          <BadgeUI variant="outline" className="text-xs">
            {earnedCount}/{totalCount}
          </BadgeUI>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak + Score Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Streak */}
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Flame className={cn(
                "w-5 h-5",
                currentStreak > 0 ? "text-orange-400 animate-pulse" : "text-muted-foreground"
              )} />
              <span className="text-2xl font-bold text-orange-400">{currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Days of Good Behavior</p>
            {longestStreak > currentStreak && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">Best: {longestStreak} days</p>
            )}
          </div>

          {/* Weekly Score */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-primary" />
              <span className={cn(
                "text-2xl font-bold",
                accountabilityScore >= 80 ? "text-green-400" :
                accountabilityScore >= 50 ? "text-yellow-400" : "text-red-400"
              )}>
                {accountabilityScore}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Weekly Score</p>
          </div>
        </div>

        {/* Upgrade nudge for Solitary users with 7+ day streak */}
        {currentStreak >= 7 && <UpgradeNudge trigger="streak_7" />}

        {/* Score Breakdown */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Weekly Breakdown</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Discipline", value: scoreBreakdown.discipline, max: 25, color: "bg-blue-400" },
              { label: "Workouts", value: scoreBreakdown.workouts, max: 25, color: "bg-red-400" },
              { label: "Check-In", value: scoreBreakdown.checkIn, max: 25, color: "bg-green-400" },
              { label: "Nutrition", value: scoreBreakdown.nutrition, max: 25, color: "bg-purple-400" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="relative w-full h-1.5 bg-muted rounded-full mb-1">
                  <div
                    className={cn("absolute left-0 top-0 h-full rounded-full transition-all", item.color)}
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="block text-xs font-medium">{item.value}/{item.max}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Badges */}
        {recentBadges.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Earned Badges</p>
            <div className="grid grid-cols-4 gap-2">
              {recentBadges.map(badge => (
                <BadgeItem key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        )}

        {/* Expandable Full Badge Grid */}
        <Collapsible open={showAllBadges} onOpenChange={setShowAllBadges}>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary hover:underline w-full justify-center py-1">
            {showAllBadges ? (
              <>Hide All Badges <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>View All {totalCount} Badges <ChevronDown className="w-3 h-3" /></>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AnimatePresence>
              {showAllBadges && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-4"
                >
                  {categories.map(cat => {
                    const catBadges = badges.filter(b => b.category === cat);
                    if (catBadges.length === 0) return null;
                    return (
                      <div key={cat}>
                        <p className={cn("text-xs font-semibold mb-2", categoryColors[cat])}>
                          {categoryLabels[cat]}
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {catBadges.map(badge => (
                            <BadgeItem key={badge.id} badge={badge} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export function StreakCounter() {
  const { currentStreak, loading } = useGamification();

  if (loading || currentStreak === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30">
      <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
      <span className="text-sm font-bold text-orange-400">{currentStreak}</span>
      <span className="text-xs text-muted-foreground hidden sm:inline">day streak</span>
    </div>
  );
}
