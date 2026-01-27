import { useState } from "react";
import { Loader2, Sparkles, Save, RefreshCw, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useContentGenerator, type ContentCategory, type ContentMode, type ContentPostInput } from "@/hooks/useContentEngine";

interface ContentGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (post: ContentPostInput) => void;
}

const categories: { value: ContentCategory | "surprise"; label: string }[] = [
  { value: "surprise", label: "🎲 Surprise Me" },
  { value: "faith", label: "Faith & Redemption" },
  { value: "discipline", label: "Discipline & Structure" },
  { value: "training", label: "Workout & Training" },
  { value: "transformations", label: "Transformations" },
  { value: "authority", label: "Education & Authority" },
  { value: "platform", label: "Platform-Led" },
];

const modes: { value: ContentMode; label: string; description: string }[] = [
  { value: "done_for_you", label: "Done-For-You", description: "Complete scripts ready to record" },
  { value: "freestyle", label: "Freestyle", description: "Flexible frameworks to make your own" },
];

export default function ContentGeneratorModal({
  open,
  onOpenChange,
  onSave,
}: ContentGeneratorModalProps) {
  const [category, setCategory] = useState<ContentCategory | "surprise">("surprise");
  const [mode, setMode] = useState<ContentMode>("done_for_you");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<ContentPostInput[]>([]);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());

  const { generateContent } = useContentGenerator();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSavedIndices(new Set());
    try {
      const ideas = await generateContent(category, mode);
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
      const ideas = await generateContent(category, mode);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-400" />
            Generate Fresh Content Ideas
          </DialogTitle>
        </DialogHeader>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Category
            </label>
            <Select value={category} onValueChange={(v) => setCategory(v as ContentCategory | "surprise")}>
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modes.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    <div>
                      <span>{m.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        — {m.description}
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
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
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
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{idea.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {idea.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-orange-400 border-orange-500/30">
                          {idea.mode === "done_for_you" ? "Done-For-You" : "Freestyle"}
                        </Badge>
                        {idea.platforms.map((p) => (
                          <Badge key={p} variant="outline" className="text-xs text-muted-foreground">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {savedIndices.has(index) && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Check className="h-3 w-3 mr-1" />
                        Saved
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-3">
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

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button
                      size="sm"
                      onClick={() => handleSave(idea, index)}
                      disabled={savedIndices.has(index)}
                      className="gap-1 bg-orange-500 hover:bg-orange-600"
                    >
                      {savedIndices.has(index) ? (
                        <>
                          <Check className="h-4 w-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save to Library
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerate(index)}
                      disabled={isGenerating}
                      className="gap-1"
                    >
                      <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                      Regenerate
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
                      className="text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                      Skip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
