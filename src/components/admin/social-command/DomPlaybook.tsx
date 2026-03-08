import { useState, useMemo } from "react";
import {
  Flame,
  Trophy,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Sunrise,
  Sun,
  Moon,
  BookOpen,
  Hash,
  FileText,
  Camera,
  MessageSquare,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── HOOK BANK (30 polarizing hooks, rotated daily) ─────────────────────────
const HOOK_BANK = [
  "Your therapist can't help you. The gym can.",
  "Motivation is a lie. Discipline is the only thing that works.",
  "I went to prison. Best thing that ever happened to me.",
  "Men don't need safe spaces. They need accountability.",
  "Your wife can tell you lost your edge. She won't say it.",
  "Church alone won't save you. You need to put in the work.",
  "Most fitness influencers never suffered a day in their life.",
  "You don't need a new program. You need to stop quitting the one you have.",
  "I've been in a cell for 847 days. What's your excuse for not getting up at 5 AM?",
  "Nobody's coming to save you. Get off the couch.",
  "The gym doesn't care about your feelings. That's why it works.",
  "Stop calling it a journey. It's a war. Treat it like one.",
  "Comfort is the enemy. Everything good I've built came from pain.",
  "Every man needs three things: faith, discipline, and a heavy barbell.",
  "I ate slop for 2 years. Now I meal prep like my life depends on it. Because it does.",
  "Social media made men soft. The iron makes them hard.",
  "You're not depressed. You're undisciplined.",
  "If your morning routine starts after 7 AM, you've already lost.",
  "Prison taught me one thing: nobody respects a man who doesn't respect himself.",
  "Your kids are watching. What are they learning from your choices?",
  "Real men pray AND deadlift.",
  "I lost everything. Built it back. You can too. But not from your couch.",
  "Alcohol, weed, Netflix. The holy trinity of wasted potential.",
  "If you haven't been to rock bottom, you don't know what you're made of.",
  "God doesn't need you comfortable. He needs you dangerous.",
  "The best pre-workout is having nothing to fall back on.",
  "Stop trying to find yourself. Build yourself.",
  "I don't do cheat days. I did enough cheating to end up behind bars.",
  "Your body is the only asset you truly own. Invest in it.",
  "Being fit isn't vanity. It's warfare.",
];

// ─── AFTERNOON CONTENT BY DAY OF WEEK ──────────────────────────────────────
const AFTERNOON_CONTENT: Record<number, { label: string; description: string; format: string; filmTip: string }> = {
  0: { label: "Faith Reflection", description: "Scripture + how it applies to discipline, fitness, or redemption", format: "Carousel (scripture slide + personal reflection)", filmTip: "Sit down, calm setting. Read the verse to camera. Then share what it means to you. Keep it under 60 seconds." },
  1: { label: "Client Transformation", description: "Before/after with the story behind it. Real numbers, real timeline.", format: "Carousel (before photo, after photo, story slides)", filmTip: "Get the client's permission. Screenshot their check-in messages. Show the raw data, not just the glow-up." },
  2: { label: "Dom's Workout Clip", description: "Raw, phone-in-gym, not produced. Show the actual work.", format: "Reel (30-60 sec)", filmTip: "Prop phone against a weight. Film 2-3 heavy sets. No editing needed. The rawness IS the content." },
  3: { label: "What I Ate Today", description: "Simple realistic meals. Not Instagram-perfect. What you actually eat.", format: "Carousel (meal photos + macros) or Reel", filmTip: "Snap each meal as you eat it. Show the Tupperware. Show the prep. Nobody wants to see restaurant food." },
  4: { label: "Behind-the-Scenes Coaching", description: "Screen share of programming, client check-in, or coaching call snippet.", format: "Reel or Carousel", filmTip: "Screen record the app, blur client names if needed. Show the actual coaching process." },
  5: { label: "What Prison Taught Me About...", description: "Rotating topics: patience, discipline, food, relationships, trust, time", format: "Reel (talking to camera)", filmTip: "Look straight into the camera. No music. Just you talking. The authenticity is what hooks people." },
  6: { label: "Community Win", description: "Member check-in screenshot, success story, or group milestone", format: "Carousel (screenshots + celebration)", filmTip: "Screenshot the win from the app or DMs. Add your reaction. Celebrate publicly, it builds community." },
};

// ─── EVENING SELL APPROACHES ────────────────────────────────────────────────
const SELL_APPROACHES = [
  { hook: "Screen recording scrolling through the app", cta: "Link in bio. See for yourself." },
  { hook: "\"Here's what my guys do every morning at 5 AM\"", cta: "DM me 'READY' to start." },
  { hook: "\"This is what $79/mo gets you\"", cta: "Link in bio. Stop thinking about it." },
  { hook: "\"New member just signed up. Here's his first week.\"", cta: "Link in bio if you want in." },
  { hook: "User testimonial or DM screenshot", cta: "DM me 'READY' and I'll get you started." },
  { hook: "\"Link in bio. Stop thinking about it.\"", cta: "Link in bio." },
];

// ─── DOM'S RULES ────────────────────────────────────────────────────────────
const DOMS_RULES = [
  "Never tell the full prison story in one post. Drop pieces.",
  "Never use the word \"journey.\" Say \"sentence,\" \"time served,\" \"the grind.\"",
  "Every post ends with engagement bait OR a CTA. Never both.",
  "Film content in batches. One Sunday afternoon = 2 weeks of clips.",
  "Reply to EVERY comment for first 30 minutes after posting.",
  "Post stories daily. Even if it's just a gym selfie with one-liner.",
  "Never post anything you wouldn't say in person.",
  "No generic \"rise and grind\" quotes over stock images.",
  "No shirtless mirror selfies with no context.",
  "No long captions nobody reads.",
  "Never use \"manifestation,\" \"abundance,\" or \"universe.\"",
  "Never repost memes from other fitness pages.",
  "\"Link in bio\" needs context. Why should they click?",
  "Content must be REAL. Phone in hand. Not produced. Not polished.",
  "Be polarizing. If nobody disagrees, you're boring.",
];

// ─── CAPTION TEMPLATES ─────────────────────────────────────────────────────
const CAPTION_TEMPLATES = [
  { name: "The Testimony Drop", template: "I remember when [prison moment]. Now I [current reality]. The difference? [lesson]. [CTA]" },
  { name: "The Hot Take", template: "[Bold statement]. Here's why:\n\n1. [point]\n2. [point]\n3. [point]\n\nAgree or disagree?" },
  { name: "The Proof Post", template: "[Client name] came to me [X] weeks ago. [Before state]. Now? [After state]. This is what happens when you commit. [CTA]" },
  { name: "The Vulnerability", template: "I'm not going to lie. [Honest struggle]. But here's what I know: [resolution]. [Encouragement]" },
  { name: "The Value Drop", template: "3 things I wish I knew before [topic]:\n\n1. [point]\n2. [point]\n3. [point]\n\nSave this." },
];

// ─── HASHTAG SETS ───────────────────────────────────────────────────────────
const HASHTAG_SETS: { name: string; tags: string }[] = [
  { name: "Faith", tags: "#FaithAndFitness #GodBuiltDifferent #PrayAndLift #ChristianFitness #FaithOverFear" },
  { name: "Prison / Redemption", tags: "#SecondChance #RedeemedStrength #FromPrisonToProfit #DomDifferent #FelonFitness" },
  { name: "Fitness", tags: "#NaturalBodybuilding #MensHealth #GymMotivation #FitnessIsAWar #HardWorkPaysOff" },
  { name: "Hot Take", tags: "#UnpopularOpinion #HardTruth #MensAccountability #NoExcuses #DisciplineOverMotivation" },
  { name: "CTA", tags: "#LinkInBio #DomDifferent #TransformYourLife #FitnessCoaching #OnlineCoaching" },
];

// ─── STORY IDEAS ────────────────────────────────────────────────────────────
const STORY_IDEAS = [
  { time: "Morning", idea: "Gym selfie + one-liner about today's mindset" },
  { time: "Post-workout", idea: "\"Just destroyed [muscle group]. What are you doing today?\"" },
  { time: "Afternoon", idea: "Poll question (e.g., \"5 AM or 6 AM wake-up?\")" },
  { time: "Evening", idea: "Day recap or behind-the-scenes moment" },
  { time: "Late night", idea: "Scripture or faith thought" },
];

// ─── HELPER: copy to clipboard ──────────────────────────────────────────────
function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-medium transition-colors min-h-[44px] min-w-[44px] justify-center",
        copied
          ? "bg-green-500/20 text-green-400"
          : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 active:bg-amber-500/30",
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── COLLAPSIBLE SECTION ────────────────────────────────────────────────────
function CollapsibleSection({
  title,
  icon: Icon,
  iconColor,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl bg-zinc-900/80 border border-zinc-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 p-4 min-h-[52px]"
      >
        <Icon className={cn("h-5 w-5 shrink-0", iconColor)} />
        <span className="text-sm font-bold flex-1 text-left">{title}</span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-500" />
        )}
      </button>
      {open && <div className="px-4 pb-4 pt-0">{children}</div>}
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function DomPlaybook() {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const dayOfWeek = now.getDay(); // 0=Sun ... 6=Sat
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Deterministic hook rotation
  const todaysHookIndex = dayOfYear % HOOK_BANK.length;
  const todaysHook = HOOK_BANK[todaysHookIndex];

  // Afternoon content
  const afternoonContent = AFTERNOON_CONTENT[dayOfWeek];

  // Pick 3 sell approaches for tonight (deterministic)
  const sellOptions = useMemo(() => {
    const base = dayOfYear % SELL_APPROACHES.length;
    return [
      SELL_APPROACHES[base % SELL_APPROACHES.length],
      SELL_APPROACHES[(base + 1) % SELL_APPROACHES.length],
      SELL_APPROACHES[(base + 2) % SELL_APPROACHES.length],
    ];
  }, [dayOfYear]);

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-2.5">
        <Trophy className="h-6 w-6 text-amber-400" />
        <div>
          <h3 className="text-lg font-bold text-zinc-100">Dom's Playbook</h3>
          <p className="text-xs text-zinc-500">
            {dayNames[dayOfWeek]} &middot; Your daily guide. Follow it. No excuses.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1: TODAY'S MISSION (always open, most prominent)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-zinc-900/90 p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-amber-400" />
          <h4 className="text-base font-extrabold text-amber-400 tracking-wide uppercase">
            Today's Mission
          </h4>
        </div>

        {/* ── MORNING POST ── */}
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sunrise className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-bold text-orange-400">Morning Post</span>
            <Badge className="bg-zinc-800 text-zinc-400 text-[10px] ml-auto">8-9 AM</Badge>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">
            "The Hook" &mdash; Controversy / opinion that gets comments
          </p>

          <div className="rounded-lg bg-zinc-950 border border-amber-500/30 p-4">
            <p className="text-sm font-bold text-zinc-100 leading-relaxed">
              "{todaysHook}"
            </p>
          </div>
          <div className="flex items-center justify-between">
            <CopyButton text={todaysHook} />
            <span className="text-[10px] text-zinc-500">Hook #{todaysHookIndex + 1} of {HOOK_BANK.length}</span>
          </div>

          <div className="space-y-1.5 mt-1">
            <p className="text-[11px] text-zinc-500">
              <span className="text-amber-400 font-semibold">Format:</span> Text over solid background or Dom's face
            </p>
            <p className="text-[11px] text-zinc-500">
              <span className="text-amber-400 font-semibold">Rule:</span> End with "Agree or disagree?" &mdash; NO link in bio on this one
            </p>
          </div>
        </div>

        {/* ── AFTERNOON POST ── */}
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">Afternoon Post</span>
            <Badge className="bg-zinc-800 text-zinc-400 text-[10px] ml-auto">12-2 PM</Badge>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">
            "The Proof" &mdash; Shows your credibility, lifestyle, real content
          </p>

          <div className="rounded-lg bg-zinc-950 border border-yellow-500/20 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">{dayNames[dayOfWeek]}</Badge>
              <span className="text-sm font-bold text-zinc-100">{afternoonContent.label}</span>
            </div>
            <p className="text-xs text-zinc-300">{afternoonContent.description}</p>
            <p className="text-[11px] text-zinc-500">
              <span className="text-yellow-400 font-semibold">Format:</span> {afternoonContent.format}
            </p>
          </div>

          <div className="rounded bg-yellow-500/5 border border-yellow-500/15 p-3">
            <p className="text-[11px] text-zinc-500">
              <Camera className="h-3 w-3 inline mr-1 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Filming tip:</span> {afternoonContent.filmTip}
            </p>
          </div>
        </div>

        {/* ── EVENING POST ── */}
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-bold text-purple-400">Evening Post</span>
            <Badge className="bg-zinc-800 text-zinc-400 text-[10px] ml-auto">6-8 PM</Badge>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">
            "The Sell" &mdash; Direct CTA to the app
          </p>

          <div className="space-y-2">
            {sellOptions.map((opt, i) => (
              <div
                key={i}
                className="rounded-lg bg-zinc-950 border border-purple-500/20 p-3 flex items-start gap-3"
              >
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200">{opt.hook}</p>
                  <p className="text-[10px] text-purple-400 mt-1">CTA: {opt.cta}</p>
                </div>
                <CopyButton text={`${opt.hook}\n\n${opt.cta}`} />
              </div>
            ))}
          </div>

          <p className="text-[11px] text-zinc-500">
            <span className="text-purple-400 font-semibold">Always end with:</span> "Link in bio" or "DM me 'READY'"
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2: DOM'S RULES
         ══════════════════════════════════════════════════════════════════════ */}
      <CollapsibleSection title="Dom's Rules" icon={Shield} iconColor="text-red-400">
        <div className="space-y-1.5">
          {DOMS_RULES.map((rule, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1.5">
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3: STORY IDEAS
         ══════════════════════════════════════════════════════════════════════ */}
      <CollapsibleSection title="Story Ideas" icon={MessageSquare} iconColor="text-blue-400">
        <div className="space-y-2">
          {STORY_IDEAS.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg bg-zinc-950 border border-zinc-800 p-3"
            >
              <Badge className="bg-blue-500/15 text-blue-400 text-[10px] shrink-0 min-w-[80px] justify-center">
                {s.time}
              </Badge>
              <p className="text-xs text-zinc-300 flex-1">{s.idea}</p>
              <CopyButton text={s.idea} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4: CAPTION TEMPLATES
         ══════════════════════════════════════════════════════════════════════ */}
      <CollapsibleSection title="Caption Templates" icon={FileText} iconColor="text-green-400">
        <div className="space-y-3">
          {CAPTION_TEMPLATES.map((ct, i) => (
            <div
              key={i}
              className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-green-400">{ct.name}</span>
                <CopyButton text={ct.template} />
              </div>
              <p className="text-xs text-zinc-400 whitespace-pre-line font-mono leading-relaxed">
                {ct.template}
              </p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5: HASHTAG SETS
         ══════════════════════════════════════════════════════════════════════ */}
      <CollapsibleSection title="Hashtag Sets" icon={Hash} iconColor="text-cyan-400">
        <div className="space-y-2">
          {HASHTAG_SETS.map((hs, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg bg-zinc-950 border border-zinc-800 p-3"
            >
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  {hs.name}
                </span>
                <p className="text-xs text-zinc-400 mt-1 break-words">{hs.tags}</p>
              </div>
              <CopyButton text={hs.tags} />
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
