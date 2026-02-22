import { useState } from "react";
import { Loader2, Sparkles, Save, RefreshCw, X, Check, Hash, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useContentGenerator, type ContentCategory, type ContentMode, type ContentStrategyType, type ContentPostInput } from "@/hooks/useContentEngine";
import { useIsMobile } from "@/hooks/use-mobile";

interface ContentGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (post: ContentPostInput) => void;
}

const categories: { value: ContentCategory | "surprise"; label: string }[] = [
  { value: "surprise", label: "Surprise Me" },
  { value: "faith", label: "Faith & Redemption" },
  { value: "discipline", label: "Discipline & Structure" },
  { value: "training", label: "Workout & Training" },
  { value: "transformations", label: "Transformations" },
  { value: "authority", label: "Education & Authority" },
  { value: "platform", label: "Platform-Led" },
  { value: "story", label: "Dom's Story & Personal" },
  { value: "culture", label: "Culture & Lifestyle" },
];

const strategyTypes: { value: ContentStrategyType | "surprise"; label: string; emoji: string; description: string }[] = [
  { value: "surprise", emoji: "🎲", label: "Surprise Me", description: "Let the engine pick the best strategy" },
  { value: "hot_take", emoji: "🔥", label: "Hot Take", description: "Controversial takes that spark debate" },
  { value: "trending", emoji: "📈", label: "Trending Format", description: "Ride viral formats and sounds" },
  { value: "story", emoji: "📖", label: "Story / Vulnerability", description: "Raw, real stories that build connection" },
  { value: "value", emoji: "💎", label: "Value Drop", description: "Free tips that make people save & share" },
  { value: "engagement", emoji: "💬", label: "Engagement Bait", description: "Questions, polls, challenges for comments" },
  { value: "promo", emoji: "📢", label: "Promotion", description: "Direct sell (use sparingly — max 20%)" },
];

const modes: { value: ContentMode; label: string; description: string }[] = [
  { value: "done_for_you", label: "Done-For-You", description: "Complete scripts ready to record" },
  { value: "freestyle", label: "Freestyle", description: "Flexible frameworks to make your own" },
];

