import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Save,
  CalendarPlus,
  RefreshCw,
  Instagram,
  Twitter,
  Youtube,
  Zap,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useContentEngine, type ContentPostInput, type ContentCategory, type ContentMode, type ContentStrategyType } from "@/hooks/useContentEngine";
import { useSocialCommand } from "@/hooks/useSocialCommand";
import { toast } from "sonner";

const PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-400" },
  { value: "tiktok", label: "TikTok", icon: Zap, color: "text-cyan-400" },
  { value: "youtube", label: "YouTube", icon: Youtube, color: "text-red-400" },
  { value: "twitter", label: "Twitter/X", icon: Twitter, color: "text-blue-400" },
];

const CONTENT_TYPES: Record<string, string[]> = {
  instagram: ["Reel", "Carousel", "Story", "Live", "Post"],
  tiktok: ["Short Video", "Duet", "Stitch", "Live", "Photo Mode"],
  youtube: ["Short", "Long-form", "Community Post", "Live"],
  twitter: ["Tweet", "Thread", "Poll", "Spaces"],
};

const CATEGORIES: { value: ContentCategory | "surprise"; label: string }[] = [
  { value: "surprise", label: "Surprise Me" },
  { value: "faith", label: "Faith & God" },
  { value: "discipline", label: "Discipline & Structure" },
  { value: "training", label: "Workout & Training" },
  { value: "hustle", label: "Money & Hustle" },
  { value: "controversy", label: "Hot Takes & Controversy" },
  { value: "story", label: "Dom's Story & Personal" },
  { value: "transformations", label: "Transformations" },
  { value: "authority", label: "Education & Authority" },
  { value: "culture", label: "Culture & Lifestyle" },
  { value: "platform", label: "Platform-Led" },
];

const STRATEGIES: { value: ContentStrategyType | "surprise"; label: string; emoji: string }[] = [
  { value: "surprise", label: "Surprise Me", emoji: "🎲" },
  { value: "hot_take", label: "Hot Take", emoji: "🔥" },
  { value: "trending", label: "Trending Format", emoji: "📈" },
  { value: "story", label: "Story / Vulnerability", emoji: "📖" },
  { value: "value", label: "Value Drop", emoji: "💎" },
  { value: "engagement", label: "Engagement Bait", emoji: "💬" },
  { value: "promo", label: "Promotion", emoji: "📢" },
];

interface GeneratedIdea extends ContentPostInput {
  target_platform?: string;
  content_type?: string;
}

interface Props {
  onSchedule?: (idea: GeneratedIdea) => void;
  onGenerateScript?: (idea: GeneratedIdea) => void;
}

