import { useState } from "react";
import {
  Instagram,
  Users,
  Heart,
  MessageCircle,
  TrendingUp,
  RefreshCw,
  Loader2,
  Clock,
  Eye,
  Calendar,
  BarChart3,
  ExternalLink,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useInstagramInsights } from "@/hooks/useInstagramInsights";
import { downloadCSV } from "@/lib/exportUtils";

export default function InstagramInsights() {
  const { insights, isLoading, isExpired, fetchInsights, history } =
    useInstagramInsights("domdifferent_");
  const [comparingHandle, setComparingHandle] = useState("");

  const handleRefresh = () => {
    fetchInsights.mutate(["domdifferent_"]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-pink-400" />
          <div>
            <h3 className="text-lg font-bold">Instagram Insights</h3>
            <p className="text-xs text-muted-foreground">
              Real data for @domdifferent_
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {insights && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1"
              onClick={() => {
                const rows: Record<string, unknown>[] = [
                  {
                    username: insights.username,
                    followers: insights.follower_count,
                    following: insights.following_count,
                    posts: insights.post_count,
                    avg_likes: insights.avg_likes,
                    avg_comments: insights.avg_comments,
                    engagement_rate: `${insights.engagement_rate}%`,
                    posts_per_week: insights.posts_per_week,
                    verified: insights.is_verified ? "Yes" : "No",
                    bio: insights.biography || "",
                  },
                ];
                if (insights.top_posts?.length > 0) {
                  insights.top_posts.forEach((post: any, i: number) => {
                    if (i > 0) rows.push({});
                    rows[0][`top_post_${i + 1}_caption`] = post.caption || "";
                    rows[0][`top_post_${i + 1}_likes`] = post.likes;
                    rows[0][`top_post_${i + 1}_comments`] = post.comments;
                  });
                }
                downloadCSV(rows, `ig-insights-${new Date().toISOString().split("T")[0]}.csv`);
              }}
            >
              <Download className="h-3 w-3" /> Export
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleRefresh}
            disabled={fetchInsights.isPending}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs gap-1"
          >
            {fetchInsights.isPending ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Fetching...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3" /> Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {isExpired && !insights && (
        <div className="rounded-lg border border-dashed border-pink-500/30 p-8 text-center">
          <Instagram className="h-10 w-10 text-pink-400 mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground mb-3">
            No Instagram data yet. Hit refresh to pull real stats from Apify.
          </p>
          <Button
            onClick={handleRefresh}
            disabled={fetchInsights.isPending}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white gap-2"
          >
            {fetchInsights.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Instagram className="h-4 w-4" />
            )}
            Fetch Instagram Data
          </Button>
        </div>
      )}

      {insights && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard
              icon={Users}
              label="Followers"
              value={formatNumber(insights.follower_count)}
              color="text-blue-400"
              bg="bg-blue-500/10"
            />
            <StatCard
              icon={Heart}
              label="Avg Likes"
              value={formatNumber(insights.avg_likes)}
              color="text-red-400"
              bg="bg-red-500/10"
            />
            <StatCard
              icon={MessageCircle}
              label="Avg Comments"
              value={formatNumber(insights.avg_comments)}
              color="text-green-400"
              bg="bg-green-500/10"
            />
            <StatCard
              icon={TrendingUp}
              label="Engagement"
              value={`${insights.engagement_rate}%`}
              color="text-orange-400"
              bg="bg-orange-500/10"
            />
            <StatCard
              icon={Calendar}
              label="Posts/Week"
              value={String(insights.posts_per_week)}
              color="text-purple-400"
              bg="bg-purple-500/10"
            />
          </div>

          {/* Profile Summary */}
          <div className="rounded-lg bg-charcoal border border-border p-4">
            <div className="flex items-start gap-4">
              {insights.profile_pic_url && (
                <img
                  src={insights.profile_pic_url}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-pink-500/30"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">
                    @{insights.username}
                  </span>
                  {insights.is_verified && (
                    <Badge className="bg-blue-500 text-white text-[9px]">
                      Verified
                    </Badge>
                  )}
                </div>
                {insights.full_name && (
                  <p className="text-xs text-muted-foreground">
                    {insights.full_name}
                  </p>
                )}
                {insights.biography && (
                  <p className="text-xs mt-2 whitespace-pre-wrap">
                    {insights.biography}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>
                    <strong className="text-foreground">
                      {formatNumber(insights.post_count)}
                    </strong>{" "}
                    posts
                  </span>
                  <span>
                    <strong className="text-foreground">
                      {formatNumber(insights.follower_count)}
                    </strong>{" "}
                    followers
                  </span>
                  <span>
                    <strong className="text-foreground">
                      {formatNumber(insights.following_count)}
                    </strong>{" "}
                    following
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Chart */}
          {history.length > 1 && (
            <div className="rounded-lg bg-charcoal border border-border p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-400" />
                Growth Over Time
              </h4>
              <div className="flex items-end gap-1 h-32">
                {history.map((point: any, i: number) => {
                  const maxFollowers = Math.max(
                    ...history.map((h: any) => h.followers)
                  );
                  const height =
                    maxFollowers > 0
                      ? (point.followers / maxFollowers) * 100
                      : 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-green-500/30 to-green-500/60 rounded-t-sm min-w-[4px] relative group"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    >
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-charcoal border border-border rounded px-2 py-1 text-[9px] whitespace-nowrap hidden group-hover:block z-10">
                        {formatNumber(point.followers)} followers
                        <br />
                        {new Date(point.date).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Posts */}
          {insights.top_posts?.length > 0 && (
            <div className="rounded-lg bg-charcoal border border-border p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-400" />
                Top Performing Posts
              </h4>
              <div className="space-y-3">
                {insights.top_posts.map((post: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border"
                  >
                    <span className="text-lg font-bold text-muted-foreground w-6 shrink-0">
                      #{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs line-clamp-2">
                        {post.caption || "No caption"}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-red-400" />
                          {formatNumber(post.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3 text-blue-400" />
                          {formatNumber(post.comments)}
                        </span>
                        <Badge variant="outline" className="text-[9px] capitalize">
                          {post.type}
                        </Badge>
                      </div>
                    </div>
                    {post.url && (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expired notice */}
          {isExpired && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-400">
                Data is older than 24 hours. Hit refresh for updated stats.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border p-4", bg)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}