const strategyColors: Record<string, string> = {
  hot_take: "bg-red-500/20 text-red-400 border-red-500/30",
  trending: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  story: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  value: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  engagement: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  promo: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const strategyLabels: Record<string, string> = {
  hot_take: "Hot Take",
  trending: "Trending",
  story: "Story",
  value: "Value",
  engagement: "Engagement",
  promo: "Promo",
};

export default function ContentGeneratorModal({
  open,
  onOpenChange,
  onSave,
}: ContentGeneratorModalProps) {
  const [category, setCategory] = useState<ContentCategory | "surprise">("surprise");
  const [mode, setMode] = useState<ContentMode>("done_for_you");
  const [strategyType, setStrategyType] = useState<ContentStrategyType | "surprise">("surprise");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<ContentPostInput[]>([]);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());
  const isMobile = useIsMobile();

  const { generateContent } = useContentGenerator();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSavedIndices(new Set());
    try {
      const ideas = await generateContent(category, mode, strategyType);
      setGeneratedIdeas(ideas);
    } catch (error) {
      toast.error("Failed to generate ideas. Please try again.");
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = (idea: ContentPostInput, index: number) => {
    onSave(idea);
    setSavedIndices(prev => new Set([...prev, index]));
  };

  const handleRegenerate = async (index: number) => {
    setIsGenerating(true);
    try {
      const ideas = await generateContent(category, mode, strategyType);
      if (ideas.length > 0) {
        const newIdeas = [...generatedIdeas];
        newIdeas[index] = ideas[0];
        setGeneratedIdeas(newIdeas);
        setSavedIndices(prev => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      }
    } catch (error) {
      toast.error("Failed to regenerate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setGeneratedIdeas([]);
    setSavedIndices(new Set());
    onOpenChange(false);
  };

  // Content to render inside the modal/drawer
  const content = (
    <div className="space-y-4 p-4 md:p-0">
      {/* Strategy Tip */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="text-primary font-medium">80/20 Rule:</span> 80% of your content should be value, stories, engagement, and trending formats. Only 20% should be promotional. The algorithm and your audience will reward you.
        </p>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 gap-4">
        {/* Strategy Type — The most important choice */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Content Strategy
          </label>
          <Select value={strategyType} onValueChange={(v) => setStrategyType(v as ContentStrategyType | "surprise")}>
            <SelectTrigger className="h-12 md:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {strategyTypes.map((st) => (
                <SelectItem key={st.value} value={st.value}>
                  <div className="flex flex-col">
                    <span>{st.emoji} {st.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {st.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Topic Category
          </label>
          <Select value={category} onValueChange={(v) => setCategory(v as ContentCategory | "surprise")}>
            <SelectTrigger className="h-12 md:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Content Mode
          </label>
          <Select value={mode} onValueChange={(v) => setMode(v as ContentMode)}>
            <SelectTrigger className="h-12 md:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modes.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  <div className="flex flex-col">
                    <span>{m.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {m.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Generating Ideas...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate {generatedIdeas.length > 0 ? "New " : ""}Ideas
          </>
        )}
      </Button>

      {/* Generated Ideas */}
      {generatedIdeas.length > 0 && (
        <div className="space-y-4 mt-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            {generatedIdeas.length} ideas generated — Save the ones you like
          </h3>

          {generatedIdeas.map((idea, index) => (
            <Card key={index} className="bg-charcoal border-border">
              <CardHeader className="p-3 md:p-4 pb-2">
                <div className="flex flex-col gap-2">
                  <CardTitle className="text-sm md:text-base">{idea.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-xs">
                      {idea.category}
                    </Badge>
                    {idea.strategy_type && (
                      <Badge className={`text-xs ${strategyColors[idea.strategy_type] || "bg-muted text-muted-foreground"}`}>
                        {strategyLabels[idea.strategy_type] || idea.strategy_type}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs text-orange-400 border-orange-500/30">
                      {idea.mode === "done_for_you" ? "DFY" : "Free"}
                    </Badge>
                    {idea.platforms?.map((p) => (
                      <Badge key={p} variant="outline" className="text-xs text-muted-foreground">
                        {p}
                      </Badge>
                    ))}
                    {savedIndices.has(index) && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Saved
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-2 space-y-3">
                {/* Why it works */}
                {idea.why_it_works && (
                  <div className="flex items-start gap-2 p-2 rounded bg-primary/5 border border-primary/10">
                    <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground italic">{idea.why_it_works}</p>
                  </div>
                )}

                <div>
                  <span className="text-xs font-medium text-muted-foreground">HOOK</span>
                  <p className="text-sm italic">"{idea.hook}"</p>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground">TALKING POINTS</span>
                  <ul className="text-sm space-y-1 mt-1">
                    {idea.talking_points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-400">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {idea.format && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">FORMAT</span>
                    <p className="text-sm text-muted-foreground">{idea.format}</p>
                  </div>
                )}

                {idea.filming_tips && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">HOW TO FILM</span>
                    <p className="text-sm text-muted-foreground">{idea.filming_tips}</p>
                  </div>
                )}

                {idea.cta && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">CTA</span>
                    <p className="text-sm italic">"{idea.cta}"</p>
                  </div>
                )}

                {/* Hashtags */}
                {idea.hashtags && idea.hashtags.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" /> HASHTAGS
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {idea.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions - Stack on mobile */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-border">
                  <Button
                    size="sm"
                    onClick={() => handleSave(idea, index)}
                    disabled={savedIndices.has(index)}
                    className="gap-1 bg-orange-500 hover:bg-orange-600 h-10 sm:h-8"
                  >
                    {savedIndices.has(index) ? (
                      <>
                        <Check className="h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerate(index)}
                      disabled={isGenerating}
                      className="gap-1 flex-1 h-10 sm:h-8"
                    >
                      <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                      Regen
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setGeneratedIdeas(ideas => ideas.filter((_, i) => i !== index));
                        setSavedIndices(prev => {
                          const next = new Set([...prev].filter(i => i !== index).map(i => i > index ? i - 1 : i));
                          return next;
                        });
                      }}
                      className="text-muted-foreground h-10 sm:h-8"
                    >
                      <X className="h-4 w-4" />
                      Skip
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Use Drawer on mobile, Dialog on desktop
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b border-border pb-3">
            <DrawerTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-orange-400" />
              Content Strategy Engine
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-400" />
            Content Strategy Engine
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
