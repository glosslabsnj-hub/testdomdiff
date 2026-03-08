import { useState, useCallback, useMemo } from "react";
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
  Zap,
  Circle,
  Copy,
  CheckCircle2,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useContentEngine } from "@/hooks/useContentEngine";
import { useContentCalendar } from "@/hooks/useContentCalendar";
import { useSocialCommand } from "@/hooks/useSocialCommand";
import { useInstagramInsights } from "@/hooks/useInstagramInsights";
import { toast } from "sonner";

interface Props {
  onNavigate: (tab: string) => void;
}

// Daily hook rotation - Dom-style hooks for quick copy
const DAILY_HOOKS = [
  "They gave me 7 years. I used every single one.",
  "Nobody believed in me. Now they all watch.",
  "I built this from a prison cell mindset. What's your excuse?",
  "Discipline isn't punishment. It's freedom.",
  "You're one decision away from a completely different life.",
  "Stop planning. Start doing. The plan will reveal itself.",
  "Comfort is the enemy of everything you want.",
  "I didn't come this far to only come this far.",
  "Your past is your power. Stop hiding from it.",
  "The gym doesn't care about your feelings. Neither does success.",
  "Everyone wants the results. Nobody wants the 4 AM alarm.",
  "Prison taught me patience. Freedom taught me urgency. I use both.",
  "You're not tired. You're uninspired. Let me fix that.",
  "I went from a number to a name to a brand. Watch me.",
  "The streets lied to me. The iron never did.",
  "Your comfort zone is a prison you built yourself.",
  "I lost everything and found myself. Best trade I ever made.",
  "If you're not embarrassed by your first attempt, you started too late.",
  "Real ones move in silence. I'm loud because I earned it.",
  "Every setback is a setup. I'm living proof.",
  "Stop asking for permission to be great.",
  "The only person you need to prove wrong is yesterday's you.",
  "I didn't survive prison to play it safe out here.",
  "Your network is your net worth. Choose wisely.",
  "I'm not motivated. I'm disciplined. There's a difference.",
  "They counted me out. I counted push-ups.",
  "You don't need a new year. You need a new mindset.",
  "Success isn't about money. It's about options.",
  "I'm building an empire on the same ground they tried to bury me in.",
  "Don't tell me the sky's the limit when there are footprints on the moon.",
  "Pain is temporary. A felony is forever. But so is redemption.",
];

export default function SocialCommandDashboard({ onNavigate }: Props) {
  const { posts } = useContentEngine();
  const { stats, slots } = useContentCalendar();
  const { config } = useSocialCommand();
  const { insights, isLoading: igLoading } = useInstagramInsights("domdifferent_");
  const [hookCopied, setHookCopied] = useState(false);

  // Content strategy compliance (80/20 rule)
  const promoCount = posts.filter((p) => p.strategy_type === "promo").length;
  const totalPosts = posts.length;
  const promoRate = totalPosts > 0 ? Math.round((promoCount / totalPosts) * 100) : 0;
  const strategyScore = promoRate <= 20 ? 100 : Math.max(0, 100 - (promoRate - 20) * 5);

  // Today's posting status - check 3 slots
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todaySlots = slots.filter((s) => s.scheduled_date === todayStr);
  const morningPosted = todaySlots.some((s) => s.time_slot === "morning" && s.status === "posted");
  const afternoonPosted = todaySlots.some((s) => s.time_slot === "afternoon" && s.status === "posted");
  const eveningPosted = todaySlots.some((s) => s.time_slot === "evening" && s.status === "posted");
  const postsToday = [morningPosted, afternoonPosted, eveningPosted].filter(Boolean).length;

  // Today's hook (rotates daily based on day of year)
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const todaysHook = DAILY_HOOKS[dayOfYear % DAILY_HOOKS.length];

  const handleCopyHook = useCallback(() => {
    navigator.clipboard.writeText(todaysHook).then(() => {
      setHookCopied(true);
      toast.success("Hook copied!");
      setTimeout(() => setHookCopied(false), 2000);
    });
  }, [todaysHook]);

  // Upcoming 5 posts
  const upcomingSlots = slots
    .filter((s) => {
      const d = new Date(s.scheduled_date);
      return d >= today && s.status !== "posted" && s.status !== "skipped";
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* === POST RIGHT NOW CTA === */}
      <button
        onClick={() => onNavigate("whats-next")}
        className="w-full rounded-xl bg-gradient-to-r from-green-600/90 to-emerald-600/90 hover:from-green-500 hover:to-emerald-500 border-2 border-green-400/30 p-5 text-left transition-all hover:scale-[1.01] active:scale-[0.99] group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-2.5">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Not sure what to post? Tap here.</p>
              <p className="text-sm text-green-100/80">3 questions. Then you hit record. Zero thinking.</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-white/70 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {/* === TODAY'S POSTING STATUS === */}
      <div className="rounded-xl bg-charcoal border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-400" />
            Today's Posts
          </h3>
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            postsToday === 3 ? "bg-green-500/20 text-green-400" :
            postsToday >= 1 ? "bg-amber-500/20 text-amber-400" :
            "bg-red-500/20 text-red-400"
          )}>
            {postsToday}/3 done
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Morning", posted: morningPosted, icon: Sun, color: "text-amber-400" },
            { label: "Afternoon", posted: afternoonPosted, icon: Sunset, color: "text-orange-400" },
            { label: "Evening", posted: eveningPosted, icon: Moon, color: "text-indigo-400" },
          ].map((slot) => {
            const SlotIcon = slot.icon;
            return (
              <div
                key={slot.label}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all",
                  slot.posted
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-background/50 border-border/50"
                )}
              >
                {slot.posted ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
                <div className="flex items-center gap-1">
                  <SlotIcon className={cn("h-3 w-3", slot.posted ? "text-green-400" : slot.color)} />
                  <span className={cn(
                    "text-xs font-medium",
                    slot.posted ? "text-green-400" : "text-muted-foreground"
                  )}>
                    {slot.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* === QUICK COPY HOOK === */}
      <div className="rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-orange-400 font-semibold uppercase tracking-wider">Today's Hook</p>
          <button
            onClick={handleCopyHook}
            className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
          >
            {hookCopied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {hookCopied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-sm font-bold leading-snug">"{todaysHook}"</p>
        <p className="text-[10px] text-muted-foreground mt-2">Copy and use as your opening line. New hook every day.</p>
      </div>

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
