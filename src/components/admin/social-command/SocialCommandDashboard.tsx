import {
  Library,
  CalendarDays,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle,
  Clock,
  Film,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useContentEngine } from "@/hooks/useContentEngine";
import { useContentCalendar } from "@/hooks/useContentCalendar";
import { useSocialCommand } from "@/hooks/useSocialCommand";

interface Props {
  onNavigate: (tab: string) => void;
}

export default function SocialCommandDashboard({ onNavigate }: Props) {
  const { posts } = useContentEngine();
  const { stats, slots, weekDates } = useContentCalendar();
  const { config, activePlatforms } = useSocialCommand();

  // Content strategy compliance (80/20 rule)
  const promoCount = posts.filter((p) => p.strategy_type === "promo").length;
  const totalPosts = posts.length;
  const promoRate = totalPosts > 0 ? Math.round((promoCount / totalPosts) * 100) : 0;
  const strategyScore = promoRate <= 20 ? 100 : Math.max(0, 100 - (promoRate - 20) * 5);

  // Upcoming 3 days
  const today = new Date();
  const upcomingSlots = slots
    .filter((s) => {
      const d = new Date(s.scheduled_date);
      return d >= today && s.status !== "posted" && s.status !== "skipped";
    })
    .slice(0, 5);

  const statCards = [
    {
      label: "Content in Library",
      value: totalPosts,
      icon: Library,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      action: () => onNavigate("library"),
    },
    {
      label: "Posted This Week",
      value: stats.posted,
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
      action: () => onNavigate("calendar"),
    },
    {
      label: "Posts Remaining",
      value: stats.remaining,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      action: () => onNavigate("calendar"),
    },
    {
      label: "Strategy Score",
      value: `${strategyScore}%`,
      icon: Target,
      color: strategyScore >= 80 ? "text-green-400" : strategyScore >= 50 ? "text-amber-400" : "text-red-400",
      bg: strategyScore >= 80 ? "bg-green-500/10" : strategyScore >= 50 ? "bg-amber-500/10" : "bg-red-500/10",
      action: () => onNavigate("library"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={card.action}
              className={cn(
                "rounded-lg border border-border p-4 text-left transition-all hover:border-muted-foreground",
                card.bg
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={cn("h-4 w-4", card.color)} />
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2 text-left items-start"
          onClick={() => onNavigate("generator")}
        >
          <Film className="h-5 w-5 text-orange-400" />
          <div>
            <p className="text-sm font-semibold">Generate Content</p>
            <p className="text-xs text-muted-foreground">AI-powered scripts ready to film</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2 text-left items-start"
          onClick={() => onNavigate("calendar")}
        >
          <CalendarDays className="h-5 w-5 text-blue-400" />
          <div>
            <p className="text-sm font-semibold">View Calendar</p>
            <p className="text-xs text-muted-foreground">Plan your week, track what's posted</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2 text-left items-start"
          onClick={() => onNavigate("platforms")}
        >
          <TrendingUp className="h-5 w-5 text-green-400" />
          <div>
            <p className="text-sm font-semibold">Scan Trends</p>
            <p className="text-xs text-muted-foreground">See what's working right now</p>
          </div>
        </Button>
      </div>

      {/* Upcoming Posts */}
      {upcomingSlots.length > 0 && (
        <div className="rounded-lg bg-charcoal border border-border p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-400" />
            Coming Up
          </h3>
          <div className="space-y-2">
            {upcomingSlots.map((slot) => {
              const platformColors: Record<string, string> = {
                instagram: "bg-pink-500/20 text-pink-400",
                tiktok: "bg-cyan-500/20 text-cyan-400",
                youtube: "bg-red-500/20 text-red-400",
                twitter: "bg-blue-500/20 text-blue-400",
              };
              return (
                <div key={slot.id} className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className={cn("text-[10px] shrink-0", platformColors[slot.platform])}>
                    {slot.platform}
                  </Badge>
                  <span className="flex-1 truncate">{slot.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(slot.scheduled_date).toLocaleDateString("en-US", { weekday: "short" })} {slot.time_slot}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strategy Reminder */}
      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
        <p className="text-xs text-muted-foreground">
          <span className="text-primary font-medium">80/20 Check:</span>{" "}
          {promoRate <= 20
            ? `You're at ${promoRate}% promo content. Perfect balance.`
            : `You're at ${promoRate}% promo content. Too much selling — add more value, stories, and engagement posts.`}
        </p>
      </div>
    </div>
  );
}
