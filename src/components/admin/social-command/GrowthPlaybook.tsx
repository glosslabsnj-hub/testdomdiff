import { useState } from "react";
import {
  TrendingUp,
  Loader2,
  Sparkles,
  Target,
  Clock,
  CheckCircle2,
  Circle,
  Flame,
  Trophy,
  Calendar,
  Users,
  MessageCircle,
  Camera,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useInstagramInsights } from "@/hooks/useInstagramInsights";

interface DailyAction {
  action: string;
  when: string;
  time_needed: string;
  why: string;
  how: string;
}

interface EngagementStrategy {
  daily_actions: DailyAction[];
  posting_schedule: {
    best_times: string[];
    why: string;
  };
  engagement_targets: {
    comments_to_leave: number;
    dms_to_send: number;
    stories_to_post: number;
    replies_to_own_comments: string;
  };
  creators_to_engage: Array<{
    handle: string;
    why: string;
    what_to_comment: string;
  }>;
  todays_hashtag_sets: string[][];
  growth_tip: string;
}

// Growth milestones from 50K to 1M
const MILESTONES = [
  { target: 50000, label: "50K", color: "text-gray-400", description: "Where Dom is NOW. The grind starts here." },
  { target: 75000, label: "75K", color: "text-blue-400", description: "Momentum building. Consistent posting + engagement pays off." },
  { target: 100000, label: "100K", color: "text-green-400", description: "The first big milestone. Creator tools unlock. Brand deals come in." },
  { target: 150000, label: "150K", color: "text-yellow-400", description: "Verified territory. Collabs get easier. Algorithm starts pushing." },
  { target: 250000, label: "250K", color: "text-orange-400", description: "Quarter million. Major brand attention. Speaking opportunities." },
  { target: 500000, label: "500K", color: "text-red-400", description: "Half a million. You're a household name in the niche." },
  { target: 750000, label: "750K", color: "text-purple-400", description: "Almost there. The final push. Legacy territory." },
  { target: 1000000, label: "1M", color: "text-amber-400", description: "THE GOAL. One million. Dom Different is a movement." },
];

const DAILY_CHECKLIST = [
  { id: "prayer", label: "Morning Prayer + Gratitude", time: "5:00 AM", icon: "🙏", category: "foundation" },
  { id: "story_am", label: "Post Morning Story (behind the scenes)", time: "6:00 AM", icon: "📱", category: "content" },
  { id: "workout", label: "Film Workout Content", time: "6:30 AM", icon: "💪", category: "content" },
  { id: "reply_comments", label: "Reply to ALL comments (last 12hrs)", time: "8:00 AM", icon: "💬", category: "engagement" },
  { id: "engage_10", label: "Leave 10 genuine comments on other creators", time: "9:00 AM", icon: "🔥", category: "engagement" },
  { id: "post_main", label: "Post main content (Reel/Carousel)", time: "11:00 AM", icon: "📸", category: "content" },
  { id: "dms", label: "Reply to DMs + send 3 outreach DMs", time: "12:00 PM", icon: "✉️", category: "engagement" },
  { id: "story_mid", label: "Midday Story (poll, question, or hot take)", time: "2:00 PM", icon: "📊", category: "content" },
  { id: "engage_10_2", label: "Leave 10 more comments on bigger accounts", time: "4:00 PM", icon: "🔥", category: "engagement" },
  { id: "post_evening", label: "Post evening content (if 2-a-day)", time: "6:00 PM", icon: "📸", category: "content" },
  { id: "story_pm", label: "Evening Story (day recap, life moment)", time: "8:00 PM", icon: "📱", category: "content" },
  { id: "plan_tomorrow", label: "Plan tomorrow's content", time: "9:00 PM", icon: "📝", category: "planning" },
];

