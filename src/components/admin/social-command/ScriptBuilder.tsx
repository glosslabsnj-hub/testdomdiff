import { useState } from "react";
import {
  FileText,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Save,
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  Camera,
  Mic,
  Clapperboard,
  ListChecks,
  Clock,
  Wrench,
  Hash,
  Image,
  Zap,
  PenLine,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useContentScripts, type ContentScript, type GenerateScriptInput } from "@/hooks/useContentScripts";
import { useContentEngine, type ContentPost } from "@/hooks/useContentEngine";
import { toast } from "sonner";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter/X" },
];

const CONTENT_TYPES: Record<string, string[]> = {
  instagram: ["Reel", "Carousel", "Story", "Live", "Post"],
  tiktok: ["Short Video", "Duet", "Stitch", "Live"],
  youtube: ["Short", "Long-form", "Community Post", "Live"],
  twitter: ["Tweet", "Thread", "Poll"],
};

const CATEGORIES = [
  { value: "hustle", label: "Money & Hustle" },
  { value: "faith", label: "Faith & God" },
  { value: "discipline", label: "Discipline" },
  { value: "training", label: "Training" },
  { value: "controversy", label: "Hot Takes" },
  { value: "story", label: "Dom's Story" },
  { value: "culture", label: "Culture" },
  { value: "transformations", label: "Transformations" },
  { value: "authority", label: "Authority" },
];

const QUICK_EXAMPLES = [
  "I'm at the beach at sunrise about to do a crazy bodyweight workout in the sand",
  "I'm at work on break and I just want to talk about why most people stay broke",
  "I'm walking my neighborhood early morning, it's cold, I want to talk about discipline",
  "I just finished praying and I feel locked in, want to film something about faith",
  "I'm cooking meal prep and want to talk about how I used to eat garbage in prison",
  "I'm with my little brother and want to show how I mentor him",
];

