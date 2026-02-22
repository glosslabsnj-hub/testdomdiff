import { useState } from "react";
import {
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  Rocket,
  Instagram,
  Twitter,
  Youtube,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSocialCommand, type SocialCommandConfigInput } from "@/hooks/useSocialCommand";
import { toast } from "sonner";

const CONTENT_PILLARS = [
  { id: "faith", label: "Faith & God", emoji: "✝️" },
  { id: "discipline", label: "Discipline & Structure", emoji: "⚡" },
  { id: "training", label: "Workout & Training", emoji: "💪" },
  { id: "hustle", label: "Money & Hustle", emoji: "💰" },
  { id: "controversy", label: "Hot Takes & Controversy", emoji: "🔥" },
  { id: "story", label: "Dom's Story & Personal", emoji: "📖" },
  { id: "transformations", label: "Transformations", emoji: "🏆" },
  { id: "authority", label: "Education & Authority", emoji: "🎓" },
  { id: "culture", label: "Culture & Lifestyle", emoji: "🌍" },
  { id: "platform", label: "Platform & Product", emoji: "📱" },
];

const DEFAULT_CADENCE: Record<string, number> = {
  instagram: 5,
  tiktok: 5,
  youtube: 3,
  twitter: 7,
};

interface Props {
  onComplete: () => void;
}

