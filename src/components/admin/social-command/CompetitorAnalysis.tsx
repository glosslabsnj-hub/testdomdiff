import { useState } from "react";
import {
  Search,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Target,
  Lightbulb,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCompetitorAnalysis, type CompetitorAnalysis as CompetitorAnalysisType } from "@/hooks/useCompetitorAnalysis";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter/X" },
];

function AnalysisCard({ analysis, onDelete }: { analysis: CompetitorAnalysisType; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const data = analysis.analysis_data as any;

  return (
    <div className="rounded-lg bg-charcoal border border-border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-orange-400" />
          <span className="font-semibold text-sm">@{analysis.competitor_handle}</span>
          <Badge variant="outline" className="text-xs capitalize">
            {analysis.platform}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {new Date(analysis.created_at).toLocaleDateString()}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </Button>
        </div>
      </div>

      {/* Summary */}
      {data?.competitor_summary && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{data.competitor_summary.niche}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-green-400 mb-1">Strengths</p>
              <ul className="space-y-1">
                {data.competitor_summary.strengths?.slice(0, 3).map((s: string, i: number) => (
                  <li key={i} className="text-xs text-muted-foreground">+ {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-red-400 mb-1">Weaknesses</p>
              <ul className="space-y-1">
                {data.competitor_summary.weaknesses?.slice(0, 3).map((w: string, i: number) => (
                  <li key={i} className="text-xs text-muted-foreground">- {w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Expand/Collapse */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs text-muted-foreground hover:text-foreground gap-1"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? "Show less" : "Show full analysis"}
      </Button>

      {expanded && (
        <div className="space-y-4 pt-2 border-t border-border">
          {/* Hook Patterns */}
          {data?.hook_patterns?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Hook Patterns
              </h4>
              <div className="space-y-2">
                {data.hook_patterns.map((h: any, i: number) => (
                  <div key={i} className="rounded bg-background/50 p-2 space-y-1">
                    <p className="text-xs font-medium">{h.pattern}</p>
                    {h.example && <p className="text-xs text-muted-foreground italic">"{h.example}"</p>}
                    {h.dom_adaptation && (
                      <p className="text-xs text-orange-300">Dom's version: {h.dom_adaptation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steal-worthy Ideas */}
          {data?.steal_worthy_ideas?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
                Steal-Worthy Ideas
              </h4>
              <div className="space-y-2">
                {data.steal_worthy_ideas.map((idea: any, i: number) => (
                  <div key={i} className="rounded bg-background/50 p-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium flex-1">{idea.idea}</p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          idea.priority === "high"
                            ? "text-red-400 border-red-400/30"
                            : idea.priority === "medium"
                            ? "text-amber-400 border-amber-400/30"
                            : "text-muted-foreground"
                        }`}
                      >
                        {idea.priority}
                      </Badge>
                    </div>
                    {idea.dom_version && (
                      <p className="text-xs text-orange-300">Dom's take: {idea.dom_version}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Differentiation */}
          {data?.differentiation && (
            <div>
              <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                <Shield className="h-3.5 w-3.5 text-green-400" />
                Differentiation
              </h4>
              {data.differentiation.what_dom_has_they_dont?.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Dom's advantages</p>
                  <ul className="space-y-1">
                    {data.differentiation.what_dom_has_they_dont.map((a: string, i: number) => (
                      <li key={i} className="text-xs text-green-300">+ {a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.differentiation.positioning_advice && (
                <p className="text-xs text-muted-foreground italic mt-2">
                  {data.differentiation.positioning_advice}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CompetitorAnalysis() {
  const { analyses, isLoading, analyzeCompetitor, deleteAnalysis } = useCompetitorAnalysis();
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [pastedContent, setPastedContent] = useState("");
  const [notes, setNotes] = useState("");

  async function handleAnalyze() {
    if (!handle.trim()) {
      return;
    }

    await analyzeCompetitor.mutateAsync({
      competitor_handle: handle.trim().replace(/^@/, ""),
      platform,
      pasted_content: pastedContent ? pastedContent.split("\n---\n").filter(Boolean) : undefined,
      notes: notes || undefined,
    });

    setHandle("");
    setPastedContent("");
    setNotes("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-orange-400" />
        <div>
          <h3 className="text-lg font-bold">Competitor Analysis</h3>
          <p className="text-xs text-muted-foreground">
            Analyze competitor strategies and find opportunities for Dom.
          </p>
        </div>
      </div>

      {/* New Analysis Form */}
      <div className="rounded-lg bg-charcoal border border-border p-4 space-y-4">
        <h4 className="text-sm font-semibold">Analyze a Competitor</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Handle</Label>
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@competitor_handle"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Platform</Label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full h-10 rounded-md bg-background border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Notes (optional)</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What do you know about them? What makes them successful?"
            className="bg-background"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Paste Their Content (optional)</Label>
          <p className="text-[10px] text-muted-foreground">
            Copy-paste their actual posts/captions. Separate with --- on a new line.
          </p>
          <textarea
            value={pastedContent}
            onChange={(e) => setPastedContent(e.target.value)}
            placeholder="Paste competitor content here for deeper analysis..."
            className="w-full min-h-[80px] rounded-lg bg-background border border-border p-3 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-1 focus:ring-orange-500/50"
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!handle.trim() || analyzeCompetitor.isPending}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
        >
          {analyzeCompetitor.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {analyzeCompetitor.isPending ? "Analyzing..." : "Analyze Competitor"}
        </Button>
      </div>

      {/* Analysis History */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">
          Analysis History
          {analyses.length > 0 && (
            <span className="text-muted-foreground font-normal ml-2">({analyses.length})</span>
          )}
        </h4>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No competitor analyses yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Enter a handle above to get started.
            </p>
          </div>
        ) : (
          analyses.map((analysis) => (
            <AnalysisCard
              key={analysis.id}
              analysis={analysis}
              onDelete={() => deleteAnalysis.mutate(analysis.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