export default function EnhancedGenerator({ onSchedule, onGenerateScript }: Props) {
  const { createPost } = useContentEngine();
  const { activePlatforms } = useSocialCommand();

  const [platform, setPlatform] = useState("");
  const [contentType, setContentType] = useState("");
  const [category, setCategory] = useState<ContentCategory | "surprise">("surprise");
  const [mode, setMode] = useState<ContentMode>("done_for_you");
  const [strategy, setStrategy] = useState<ContentStrategyType | "surprise">("surprise");
  const [generating, setGenerating] = useState(false);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [expandedIdea, setExpandedIdea] = useState<number | null>(null);

  const generate = async () => {
    setGenerating(true);
    setIdeas([]);
    try {
      const { data, error } = await supabase.functions.invoke("social-generate-content", {
        body: {
          platform: platform || undefined,
          content_type: contentType || undefined,
          category,
          mode,
          strategy_type: strategy,
        },
      });
      if (error) throw error;
      setIdeas(data.ideas || []);
      if (data.ideas?.length > 0) setExpandedIdea(0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate content. Check your API key.");
    } finally {
      setGenerating(false);
    }
  };

  const saveIdea = (idea: GeneratedIdea) => {
    createPost.mutate({
      category: idea.category as ContentCategory,
      mode: idea.mode as ContentMode,
      title: idea.title,
      platforms: idea.platforms,
      format: idea.format,
      hook: idea.hook,
      talking_points: idea.talking_points,
      filming_tips: idea.filming_tips,
      cta: idea.cta,
      strategy_type: idea.strategy_type as ContentStrategyType,
      hashtags: idea.hashtags,
      why_it_works: idea.why_it_works,
    });
  };

  const platformColor: Record<string, string> = {
    instagram: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    tiktok: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    youtube: "bg-red-500/20 text-red-400 border-red-500/30",
    twitter: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Platform</label>
          <Select value={platform} onValueChange={(v) => { setPlatform(v); setContentType(""); }}>
            <SelectTrigger className="bg-charcoal"><SelectValue placeholder="Any platform" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Platform</SelectItem>
              {PLATFORMS.filter((p) => activePlatforms.length === 0 || activePlatforms.includes(p.value)).map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {platform && platform !== "any" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Content Type</label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="bg-charcoal"><SelectValue placeholder="Any type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Type</SelectItem>
                {(CONTENT_TYPES[platform] || []).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Category</label>
          <Select value={category} onValueChange={(v) => setCategory(v as ContentCategory | "surprise")}>
            <SelectTrigger className="bg-charcoal"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Strategy</label>
          <Select value={strategy} onValueChange={(v) => setStrategy(v as ContentStrategyType | "surprise")}>
            <SelectTrigger className="bg-charcoal"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STRATEGIES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.emoji} {s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Mode</label>
          <Select value={mode} onValueChange={(v) => setMode(v as ContentMode)}>
            <SelectTrigger className="bg-charcoal"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="done_for_you">Done-For-You</SelectItem>
              <SelectItem value="freestyle">Freestyle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={generate}
        disabled={generating}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2"
      >
        {generating ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Generating with Claude...</>
        ) : (
          <><Sparkles className="h-4 w-4" /> Generate 3 Ideas</>
        )}
      </Button>

      {/* Results */}
      {ideas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Generated Ideas</h3>
            <Button variant="ghost" size="sm" onClick={generate} disabled={generating} className="text-xs gap-1">
              <RefreshCw className="h-3 w-3" /> Regenerate
            </Button>
          </div>

          {ideas.map((idea, i) => (
            <div
              key={i}
              className="rounded-lg bg-charcoal border border-border overflow-hidden"
            >
              {/* Header */}
              <button
                className="w-full p-4 flex items-start gap-3 text-left"
                onClick={() => setExpandedIdea(expandedIdea === i ? null : i)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {idea.target_platform && (
                      <Badge variant="outline" className={cn("text-[10px]", platformColor[idea.target_platform])}>
                        {idea.target_platform}
                      </Badge>
                    )}
                    {idea.strategy_type && (
                      <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-400 border-orange-500/30">
                        {idea.strategy_type?.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                  <p className="font-semibold text-sm">{idea.title}</p>
                  <p className="text-xs text-muted-foreground italic mt-1 line-clamp-2">"{idea.hook}"</p>
                </div>
                {expandedIdea === i ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>

              {/* Expanded */}
              {expandedIdea === i && (
                <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                  {idea.format && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Format</p>
                      <p className="text-sm">{idea.format}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Talking Points</p>
                    <ul className="list-disc pl-4 text-sm space-y-1 mt-1">
                      {idea.talking_points?.map((tp, j) => <li key={j}>{tp}</li>)}
                    </ul>
                  </div>

                  {idea.filming_tips && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Filming Tips</p>
                      <p className="text-sm">{idea.filming_tips}</p>
                    </div>
                  )}

                  {idea.cta && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">CTA</p>
                      <p className="text-sm">{idea.cta}</p>
                    </div>
                  )}

                  {idea.hashtags && idea.hashtags.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Hashtags</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {idea.hashtags.map((h, j) => (
                          <Badge key={j} variant="secondary" className="text-[10px]">
                            {h.startsWith("#") ? h : `#${h}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {idea.why_it_works && (
                    <div className="flex items-start gap-2 p-2 rounded bg-primary/5 border border-primary/20">
                      <Lightbulb className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">{idea.why_it_works}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => saveIdea(idea)}>
                      <Save className="h-3 w-3" /> Save to Library
                    </Button>
                    {onGenerateScript && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20" onClick={() => onGenerateScript(idea)}>
                        <FileText className="h-3 w-3" /> Generate Script
                      </Button>
                    )}
                    {onSchedule && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => onSchedule(idea)}>
                        <CalendarPlus className="h-3 w-3" /> Schedule It
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