const GROWTH_TACTICS = [
  {
    title: "The Comment Blitz",
    description: "Leave 20 genuine comments on accounts bigger than you. NOT 'nice post' — real, thoughtful comments that make people click your profile.",
    difficulty: "Easy",
    impact: "High",
    time: "30 min/day",
  },
  {
    title: "Trend Jacking",
    description: "Find trending audio on Instagram Reels. Film your own version within 2 hours. Use the EXACT trending audio. The algorithm pushes these HARD.",
    difficulty: "Medium",
    impact: "Very High",
    time: "1 hour",
  },
  {
    title: "Collab Chain",
    description: "Do a collab with someone your size. Their followers see you. You do another. Chain reaction. Aim for 2 collabs per month minimum.",
    difficulty: "Medium",
    impact: "Very High",
    time: "Varies",
  },
  {
    title: "Story Engagement Loop",
    description: "Post a poll or question sticker in your story. Everyone who responds gets a DM back. This builds real relationships AND boosts your reach.",
    difficulty: "Easy",
    impact: "Medium",
    time: "20 min",
  },
  {
    title: "The Controversy Play",
    description: "Post a hot take that you genuinely believe. Something that splits the room 50/50. Let people argue in comments. Engagement through the ROOF.",
    difficulty: "Easy",
    impact: "Very High",
    time: "15 min",
  },
  {
    title: "Hashtag Research",
    description: "Use a mix: 10 big hashtags (1M+ posts), 10 medium (100K-1M), 10 small (10K-100K). Small ones = you rank higher. Big ones = you get discovered.",
    difficulty: "Easy",
    impact: "Medium",
    time: "15 min",
  },
  {
    title: "Reel Hooks Database",
    description: "Save every hook that stops YOUR scroll. Screen record it. Study why it worked. Adapt it to your niche. Build a library of proven hooks.",
    difficulty: "Easy",
    impact: "High",
    time: "Ongoing",
  },
  {
    title: "Cross-Platform Repurpose",
    description: "Every Reel becomes a TikTok, a YouTube Short, and a Twitter clip. One piece of content = 4 platforms. Quadruple your reach for free.",
    difficulty: "Easy",
    impact: "High",
    time: "30 min",
  },
];

