import { useState, useEffect } from "react";
import {
  Shield,
  Loader2,
  Check,
  AlertTriangle,
  Star,
  Zap,
  RefreshCw,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useProfileAudits, type AuditInput } from "@/hooks/useProfileAudits";
import { useInstagramInsights } from "@/hooks/useInstagramInsights";

interface Props {
  platform: string;
  handle?: string;
}

export default function ProfileOptimizer({ platform, handle }: Props) {
  const { latestAudit, runAudit, toggleCompleted } = useProfileAudits(platform);
  const { insights, fetchInsights } = useInstagramInsights(handle || "domdifferent_");

  const [bio, setBio] = useState("");
  const [hasHighlights, setHasHighlights] = useState(false);
  const [hasPinnedPost, setHasPinnedPost] = useState(false);
  const [hasLinkInBio, setHasLinkInBio] = useState(false);
  const [showForm, setShowForm] = useState(!latestAudit);
  const [autoFetched, setAutoFetched] = useState(false);

  // Auto-populate from real IG data
  useEffect(() => {
    if (insights && !autoFetched && platform === "instagram") {
      setBio(insights.biography || "");
      setHasLinkInBio(!!insights.external_url);
      setAutoFetched(true);
    }
  }, [insights, autoFetched, platform]);

  const handleAutoFetch = () => {
    fetchInsights.mutate([handle || "domdifferent_"]);
  };

  const handleRunAudit = () => {
    const input: AuditInput = {
      platform,
      current_bio: bio || undefined,
      has_highlights: hasHighlights,
      has_pinned_post: hasPinnedPost,
      has_link_in_bio: hasLinkInBio,
      handle: handle || undefined,
    };
    runAudit.mutate(input);
  };

  const priorityColor: Record<string, string> = {
    high: "text-red-400",
    medium: "text-amber-400",
    low: "text-green-400",
  };

  const completedCount = latestAudit?.completed_items?.length || 0;
  const totalItems = latestAudit?.recommendations?.length || 0;
  const completionPct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Auto-fetch from Apify */}
      {platform === "instagram" && !insights && (
        <div className="rounded-lg bg-pink-500/5 border border-pink-500/20 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Instagram className="h-4 w-4 text-pink-400" />
            <p className="text-xs text-muted-foreground">
              Fetch real profile data from Instagram
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1"
            onClick={handleAutoFetch}
            disabled={fetchInsights.isPending}
          >
            {fetchInsights.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Fetch
          </Button>
        </div>
      )}

      {/* Audit Form */}
      {showForm || !latestAudit ? (
        <div className="rounded-lg bg-charcoal border border-border p-4 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-400" />
            Profile Audit — {platform}
            {insights && (
              <Badge variant="outline" className="text-[9px] text-green-400 border-green-500/30">
                Real data loaded
              </Badge>
            )}
          </h3>

          <div>
            <Label className="text-xs">Current Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Paste your current bio here..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="space-y-3">
            {platform === "instagram" && (
              <div className="flex items-center justify-between">
                <Label className="text-xs">Has Highlights?</Label>
                <Switch checked={hasHighlights} onCheckedChange={setHasHighlights} />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label className="text-xs">Has Pinned Post?</Label>
              <Switch checked={hasPinnedPost} onCheckedChange={setHasPinnedPost} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Has Link in Bio?</Label>
              <Switch checked={hasLinkInBio} onCheckedChange={setHasLinkInBio} />
            </div>
          </div>

          <Button
            onClick={handleRunAudit}
            disabled={runAudit.isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            {runAudit.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Auditing with Claude...</>
            ) : (
              <><Zap className="h-4 w-4" /> Run AI Audit</>
            )}
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="text-xs">
          Run New Audit
        </Button>
      )}

      {/* Audit Results */}
      {latestAudit && (
        <div className="space-y-4">
          {/* Score */}
          <div className="rounded-lg bg-charcoal border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold">Profile Score</span>
              </div>
              <span className="text-2xl font-bold text-orange-400">{completionPct}%</span>
            </div>
            <Progress value={completionPct} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedCount}/{totalItems} improvements completed
            </p>
          </div>

          {/* Diff View: Current vs Optimized Bio */}
          {latestAudit.audit_data?.optimized_bio && (
            <div className="rounded-lg bg-charcoal border border-border p-4 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground">Bio Comparison</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase text-red-400 font-medium mb-1">Current</p>
                  <p className="text-xs font-mono whitespace-pre-wrap bg-red-500/5 rounded p-2 border border-red-500/10 min-h-[60px]">
                    {bio || insights?.biography || "(no bio set)"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-green-400 font-medium mb-1">Optimized</p>
                  <p className="text-xs font-mono whitespace-pre-wrap bg-green-500/5 rounded p-2 border border-green-500/10 min-h-[60px]">
                    {latestAudit.audit_data.optimized_bio}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Wins */}
          {latestAudit.audit_data?.quick_wins?.length > 0 && (
            <div className="rounded-lg bg-charcoal border border-border p-4">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" /> Quick Wins (Under 5 min)
              </h4>
              <ul className="space-y-2">
                {latestAudit.audit_data.quick_wins.map((win: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-3 w-3 text-amber-400 mt-1 shrink-0" />
                    {win}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations Checklist */}
          {latestAudit.recommendations?.length > 0 && (
            <div className="rounded-lg bg-charcoal border border-border p-4 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Optimization Checklist</h4>
              {latestAudit.recommendations.map((rec) => {
                const isCompleted = latestAudit.completed_items?.includes(rec.id);
                return (
                  <button
                    key={rec.id}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all text-sm",
                      isCompleted
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-background/50 border border-border hover:border-muted-foreground"
                    )}
                    onClick={() =>
                      toggleCompleted.mutate({ auditId: latestAudit.id, itemId: rec.id })
                    }
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5",
                      isCompleted
                        ? "bg-green-500 border-green-500"
                        : "border-muted-foreground"
                    )}>
                      {isCompleted && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium", isCompleted && "line-through text-muted-foreground")}>
                          {rec.title}
                        </span>
                        <Badge variant="outline" className={cn("text-[9px]", priorityColor[rec.priority])}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
