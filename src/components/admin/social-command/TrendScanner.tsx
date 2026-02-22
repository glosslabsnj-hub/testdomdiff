import { Loader2, TrendingUp, Zap, Clock, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTrendScanner } from "@/hooks/useTrendScanner";

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

  const handleScan = () => {
    runScan.mutate(platform);
  };

  const timeSince = latestScan
    ? Math.round((Date.now() - new Date(latestScan.scanned_at).getTime()) / (1000 * 60 * 60))
    : null;

  return (
    <div className="space-y-4">
      {/* Scan Button */}
      <div className="flex items-center justify-between">
        {latestScan && timeSince !== null && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Scanned {timeSince < 1 ? "just now" : `${timeSince}h ago`}
            {isExpired && <Badge variant="destructive" className="text-[9px] ml-1">Expired</Badge>}
          </p>
        )}
        <Button
          size="sm"
          onClick={handleScan}
          disabled={runScan.isPending}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xs gap-1 ml-auto"
        >
          {runScan.isPending ? (
            <><Loader2 className="h-3 w-3 animate-spin" /> Scanning...</>
          ) : (
            <><TrendingUp className="h-3 w-3" /> {latestScan ? "Rescan" : "Scan Trends"}</>
          )}
        </Button>
      </div>

      {/* Results */}
      {latestScan && (
        <div className="space-y-4">
          {/* Trends */}
          {latestScan.trends?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground">Trending Now</h4>
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
              <h4 className="text-xs font-semibold text-muted-foreground">Content Angles</h4>
              {latestScan.content_angles.map((angle, i) => (
                <div key={i} className="rounded-lg bg-charcoal border border-border p-3">
                  <p className="text-sm font-medium">{angle.angle}</p>
                  <p className="text-xs text-muted-foreground mt-1">{angle.why}</p>
                  <p className="text-xs italic text-orange-400 mt-2">Hook: "{angle.example_hook}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!latestScan && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No trend data yet. Run a scan to see what's working.</p>
        </div>
      )}
    </div>
  );
}
