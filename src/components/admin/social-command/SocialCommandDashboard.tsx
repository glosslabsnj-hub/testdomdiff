import {
  Library,
  CalendarDays,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle,
  Clock,
  Film,
  Instagram,
  Users,
  Heart,
  MessageCircle,
  FileText,
  Search,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useContentEngine } from "@/hooks/useContentEngine";
import { useContentCalendar } from "@/hooks/useContentCalendar";
import { useSocialCommand } from "@/hooks/useSocialCommand";
import { useInstagramInsights } from "@/hooks/useInstagramInsights";

interface Props {
  onNavigate: (tab: string) => void;
}

export default function SocialCommandDashboard({ onNavigate }: Props) {
  const { posts } = useContentEngine();
  const { stats, slots } = useContentCalendar();
  const { config } = useSocialCommand();
  const { insights, isLoading: igLoading } = useInstagramInsights("domdifferent_");

  // Content strategy compliance (80/20 rule)
  const promoCount = posts.filter((p) => p.strategy_type === "promo").length;
  const totalPosts = posts.length;
  const promoRate = totalPosts > 0 ? Math.round((promoCount / totalPosts) * 100) : 0;
  const strategyScore = promoRate <= 20 ? 100 : Math.max(0, 100 - (promoRate - 20) * 5);

  // Upcoming 5 posts
  const today = new Date();
  const upcomingSlots = slots
    .filter((s) => {
      const d = new Date(s.scheduled_date);
      return d >= today && s.status !== "posted" && s.status !== "skipped";
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Real IG Stats */}
      {insights && (
        <div className="rounded-lg bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-pink-500/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-400" />
              <span className="text-sm font-semibold">@domdifferent_</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-pink-400"
              onClick={() => onNavigate("ig-insights")}
            >
              View Details <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> Followers
              </p>
              <p className="text-xl font-bold">{formatNumber(insights.follower_count)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Engagement
              </p>
              <p className="text-xl font-bold">{insights.engagement_rate}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Heart className="h-3 w-3" /> Avg Likes
              </p>
              <p className="text-xl font-bold">{formatNumber(insights.avg_likes)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MessageCircle className="h-3 w-3" /> Avg Comments
              </p>
              <p className="text-xl font-bold">{formatNumber(insights.avg_comments)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatButton
          label="Content in Library"
          value={totalPosts}
          icon={Library}
          color="text-orange-400"
          bg="bg-orange-500/10"
          onClick={() => onNavigate("library")}
        />
        <StatButton
          label="Posted This Week"
          value={stats.posted}
          icon={CheckCircle}
          color="text-green-400"
          bg="bg-green-500/10"
          onClick={() => onNavigate("calendar")}
        />
        <StatButton
          label="Posts Remaining"
          value={stats.remaining}
          icon={Clock}
          color="text-amber-400"
          bg="bg-amber-500/10"
          onClick={() => onNavigate("calendar")}
        />
        <StatButton
          label="Strategy Score"
          value={`${strategyScore}%`}
          icon={Target}
          color={strategyScore >= 80 ? "text-green-400" : strategyScore >= 50 ? "text-amber-400" : "text-red-400"}
          bg={strategyScore >= 80 ? "bg-green-500/10" : strategyScore >= 50 ? "bg-amber-500/10" : "bg-red-500/10"}
          onClick={() => onNavigate("library")}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2 text-left items-start"
          onClick={() => onNavigate("scripts")}
        >
          <FileText className="h-5 w-5 text-orange-400" />
          <div>
            <p className="text-sm font-semibold">Generate Script</p>
            <p className="text-xs text-muted-foreground">Step-by-step filming guide</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2 text-left items-start"
          onClick={() => onNavigate("generator")}
        >
          <Film className="h-5 w-5 text-purple-400" />
          <div>
            <p className="text-sm font-semibold">Generate Content</p>
            <p className="text-xs text-muted-foreground">AI-powered content ideas</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2 text-left items-start"
          onClick={() => onNavigate("trends")}
        >
          <TrendingUp className="h-5 w-5 text-green-400" />
          <div>
            <p className="text-sm font-semibold">Check Trends</p>
            <p className="text-xs text-muted-foreground">See what's working now</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2 text-left items-start"
          onClick={() => onNavigate("competitors")}
        >
          <Search className="h-5 w-5 text-red-400" />
          <div>
            <p className="text-sm font-semibold">Scan Competitors</p>
            <p className="text-xs text-muted-foreground">Real data + AI analysis</p>
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

function StatButton({
  label,
  value,
  icon: Icon,
  color,
  bg,
  onClick,
}: {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  bg: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border border-border p-4 text-left transition-all hover:border-muted-foreground",
        bg
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn("h-4 w-4", color)} />
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </button>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}