export default function ScriptBuilder() {
  const { scripts, isLoading, generateScript, deleteScript } = useContentScripts();
  const { posts } = useContentEngine();

  const [mode, setMode] = useState<"quick" | "scratch" | "from_idea">("quick");
  const [situation, setSituation] = useState("");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [contentType, setContentType] = useState("Reel");
  const [category, setCategory] = useState("hustle");
  const [title, setTitle] = useState("");
  const [expandedScript, setExpandedScript] = useState<string | null>(null);

  const selectedPost = posts.find((p) => p.id === selectedPostId);

  const handleGenerate = async () => {
    if (mode === "quick") {
      if (!situation.trim()) {
        toast.error("Tell me what's happening — what are you doing right now?");
        return;
      }
      await generateScript.mutateAsync({
        situation: situation.trim(),
        platform,
        content_type: contentType,
      });
      return;
    }

    const input: GenerateScriptInput = {
      platform,
      content_type: contentType,
      category,
    };

    if (mode === "from_idea" && selectedPost) {
      input.title = selectedPost.title;
      input.hook_idea = selectedPost.hook;
      input.talking_points = selectedPost.talking_points;
      input.content_post_id = selectedPost.id;
      input.category = selectedPost.category || category;
      input.platform = selectedPost.platforms?.[0] || platform;
    } else {
      input.title = title || undefined;
    }

    await generateScript.mutateAsync(input);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-orange-400" />
        <div>
          <h3 className="text-lg font-bold">Script Builder</h3>
          <p className="text-xs text-muted-foreground">
            Tell me what you're doing and get a script that's ready to film. No guesswork.
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={mode === "quick" ? "default" : "outline"}
          className={cn("text-xs gap-1.5", mode === "quick" && "bg-orange-500 hover:bg-orange-600 text-white")}
          onClick={() => setMode("quick")}
        >
          <Zap className="h-3.5 w-3.5" /> Quick Script
        </Button>
        <Button
          size="sm"
          variant={mode === "scratch" ? "default" : "outline"}
          className={cn("text-xs gap-1.5", mode === "scratch" && "bg-orange-500 hover:bg-orange-600 text-white")}
          onClick={() => setMode("scratch")}
        >
          <PenLine className="h-3.5 w-3.5" /> From Scratch
        </Button>
        <Button
          size="sm"
          variant={mode === "from_idea" ? "default" : "outline"}
          className={cn("text-xs gap-1.5", mode === "from_idea" && "bg-orange-500 hover:bg-orange-600 text-white")}
          onClick={() => setMode("from_idea")}
        >
          <BookOpen className="h-3.5 w-3.5" /> From Saved Idea
        </Button>
      </div>

      {/* Quick Script Mode */}
      {mode === "quick" && (
        <div className="rounded-lg bg-charcoal border-2 border-orange-500/30 p-4 space-y-4">
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-400" />
              What's happening right now?
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Just tell me what you're doing, where you are, or what's on your mind. I'll build the whole script.
            </p>
          </div>

          <Textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="e.g., I'm at the beach at sunrise about to do a crazy bodyweight workout in the sand. The waves are crashing, nobody else is out here. I want to talk about how most people are still sleeping while we're out here grinding..."
            className="bg-background min-h-[120px] text-sm resize-none"
            rows={5}
          />

          {/* Quick Examples */}
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase text-muted-foreground font-medium">Or try one of these:</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setSituation(ex)}
                  className="text-[10px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-orange-500/50 transition-colors"
                >
                  {ex.length > 50 ? ex.slice(0, 50) + "..." : ex}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Platform</Label>
              <Select value={platform} onValueChange={(v) => { setPlatform(v); setContentType(CONTENT_TYPES[v]?.[0] || "Reel"); }}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(CONTENT_TYPES[platform] || []).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateScript.isPending || !situation.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2 h-11 text-sm font-bold"
          >
            {generateScript.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Building Your Script...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Script</>
            )}
          </Button>
        </div>
      )}

      {/* Structured Mode */}
      {mode === "scratch" && (
        <div className="rounded-lg bg-charcoal border border-border p-4 space-y-4">
          <h4 className="text-sm font-semibold">Build from a Topic</h4>

          <div className="space-y-1.5">
            <Label className="text-xs">Topic / Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Why most people stay broke, Morning grind routine, etc."
              className="bg-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Platform</Label>
              <Select value={platform} onValueChange={(v) => { setPlatform(v); setContentType(CONTENT_TYPES[v]?.[0] || "Reel"); }}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(CONTENT_TYPES[platform] || []).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateScript.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            {generateScript.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating Script...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Full Script</>
            )}
          </Button>
        </div>
      )}

      {/* From Saved Idea Mode */}
      {mode === "from_idea" && (
        <div className="rounded-lg bg-charcoal border border-border p-4 space-y-4">
          <h4 className="text-sm font-semibold">Script from Saved Idea</h4>
          <div className="space-y-1.5">
            <Label className="text-xs">Select Content Idea</Label>
            <Select value={selectedPostId} onValueChange={setSelectedPostId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Pick a saved content idea..." />
              </SelectTrigger>
              <SelectContent>
                {posts.map((post) => (
                  <SelectItem key={post.id} value={post.id}>
                    {post.title} ({post.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPost && (
              <div className="rounded bg-background/50 p-3 border border-border mt-2">
                <p className="text-xs text-muted-foreground italic">
                  Hook: "{selectedPost.hook}"
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateScript.isPending || !selectedPostId}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            {generateScript.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating Script...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Full Script</>
            )}
          </Button>
        </div>
      )}

      {/* Scripts Library */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">
          Saved Scripts
          {scripts.length > 0 && (
            <span className="text-muted-foreground font-normal ml-2">
              ({scripts.length})
            </span>
          )}
        </h4>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : scripts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No scripts yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Generate one above to get started.
            </p>
          </div>
        ) : (
          scripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              isExpanded={expandedScript === script.id}
              onToggle={() =>
                setExpandedScript(
                  expandedScript === script.id ? null : script.id
                )
              }
              onDelete={() => deleteScript.mutate(script.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ScriptCard({
  script,
  isExpanded,
  onToggle,
  onDelete,
}: {
  script: ContentScript;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [copiedField, setCopiedField] = useState("");
  const sd = script.script_data;

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
    toast.success("Copied!");
  };

  const platformColors: Record<string, string> = {
    instagram: "bg-pink-500/20 text-pink-400",
    tiktok: "bg-cyan-500/20 text-cyan-400",
    youtube: "bg-red-500/20 text-red-400",
    twitter: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="rounded-lg bg-charcoal border border-border overflow-hidden">
      {/* Header */}
      <button className="w-full p-4 flex items-start gap-3 text-left" onClick={onToggle}>
        <Clapperboard className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <Badge variant="outline" className={cn("text-[10px]", platformColors[script.platform])}>
              {script.platform}
            </Badge>
            {script.content_type && (
              <Badge variant="outline" className="text-[10px]">
                {script.content_type}
              </Badge>
            )}
            {script.category && (
              <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-400 border-orange-500/30">
                {script.category}
              </Badge>
            )}
          </div>
          <p className="font-semibold text-sm">{script.title || "Untitled Script"}</p>
          {sd?.approach && (
            <p className="text-[10px] text-orange-400 mt-0.5">{sd.approach}</p>
          )}
          {sd?.hook?.what_to_say && (
            <p className="text-xs text-muted-foreground italic mt-1 line-clamp-2">
              Hook: "{sd.hook.what_to_say}"
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground">
            {new Date(script.created_at).toLocaleDateString()}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Script View */}
      {isExpanded && sd && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          {/* Hook */}
          {sd.hook && (
            <ScriptSection
              icon={Mic}
              title="THE HOOK"
              iconColor="text-red-400"
              bgColor="bg-red-500/5"
              borderColor="border-red-500/20"
            >
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">What to say:</p>
                  <p className="text-sm font-medium mt-0.5">"{sd.hook.what_to_say}"</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">How to say it:</p>
                  <p className="text-xs mt-0.5">{sd.hook.how_to_say_it}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Camera:</p>
                  <p className="text-xs mt-0.5">{sd.hook.camera_notes}</p>
                </div>
                {sd.hook.duration && (
                  <Badge variant="outline" className="text-[9px]">
                    <Clock className="h-2.5 w-2.5 mr-1" />
                    {sd.hook.duration}
                  </Badge>
                )}
              </div>
            </ScriptSection>
          )}

          {/* Body Sections */}
          {sd.body?.map((section, i) => (
            <ScriptSection
              key={i}
              icon={Camera}
              title={section.section || `Section ${i + 1}`}
              iconColor="text-blue-400"
              bgColor="bg-blue-500/5"
              borderColor="border-blue-500/20"
            >
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Script:</p>
                  <p className="text-sm mt-0.5">{section.what_to_say}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Delivery:</p>
                  <p className="text-xs mt-0.5">{section.how_to_say_it}</p>
                </div>
                {section.b_roll_notes && (
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-medium">B-Roll:</p>
                    <p className="text-xs mt-0.5 italic text-amber-400">
                      {section.b_roll_notes}
                    </p>
                  </div>
                )}
              </div>
            </ScriptSection>
          ))}

          {/* CTA */}
          {sd.cta && (
            <ScriptSection
              icon={Sparkles}
              title="CALL TO ACTION"
              iconColor="text-green-400"
              bgColor="bg-green-500/5"
              borderColor="border-green-500/20"
            >
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Say:</p>
                  <p className="text-sm font-medium mt-0.5">"{sd.cta.what_to_say}"</p>
                </div>
                {sd.cta.on_screen_text && (
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-medium">On-screen text:</p>
                    <p className="text-xs mt-0.5 font-mono bg-background/50 p-2 rounded">
                      {sd.cta.on_screen_text}
                    </p>
                  </div>
                )}
              </div>
            </ScriptSection>
          )}

          {/* Caption */}
          {sd.caption && (
            <div className="rounded-lg bg-background/50 border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Caption
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] gap-1"
                  onClick={() => copyText(sd.caption, "caption")}
                >
                  {copiedField === "caption" ? (
                    <Check className="h-2.5 w-2.5 text-green-400" />
                  ) : (
                    <Copy className="h-2.5 w-2.5" />
                  )}
                  Copy
                </Button>
              </div>
              <p className="text-xs whitespace-pre-wrap">{sd.caption}</p>
            </div>
          )}

          {/* Hashtags */}
          {sd.hashtags?.length > 0 && (
            <div className="rounded-lg bg-background/50 border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Hashtags
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] gap-1"
                  onClick={() => copyText(sd.hashtags.join(" "), "hashtags")}
                >
                  {copiedField === "hashtags" ? (
                    <Check className="h-2.5 w-2.5 text-green-400" />
                  ) : (
                    <Copy className="h-2.5 w-2.5" />
                  )}
                  Copy All
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {sd.hashtags.map((h, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {h.startsWith("#") ? h : `#${h}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Thumbnail */}
          {sd.thumbnail_idea && (
            <div className="rounded-lg bg-background/50 border border-border p-3">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                <Image className="h-3 w-3" /> Thumbnail Idea
              </p>
              <p className="text-xs">{sd.thumbnail_idea}</p>
            </div>
          )}

          {/* Filming Checklist */}
          {sd.filming_checklist?.length > 0 && (
            <div className="rounded-lg bg-background/50 border border-border p-3">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                <ListChecks className="h-3 w-3" /> Filming Checklist
              </p>
              <ul className="space-y-1.5">
                {sd.filming_checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="w-5 h-5 rounded border border-border flex items-center justify-center shrink-0 text-[10px] text-muted-foreground">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {sd.total_duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {sd.total_duration}
              </span>
            )}
            {sd.equipment_needed && (
              <span className="flex items-center gap-1">
                <Wrench className="h-3 w-3" /> {sd.equipment_needed}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs gap-1 text-red-400 hover:text-red-300"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScriptSection({
  icon: Icon,
  title,
  iconColor,
  bgColor,
  borderColor,
  children,
}: {
  icon: any;
  title: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border p-3", bgColor, borderColor)}>
      <h5 className="text-xs font-bold uppercase flex items-center gap-1.5 mb-2">
        <Icon className={cn("h-3.5 w-3.5", iconColor)} />
        {title}
      </h5>
      {children}
    </div>
  );
}