export default function GrowthPlaybook() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [strategy, setStrategy] = useState<EngagementStrategy | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { insights: igInsights } = useInstagramInsights("domdifferent_");
  const currentFollowers = igInsights?.follower_count || 50000;

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generateStrategy = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("social-engagement-coach", {
        body: {
          mode: "engagement_strategy",
          current_followers: currentFollowers,
        },
      });
      if (error) throw error;
      setStrategy(data.result as EngagementStrategy);
      toast.success("Today's strategy is ready!");
    } catch (err) {
      toast.error("Failed to generate strategy");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const completedCount = checkedItems.size;
  const totalItems = DAILY_CHECKLIST.length;
  const completionPercent = Math.round((completedCount / totalItems) * 100);

  // Find current milestone
  const currentMilestoneIndex = MILESTONES.findIndex((m) => m.target > currentFollowers);
  const nextMilestone = MILESTONES[currentMilestoneIndex] || MILESTONES[MILESTONES.length - 1];
  const prevMilestone = MILESTONES[Math.max(0, currentMilestoneIndex - 1)];
  const progressToNext = ((currentFollowers - prevMilestone.target) / (nextMilestone.target - prevMilestone.target)) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-amber-400" />
        <div>
          <h3 className="text-lg font-bold">Growth Playbook</h3>
          <p className="text-xs text-muted-foreground">
            The roadmap from 50K to 1M. Daily actions. Weekly goals. No bullshit.
          </p>
        </div>
      </div>

      {/* Milestone Tracker */}
      <div className="rounded-lg bg-charcoal border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            Road to 1M
          </h4>
          <Badge className="bg-amber-500/20 text-amber-400 text-xs">
            {currentFollowers >= 1000 ? `${(currentFollowers / 1000).toFixed(0)}K` : currentFollowers} followers
          </Badge>
        </div>

        {/* Milestone Progress Bar */}
        <div className="relative mb-4">
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (currentFollowers / 1000000) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {MILESTONES.map((m) => (
              <div key={m.target} className="text-center" style={{ width: `${100 / MILESTONES.length}%` }}>
                <div
                  className={cn(
                    "text-[9px] font-bold",
                    currentFollowers >= m.target ? "text-amber-400" : "text-muted-foreground"
                  )}
                >
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Milestone */}
        <div className="rounded bg-amber-500/5 border border-amber-500/20 p-3">
          <div className="flex items-center gap-2">
            <Target className={cn("h-4 w-4", nextMilestone.color)} />
            <span className="text-sm font-bold">Next Target: {nextMilestone.label}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {(nextMilestone.target - currentFollowers).toLocaleString()} to go
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{nextMilestone.description}</p>
        </div>
      </div>

      {/* Daily Checklist */}
      <div className="rounded-lg bg-charcoal border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-400" />
            Today's Checklist
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{completedCount}/{totalItems}</span>
            <div className="w-20 h-1.5 bg-background rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  completionPercent === 100 ? "bg-green-500" : "bg-orange-500"
                )}
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-orange-400">{completionPercent}%</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-3 italic">
          Do EVERY single one of these today. Not some. ALL. This is how you grow. No shortcuts.
        </p>

        <div className="space-y-1">
          {DAILY_CHECKLIST.map((item) => {
            const isChecked = checkedItems.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                  isChecked
                    ? "bg-green-500/10 border border-green-500/20"
                    : "hover:bg-background/50"
                )}
              >
                {isChecked ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm mr-1">{item.icon}</span>
                <span className={cn("text-xs flex-1", isChecked && "line-through text-muted-foreground")}>
                  {item.label}
                </span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {item.time}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Daily Strategy */}
      <div className="rounded-lg bg-charcoal border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            AI Daily Strategy
          </h4>
          <Button
            size="sm"
            onClick={generateStrategy}
            disabled={isGenerating}
            className="bg-yellow-500 hover:bg-yellow-600 text-black gap-1.5 text-xs"
          >
            {isGenerating ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> Generate Today's Plan</>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Hit the button and I'll generate a SPECIFIC action plan for today — who to engage with, when to post, what hashtags to use, everything.
        </p>

        {strategy && (
          <div className="space-y-3 pt-2">
            {/* Daily Actions */}
            {strategy.daily_actions?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-yellow-400">Today's Actions:</p>
                {strategy.daily_actions.map((action, i) => (
                  <div key={i} className="rounded bg-background/50 border border-border p-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[9px]">{action.when}</Badge>
                      <Badge variant="outline" className="text-[9px] bg-yellow-500/10 text-yellow-400">{action.time_needed}</Badge>
                    </div>
                    <p className="text-xs font-medium">{action.action}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Why: {action.why}</p>
                    <p className="text-[10px] text-green-400 mt-0.5">How: {action.how}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Posting Schedule */}
            {strategy.posting_schedule && (
              <div className="rounded bg-blue-500/5 border border-blue-500/20 p-2.5">
                <p className="text-xs font-bold text-blue-400 mb-1">Best Times to Post Today:</p>
                <div className="flex gap-2 mb-1">
                  {strategy.posting_schedule.best_times?.map((t, i) => (
                    <Badge key={i} className="bg-blue-500/20 text-blue-400 text-xs">{t}</Badge>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">{strategy.posting_schedule.why}</p>
              </div>
            )}

            {/* Engagement Targets */}
            {strategy.engagement_targets && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded bg-background/50 border border-border p-2 text-center">
                  <p className="text-lg font-bold text-orange-400">{strategy.engagement_targets.comments_to_leave}</p>
                  <p className="text-[10px] text-muted-foreground">Comments to Leave</p>
                </div>
                <div className="rounded bg-background/50 border border-border p-2 text-center">
                  <p className="text-lg font-bold text-purple-400">{strategy.engagement_targets.dms_to_send}</p>
                  <p className="text-[10px] text-muted-foreground">DMs to Send</p>
                </div>
                <div className="rounded bg-background/50 border border-border p-2 text-center">
                  <p className="text-lg font-bold text-green-400">{strategy.engagement_targets.stories_to_post}</p>
                  <p className="text-[10px] text-muted-foreground">Stories to Post</p>
                </div>
                <div className="rounded bg-background/50 border border-border p-2 text-center">
                  <p className="text-sm font-bold text-blue-400">{strategy.engagement_targets.replies_to_own_comments}</p>
                  <p className="text-[10px] text-muted-foreground">Reply to Comments</p>
                </div>
              </div>
            )}

            {/* Creators to Engage */}
            {strategy.creators_to_engage?.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-purple-400">Creators to Engage With Today:</p>
                {strategy.creators_to_engage.map((c, i) => (
                  <div key={i} className="rounded bg-background/50 border border-border p-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-purple-400" />
                      <span className="text-xs font-medium">{c.handle}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{c.why}</p>
                    <p className="text-[10px] text-green-400 mt-0.5">Example comment: "{c.what_to_comment}"</p>
                  </div>
                ))}
              </div>
            )}

            {/* Growth Tip */}
            {strategy.growth_tip && (
              <div className="rounded bg-amber-500/5 border border-amber-500/20 p-3">
                <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" /> Today's Growth Insight
                </p>
                <p className="text-xs mt-1">{strategy.growth_tip}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Growth Tactics */}
      <div className="rounded-lg bg-charcoal border border-border p-4">
        <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
          <Flame className="h-4 w-4 text-red-400" />
          Growth Tactics (Proven Strategies)
        </h4>
        <p className="text-xs text-muted-foreground mb-3">
          These are the exact tactics that take accounts from 50K to 1M. Not theory. Proven results.
        </p>

        <div className="space-y-2">
          {GROWTH_TACTICS.map((tactic, i) => (
            <div key={i} className="rounded bg-background/50 border border-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold">{tactic.title}</span>
                <Badge variant="outline" className={cn(
                  "text-[9px]",
                  tactic.impact === "Very High" ? "bg-red-500/10 text-red-400" :
                  tactic.impact === "High" ? "bg-orange-500/10 text-orange-400" :
                  "bg-yellow-500/10 text-yellow-400"
                )}>
                  {tactic.impact} Impact
                </Badge>
                <Badge variant="outline" className="text-[9px]">{tactic.time}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{tactic.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
