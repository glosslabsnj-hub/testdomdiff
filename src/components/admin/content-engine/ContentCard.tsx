import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Check, 
  Trash2,
  Instagram,
  Youtube,
  Twitter,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ContentPost, ContentStatus } from "@/hooks/useContentEngine";

interface ContentCardProps {
  post: ContentPost;
  onUpdateStatus: (id: string, status: ContentStatus) => void;
  onDelete: (id: string) => void;
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-4 w-4" />,
  tiktok: <Video className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
};

const categoryLabels: Record<string, string> = {
  faith: "Faith & Redemption",
  discipline: "Discipline & Structure",
  training: "Workout & Training",
  transformations: "Transformations",
  authority: "Education & Authority",
  platform: "Platform-Led",
};

const statusColors: Record<ContentStatus, string> = {
  fresh: "bg-green-500/20 text-green-400 border-green-500/30",
  used: "bg-muted text-muted-foreground border-border",
  favorite: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function ContentCard({ post, onUpdateStatus, onDelete }: ContentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggleFavorite = () => {
    onUpdateStatus(post.id, post.status === "favorite" ? "fresh" : "favorite");
  };

  const handleMarkUsed = () => {
    onUpdateStatus(post.id, post.status === "used" ? "fresh" : "used");
  };

  return (
    <Card className="bg-charcoal border-border hover:border-orange-500/30 transition-colors">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={cn("text-xs", statusColors[post.status])}>
                {post.status === "favorite" && <Star className="h-3 w-3 mr-1 fill-current" />}
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {categoryLabels[post.category] || post.category}
              </Badge>
              <Badge variant="outline" className="text-xs text-orange-400 border-orange-500/30">
                {post.mode === "done_for_you" ? "Done-For-You" : "Freestyle"}
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Platforms & Format */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            {post.platforms.map((platform) => (
              <span key={platform} className="text-muted-foreground" title={platform}>
                {platformIcons[platform.toLowerCase()] || platform}
              </span>
            ))}
          </div>
          {post.format && (
            <span className="text-xs text-muted-foreground">• {post.format}</span>
          )}
        </div>

        {/* Hook Preview */}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 italic">
          "{post.hook}"
        </p>
      </CardHeader>

      {expanded && (
        <CardContent className="p-4 pt-2 space-y-4 border-t border-border mt-2">
          {/* Talking Points */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">What to Say</h4>
            <ul className="space-y-1">
              {post.talking_points.map((point, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Filming Tips */}
          {post.filming_tips && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">How to Film It</h4>
              <p className="text-sm text-muted-foreground">{post.filming_tips}</p>
            </div>
          )}

          {/* CTA */}
          {post.cta && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Call to Action</h4>
              <p className="text-sm text-muted-foreground italic">"{post.cta}"</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFavorite}
              className={cn(
                "gap-1",
                post.status === "favorite" && "text-amber-400 border-amber-500/30"
              )}
            >
              <Star className={cn("h-4 w-4", post.status === "favorite" && "fill-current")} />
              {post.status === "favorite" ? "Unfavorite" : "Favorite"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkUsed}
              className={cn(
                "gap-1",
                post.status === "used" && "text-muted-foreground"
              )}
            >
              <Check className="h-4 w-4" />
              {post.status === "used" ? "Mark Fresh" : "Mark Used"}
            </Button>
            <div className="flex-1" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Content?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove "{post.title}" from your library.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(post.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
