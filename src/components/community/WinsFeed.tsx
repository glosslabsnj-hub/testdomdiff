import { useState, useRef } from "react";
import { format } from "date-fns";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Play, 
  Pause,
  Plus, 
  Trash2, 
  Loader2,
  Upload,
  X,
  Trophy
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunityWins, useWinComments, type CommunityWin } from "@/hooks/useCommunityWins";
import { cn } from "@/lib/utils";

interface WinsFeedProps {
  channelId?: string;
}

export default function WinsFeed({ channelId }: WinsFeedProps) {
  const { user } = useAuth();
  const { wins, loading, createWin, likeWin, deleteWin } = useCommunityWins(channelId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedWin, setSelectedWin] = useState<CommunityWin | null>(null);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Create Win Button */}
      <div className="p-4 border-b border-border">
        <Button 
          variant="gold" 
          className="w-full gap-2"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="w-4 h-4" />
          Share Your Win
        </Button>
      </div>

      {/* Wins Feed */}
      {wins.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Trophy className="w-16 h-16 mx-auto text-primary/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Wins Yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Be the first to share your victory with the brotherhood!
            </p>
            <Button variant="goldOutline" onClick={() => setShowCreateDialog(true)}>
              Post Your First Win
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {wins.map((win) => (
              <WinCard
                key={win.id}
                win={win}
                onLike={() => likeWin(win.id)}
                onComment={() => setSelectedWin(win)}
                onDelete={() => deleteWin(win.id)}
                isOwner={win.user_id === user?.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Win Dialog */}
      <CreateWinDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={createWin}
      />

      {/* Win Detail Dialog (for comments) */}
      <WinDetailDialog
        win={selectedWin}
        onClose={() => setSelectedWin(null)}
        onLike={() => selectedWin && likeWin(selectedWin.id)}
      />
    </div>
  );
}

interface WinCardProps {
  win: CommunityWin;
  onLike: () => void;
  onComment: () => void;
  onDelete: () => void;
  isOwner: boolean;
}

function WinCard({ win, onLike, onComment, onDelete, isOwner }: WinCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const displayName = win.user_first_name
    ? `${win.user_first_name} ${win.user_last_name || ""}`.trim()
    : "Brother";

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-charcoal rounded-lg border border-border overflow-hidden group">
      {/* Media */}
      <div className="relative aspect-square bg-background">
        {win.media_type === "video" ? (
          <>
            <video
              ref={videoRef}
              src={win.media_url}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              onClick={toggleVideo}
            />
            <button
              onClick={toggleVideo}
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="w-12 h-12 text-white" />
              ) : (
                <Play className="w-12 h-12 text-white" />
              )}
            </button>
          </>
        ) : (
          <img
            src={win.media_url}
            alt={win.caption}
            className="w-full h-full object-cover"
          />
        )}

        {/* Delete button */}
        {isOwner && (
          <button
            onClick={onDelete}
            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Featured badge */}
        {win.is_featured && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            <Trophy className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* User info */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-7 h-7">
            <AvatarImage src={win.user_avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(win.created_at), "MMM d")}
            </p>
          </div>
        </div>

        {/* Caption */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {win.caption}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={onLike}
            className={cn(
              "flex items-center gap-1 text-sm transition-colors",
              win.has_liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            )}
          >
            <Heart className={cn("w-5 h-5", win.has_liked && "fill-current")} />
            <span>{win.likes_count || 0}</span>
          </button>
          <button
            onClick={onComment}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{win.comments_count || 0}</span>
          </button>
          <button
            onClick={() => {
              navigator.share?.({ 
                title: "Check out this win!", 
                url: window.location.href 
              });
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface CreateWinDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File, caption: string) => Promise<void>;
}

function CreateWinDialog({ open, onClose, onSubmit }: CreateWinDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async () => {
    if (!file || !caption.trim()) return;
    
    setSubmitting(true);
    try {
      await onSubmit(file, caption);
      setFile(null);
      setPreview(null);
      setCaption("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Share Your Win
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          {preview ? (
            <div className="relative aspect-square rounded-lg overflow-hidden bg-background">
              {file?.type.startsWith("video/") ? (
                <video
                  src={preview}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={clearFile}
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-destructive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-background">
              <Upload className="w-10 h-10 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Upload photo or video
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Show your progress, transformation, or achievement
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {/* Caption */}
          <div>
            <Textarea
              placeholder="Share your victory... What did you accomplish?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gold"
            onClick={handleSubmit}
            disabled={!file || !caption.trim() || submitting}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Post Win"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface WinDetailDialogProps {
  win: CommunityWin | null;
  onClose: () => void;
  onLike: () => void;
}

function WinDetailDialog({ win, onClose, onLike }: WinDetailDialogProps) {
  const { comments, loading, addComment } = useWinComments(win?.id || null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    await addComment(newComment);
    setNewComment("");
    setSubmitting(false);
  };

  if (!win) return null;

  const displayName = win.user_first_name
    ? `${win.user_first_name} ${win.user_last_name || ""}`.trim()
    : "Brother";

  return (
    <Dialog open={!!win} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Media */}
        <div className="aspect-square rounded-lg overflow-hidden bg-background -mx-6 -mt-6">
          {win.media_type === "video" ? (
            <video
              src={win.media_url}
              className="w-full h-full object-cover"
              controls
              autoPlay
              muted
            />
          ) : (
            <img
              src={win.media_url}
              alt={win.caption}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex items-center gap-3 py-3 border-b border-border">
          <Avatar className="w-10 h-10">
            <AvatarImage src={win.user_avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{displayName}</p>
            <p className="text-sm text-muted-foreground">{win.caption}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 py-2">
          <button
            onClick={onLike}
            className={cn(
              "flex items-center gap-1 text-sm transition-colors",
              win.has_liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            )}
          >
            <Heart className={cn("w-6 h-6", win.has_liked && "fill-current")} />
            <span>{win.likes_count || 0}</span>
          </button>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageCircle className="w-6 h-6" />
            <span>{comments.length}</span>
          </div>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px] max-h-[200px]">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarImage src={comment.user_avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {(comment.user_first_name || "B").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">
                      {comment.user_first_name || "Brother"}
                    </span>{" "}
                    {comment.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className="flex gap-2 pt-3 border-t border-border">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            className="flex-1"
          />
          <Button
            variant="gold"
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
