import { useState } from "react";
import {
  Loader2,
  TrendingUp,
  Zap,
  Clock,
  Sparkles,
  Globe,
  BarChart3,
  Music,
  Hash,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTrendScanner } from "@/hooks/useTrendScanner";
import { useViralResearch } from "@/hooks/useViralResearch";
import { downloadCSV } from "@/lib/exportUtils";

interface Props {
  platform: string;
  onGenerateFromTrend?: (trendIdea: string) => void;
}

const reachColor: Record<string, string> = {
  high: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border",
};

const urgencyConfig: Record<string, { label: string; color: string }> = {
  act_now: { label: "Act Now", color: "text-red-400" },
  this_week: { label: "This Week", color: "text-amber-400" },
  ongoing: { label: "Ongoing", color: "text-green-400" },
};

export default function TrendScanner({ platform, onGenerateFromTrend }: Props) {
  const { latestScan, isExpired, runScan, isLoading } = useTrendScanner(platform);
  const { latestResult, runResearch } = useViralResearch();
  const [showResearch, setShowResearch] = useState(false);
  const [copiedId, setCopiedId] = useState("");

  const copyHook = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const handleScan = () => {
    runScan.mutate(platform);
  };

  const handleDeepResearch = () => {
    setShowResearch(true);
    runResearch.mutate({ research_type: "trending", competitor_handle: undefined });
  };

  const timeSince = latestScan
    ? Math.round((Date.now() - new Date(latestScan.scanned_at).getTime()) / (1000 * 60 * 60))
    : null;

  return (
    <div className="space-y-4">
      {/* Scan Controls */}
      <div className="flex items-center justify-between">
        {latestScan && timeSince !== null && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Scanned {timeSince < 1 ? "just now" : `${timeSince}h ago`}
            {isExpired && <Badge variant="destructive" className="text-[9px] ml-1">Expired</Badge>}
          </p>
        )}
        <div className="flex gap-2 ml-auto">
          {(latestScan || latestResult?.data) && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1"
              onClick={() => {
                const rows: Record<string, unknown>[] = [];
                if (latestScan?.trends?.length > 0) {
                  latestScan.trends.forEach((t: any) => {
                    rows.push({
                      type: "AI Trend",
                      title: t.title,
                      description: t.description,
                      content_idea: t.content_idea,
                      reach: t.estimated_reach,
                      urgency: t.urgency,
                    });
                  });
                }
                if (latestScan?.content_angles?.length > 0) {
                  latestScan.content_angles.forEach((a: any) => {
                    rows.push({
                      type: "Content Angle",
                      title: a.angle,
                      description: a.why,
                      content_idea: a.example_hook,
                      reach: "",
                      urgency: "",
                    });
                  });
                }
                if (latestResult?.data?.viral_hooks?.length > 0) {
                  latestResult.data.viral_hooks.forEach((h: any) => {
                    rows.push({
                      type: "Viral Hook",
                      title: h.hook,
                      description: h.why_it_works,
                      content_idea: h.dom_adaptation,
                      reach: "",
                      urgency: "",
                    });
                  });
                }
                if (rows.length === 0) {
                  rows.push({ type: "No data", title: "", description: "", content_idea: "", reach: "", urgency: "" });
                }
                downloadCSV(rows, `trends-${new Date().toISOString().split("T")[0]}.csv`, [
                  { key: "type", label: "Type" },
                  { key: "title", label: "Title/Hook" },
                  { key: "description", label: "Description" },
                  { key: "content_idea", label: "Content Idea" },
                  { key: "reach", label: "Reach" },
                  { key: "urgency", label: "Urgency" },
                ]);
              }}
            >
              <Download className="h-3 w-3" /> Export
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleDeepResearch}
            disabled={runResearch.isPending}
            className="text-xs gap-1"
          >
            {runResearch.isPending ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Researching...</>
            ) : (
              <><Globe className="h-3 w-3" /> Deep Research</>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleScan}
            disabled={runScan.isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs gap-1"
          >
            {runScan.isPending ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Scanning...</>
            ) : (
              <><TrendingUp className="h-3 w-3" /> {latestScan ? "Rescan" : "Scan Trends"}</>
            )}
          </Button>
        </div>
      </div>

      {/* Split View: Real Data (left) | AI Strategy (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Real Data / FireCrawl Results */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3 text-green-400" />
            Real Data
          </h4>

          {latestResult?.data ? (
            <div className="space-y-3">
              {/* Trending Audio */}
              {latestResult.data.trending_audio && latestResult.data.trending_audio.length > 0 && (
                <div className="rounded-lg bg-charcoal border border-border p-3 space-y-2">
                  <h5 className="text-xs font-semibold flex items-center gap-1">
                    <Music className="h-3 w-3 text-purple-400" /> Trending Audio
                  </h5>
                  {latestResult.data.trending_audio.map((audio, i) => (
                    <div key={i} className="text-xs space-y-0.5">
                      <p className="font-medium">{audio.name}</p>
                      <p className="text-muted-foreground">{audio.use_case}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Hashtag Clusters */}
              {latestResult.data.hashtag_clusters && latestResult.data.hashtag_clusters.length > 0 && (
                <div className="rounded-lg bg-charcoal border border-border p-3 space-y-2">
                  <h5 className="text-xs font-semibold flex items-center gap-1">
                    <Hash className="h-3 w-3 text-blue-400" /> Hashtag Clusters
                  </h5>
                  {latestResult.data.hashtag_clusters.map((cluster, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{cluster.primary}</Badge>
                        <Badge variant="outline" className={cn("text-[9px]", reachColor[cluster.estimated_reach])}>
                          {cluster.estimated_reach}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cluster.related.map((tag, j) => (
                          <span key={j} className="text-[10px] text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Viral Hooks */}
              {latestResult.data.viral_hooks && latestResult.data.viral_hooks.length > 0 && (
                <div className="rounded-lg bg-charcoal border border-border p-3 space-y-2">
                  <h5 className="text-xs font-semibold flex items-center gap-1">
                    <Zap className="h-3 w-3 text-amber-400" /> Viral Hooks Found
                  </h5>
                  {latestResult.data.viral_hooks.map((hook, i) => (
                    <div key={i} className="rounded bg-background/50 p-2 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium flex-1">"{hook.hook}"</p>
                        <button
                          onClick={() => copyHook(hook.dom_adaptation || hook.hook, `hook-${i}`)}
                          className="text-muted-foreground hover:text-foreground shrink-0 p-1"
                          title="Copy hook"
                        >
                          {copiedId === `hook-${i}` ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{hook.why_it_works}</p>
                      <p className="text-[10px] text-orange-400">Dom's version: {hook.dom_adaptation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Key Takeaways */}
              {latestResult.data.key_takeaways && latestResult.data.key_takeaways.length > 0 && (
                <div className="rounded-lg bg-charcoal border border-border p-3">
                  <h5 className="text-xs font-semibold mb-2">Key Takeaways</h5>
                  <ul className="space-y-1">
                    {latestResult.data.key_takeaways.map((takeaway, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-green-400 shrink-0">+</span> {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <Globe className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs text-muted-foreground">
                Hit "Deep Research" to scrape real viral data.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: AI Strategy / Trend Scan */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-orange-400" />
            AI Strategy
          </h4>

          {latestScan ? (
            <div className="space-y-3">
              {/* Trends */}
              {latestScan.trends?.length > 0 && (
                <div className="space-y-2">
                  {latestScan.trends.map((trend, i) => {
                    const urgency = urgencyConfig[trend.urgency] || urgencyConfig.ongoing;
                    return (
                      <div key={i} className="rounded-lg bg-charcoal border border-border p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold">{trend.title}</span>
                              <Badge variant="outline" className={cn("text-[9px]", reachColor[trend.estimated_reach])}>
                                {trend.estimated_reach} reach
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{trend.description}</p>
                          </div>
                          <span className={cn("text-[10px] font-medium shrink-0 ml-2", urgency.color)}>
                            {urgency.label}
                          </span>
                        </div>

                        <div className="flex items-start gap-2 p-2 rounded bg-primary/5 border border-primary/10">
                          <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">{trend.content_idea}</p>
                        </div>

                        {onGenerateFromTrend && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[10px] h-6 gap-1"
                            onClick={() => onGenerateFromTrend(trend.content_idea)}
                          >
                            <Zap className="h-2.5 w-2.5" /> Generate From This
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Content Angles */}
              {latestScan.content_angles?.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground">Content Angles</h5>
                  {latestScan.content_angles.map((angle, i) => (
                    <div key={i} className="rounded-lg bg-charcoal border border-border p-3">
                      <p className="text-sm font-medium">{angle.angle}</p>
                      <p className="text-xs text-muted-foreground mt-1">{angle.why}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs italic text-orange-400 flex-1">Hook: "{angle.example_hook}"</p>
                        <button
                          onClick={() => copyHook(angle.example_hook, `angle-${i}`)}
                          className="text-muted-foreground hover:text-foreground shrink-0 p-1"
                        >
                          {copiedId === `angle-${i}` ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <TrendingUp className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs text-muted-foreground">
                Run a trend scan to see AI strategy recommendations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trending Formats from Research */}
      {latestResult?.data?.trending_formats && latestResult.data.trending_formats.length > 0 && (
        <div className="rounded-lg bg-charcoal border border-border p-4">
          <h4 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-green-400" />
            Trending Content Formats
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {latestResult.data.trending_formats.map((format, i) => (
              <div key={i} className="rounded bg-background/50 p-2 border border-border">
                <p className="text-xs font-medium">{format.format}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{format.description}</p>
                <p className="text-[10px] text-orange-400 mt-1">For Dom: {format.fit_for_dom}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