export default function ContentStrategyOnboarding({ onComplete }: Props) {
  const { upsertConfig } = useSocialCommand();
  const [step, setStep] = useState(0);
  const [handles, setHandles] = useState({
    instagram: "",
    tiktok: "",
    youtube: "",
    twitter: "",
  });
  const [cadence, setCadence] = useState<Record<string, number>>(DEFAULT_CADENCE);
  const [pillars, setPillars] = useState<string[]>(["faith", "discipline", "hustle", "story", "controversy"]);
  const [saving, setSaving] = useState(false);

  const activePlatforms = Object.entries(handles)
    .filter(([, v]) => v.trim().length > 0)
    .map(([k]) => k);

  const togglePillar = (id: string) => {
    setPillars((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const config: SocialCommandConfigInput = {
        onboarding_completed: true,
        instagram_handle: handles.instagram || null,
        tiktok_handle: handles.tiktok || null,
        youtube_handle: handles.youtube || null,
        twitter_handle: handles.twitter || null,
        posting_cadence: cadence,
        content_pillars: pillars,
      };
      await upsertConfig.mutateAsync(config);
      toast.success("Let's get to work!");
      onComplete();
    } catch {
      toast.error("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    // Step 0: Here's The Plan
    <div key="plan" className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
          <Target className="h-8 w-8 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold">Here's The Plan</h2>
        <p className="text-muted-foreground">No sugarcoating. This is how you grow.</p>
      </div>

      <div className="space-y-4 text-sm">
        <div className="p-4 rounded-lg bg-charcoal border border-border">
          <p className="font-semibold text-orange-400 mb-2">The 80/20 Rule (Non-Negotiable)</p>
          <p className="text-muted-foreground">
            80% of your content = value, stories, engagement, education, trends.
            20% MAX = promotion. People follow YOU, not your product.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-charcoal border border-border">
          <p className="font-semibold text-orange-400 mb-2">Post 5x/Week Minimum</p>
          <p className="text-muted-foreground">
            Miss a week? Algorithm punishes you. Consistency isn't optional — it's survival.
            One viral post means nothing without a library backing it up.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-charcoal border border-border">
          <p className="font-semibold text-orange-400 mb-2">Your Content Mix</p>
          <ul className="text-muted-foreground space-y-1 list-disc pl-4">
            <li><strong>Hot Takes</strong> — Spark debate, get shares</li>
            <li><strong>Value Drops</strong> — Teach something, get saves</li>
            <li><strong>Stories</strong> — Build connection, get trust</li>
            <li><strong>Trending Formats</strong> — Ride the algorithm, get reach</li>
            <li><strong>Engagement Bait</strong> — Get comments, boost everything</li>
          </ul>
        </div>
      </div>
    </div>,

    // Step 1: Your Platforms
    <div key="platforms" className="space-y-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">Your Platforms</h2>
        <p className="text-muted-foreground">Enter your handles. Leave blank = not active.</p>
      </div>

      <div className="space-y-4">
        {[
          { key: "instagram", icon: Instagram, label: "Instagram", color: "text-pink-400", placeholder: "@domdifferent" },
          { key: "tiktok", icon: Zap, label: "TikTok", color: "text-cyan-400", placeholder: "@domdifferent" },
          { key: "youtube", icon: Youtube, label: "YouTube", color: "text-red-400", placeholder: "@DomDifferent" },
          { key: "twitter", icon: Twitter, label: "Twitter/X", color: "text-blue-400", placeholder: "@domdifferent" },
        ].map(({ key, icon: Icon, label, color, placeholder }) => (
          <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-charcoal border border-border">
            <Icon className={cn("h-5 w-5 flex-shrink-0", color)} />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Input
                value={handles[key as keyof typeof handles]}
                onChange={(e) => setHandles((h) => ({ ...h, [key]: e.target.value }))}
                placeholder={placeholder}
                className="mt-1 bg-background"
              />
            </div>
            {handles[key as keyof typeof handles].trim() && (
              <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {activePlatforms.length === 0 && (
        <p className="text-xs text-amber-400 text-center">Enter at least one handle to continue.</p>
      )}
    </div>,

    // Step 2: Posting Cadence
    <div key="cadence" className="space-y-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">Posting Cadence</h2>
        <p className="text-muted-foreground">How many posts per week on each platform?</p>
      </div>

      <div className="space-y-3">
        {activePlatforms.map((platform) => (
          <div key={platform} className="flex items-center justify-between p-4 rounded-lg bg-charcoal border border-border">
            <div>
              <p className="font-medium capitalize">{platform}</p>
              <p className="text-xs text-muted-foreground">
                Recommended: {DEFAULT_CADENCE[platform]}/week
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCadence((c) => ({ ...c, [platform]: Math.max(1, (c[platform] || 1) - 1) }))}
              >
                -
              </Button>
              <span className="text-lg font-bold w-8 text-center">{cadence[platform] || 1}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCadence((c) => ({ ...c, [platform]: Math.min(14, (c[platform] || 1) + 1) }))}
              >
                +
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Total: {activePlatforms.reduce((sum, p) => sum + (cadence[p] || 1), 0)} posts/week across {activePlatforms.length} platform{activePlatforms.length !== 1 ? "s" : ""}
      </p>
    </div>,

    // Step 3: Content Pillars
    <div key="pillars" className="space-y-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">Content Pillars</h2>
        <p className="text-muted-foreground">Pick your top 4-5 categories. These drive your content strategy.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {CONTENT_PILLARS.map((pillar) => {
          const selected = pillars.includes(pillar.id);
          return (
            <button
              key={pillar.id}
              onClick={() => togglePillar(pillar.id)}
              className={cn(
                "p-3 rounded-lg border text-left transition-all text-sm",
                selected
                  ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                  : "bg-charcoal border-border text-muted-foreground hover:border-muted-foreground"
              )}
            >
              <span className="mr-1">{pillar.emoji}</span> {pillar.label}
              {selected && <Check className="h-3 w-3 inline ml-1" />}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {pillars.length} selected — {pillars.length < 3 ? "pick at least 3" : pillars.length > 6 ? "maybe trim to 5-6" : "looking good"}
      </p>
    </div>,

    // Step 4: Your First Week
    <div key="first-week" className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <Rocket className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold">You're Ready</h2>
        <p className="text-muted-foreground">
          Here's what happens next:
        </p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-charcoal border border-border">
          <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50 shrink-0">1</Badge>
          <p className="text-muted-foreground">Your <strong className="text-foreground">Content Calendar</strong> will auto-generate your first week of posts</p>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-charcoal border border-border">
          <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50 shrink-0">2</Badge>
          <p className="text-muted-foreground">The <strong className="text-foreground">Generator</strong> creates platform-perfect scripts using AI</p>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-charcoal border border-border">
          <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50 shrink-0">3</Badge>
          <p className="text-muted-foreground"><strong className="text-foreground">Profile Optimizer</strong> audits your accounts and tells you exactly what to fix</p>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-charcoal border border-border">
          <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50 shrink-0">4</Badge>
          <p className="text-muted-foreground"><strong className="text-foreground">Trend Scanner</strong> keeps you on top of what's working right now</p>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground font-medium">
        This is your roadmap. Follow it.
      </p>
    </div>,
  ];

  const canProceed =
    step === 0 ||
    (step === 1 && activePlatforms.length > 0) ||
    step === 2 ||
    (step === 3 && pillars.length >= 3) ||
    step === 4;

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              i <= step ? "bg-orange-500" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step Content */}
      {steps[step]}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? "Saving..." : "Let's Go"} <Rocket className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
