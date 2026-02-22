import { Instagram, Twitter, Youtube, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useSocialCommand } from "@/hooks/useSocialCommand";
import ProfileOptimizer from "./ProfileOptimizer";
import TrendScanner from "./TrendScanner";

const platformMeta: Record<string, { icon: React.ElementType; color: string; label: string; tips: string[] }> = {
  instagram: {
    icon: Instagram,
    color: "text-pink-400",
    label: "Instagram",
    tips: [
      "Post Reels at least 4x/week — IG is pushing Reels hard",
      "Use 20-30 hashtags in a comment, not the caption",
      "Story polls and Q&As boost engagement signals",
      "Carousel posts get the highest save rate",
      "First 1.5 seconds of a Reel decide if it gets shown",
    ],
  },
  tiktok: {
    icon: Zap,
    color: "text-cyan-400",
    label: "TikTok",
    tips: [
      "Raw > polished. TikTok rewards authenticity",
      "Use trending sounds even if unrelated — algorithm boost",
      "Post 1-3x/day for fastest growth",
      "Videos that work without sound still need captions",
      "First 3 seconds are everything. Hook or die",
    ],
  },
  youtube: {
    icon: Youtube,
    color: "text-red-400",
    label: "YouTube",
    tips: [
      "Shorts are the fastest way to grow subscribers",
      "Title + thumbnail > content quality for clicks",
      "Post Shorts daily if possible, long-form 1-2x/week",
      "End every Short with 'Subscribe for more' CTA",
      "Use keyword-rich descriptions for search",
    ],
  },
  twitter: {
    icon: Twitter,
    color: "text-blue-400",
    label: "Twitter/X",
    tips: [
      "Tweet 3-5x/day minimum. Volume wins on Twitter",
      "Threads outperform single tweets for impressions",
      "No hashtags in tweet body — they look spammy",
      "Quote tweet viral posts with your take",
      "Engage in replies. The algorithm rewards conversation",
    ],
  },
};

export default function PlatformDashboard() {
  const { config, activePlatforms } = useSocialCommand();

  const platforms = activePlatforms.length > 0
    ? activePlatforms
    : ["instagram", "tiktok", "youtube", "twitter"];

  const handles: Record<string, string> = {
    instagram: config?.instagram_handle || "",
    tiktok: config?.tiktok_handle || "",
    youtube: config?.youtube_handle || "",
    twitter: config?.twitter_handle || "",
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue={platforms[0]} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-charcoal border border-border inline-flex h-auto gap-1 p-1 min-w-max">
            {platforms.map((p) => {
              const meta = platformMeta[p];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <TabsTrigger
                  key={p}
                  value={p}
                  className={cn("text-xs h-8 px-3 gap-1.5 data-[state=active]:bg-muted/50")}
                >
                  <Icon className={cn("h-3.5 w-3.5", meta.color)} />
                  <span className="hidden sm:inline">{meta.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {platforms.map((p) => {
          const meta = platformMeta[p];
          if (!meta) return null;
          const Icon = meta.icon;

          return (
            <TabsContent key={p} value={p} className="space-y-6 mt-4">
              {/* Platform Tips */}
              <div className="rounded-lg bg-charcoal border border-border p-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Icon className={cn("h-4 w-4", meta.color)} />
                  {meta.label} Playbook
                </h3>
                <ul className="space-y-2">
                  {meta.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className={cn("font-bold text-xs mt-0.5", meta.color)}>{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Profile Optimizer */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Profile Optimizer</h3>
                <ProfileOptimizer platform={p} handle={handles[p]} />
              </div>

              {/* Trend Scanner */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Trend Scanner</h3>
                <TrendScanner platform={p} />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
