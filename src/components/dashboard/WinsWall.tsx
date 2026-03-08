import { useState } from "react";
import { Trophy, Heart, MessageCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCommunityWins } from "@/hooks/useCommunityWins";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export function WinsWall() {
  const { wins, loading, likeWin } = useCommunityWins();

  // Show only latest 3 wins
  const recentWins = wins.slice(0, 3);

  if (loading || recentWins.length === 0) return null;

  return (
    <Card className="mb-6 border-yellow-500/20 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Community Wins
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-xs text-primary">
            <Link to="/dashboard/community">
              See All <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentWins.map((win) => (
          <div
            key={win.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/20"
          >
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={win.user_avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {(win.user_first_name || "?")[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium truncate">
                  {win.user_first_name || "Anonymous"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(win.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{win.caption}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <button
                  onClick={() => likeWin(win.id)}
                  className={cn(
                    "flex items-center gap-1 text-xs transition-colors",
                    win.has_liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"
                  )}
                >
                  <Heart className={cn("w-3 h-3", win.has_liked && "fill-current")} />
                  {win.likes_count || 0}
                </button>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="w-3 h-3" />
                  {win.comments_count || 0}
                </span>
              </div>
            </div>
            {win.media_url && (
              <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                {win.media_type === "video" ? (
                  <video
                    src={win.media_url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={win.media_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
          </div>
        ))}

        <Button variant="outline" size="sm" asChild className="w-full">
          <Link to="/dashboard/community">
            <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
            Post Your Win
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
