import { useRef, useEffect } from "react";
import { format } from "date-fns";
import { Trash2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { CommunityMessage } from "@/hooks/useCommunity";

interface MessageListProps {
  messages: CommunityMessage[];
  loading: boolean;
  onDeleteMessage: (messageId: string) => void;
}

export default function MessageList({
  messages,
  loading,
  onDeleteMessage,
}: MessageListProps) {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwn = message.user_id === user?.id;
        const displayName = message.user_first_name 
          ? `${message.user_first_name} ${message.user_last_name || ""}`.trim()
          : message.user_email?.split("@")[0] 
            ? message.user_email.split("@")[0]
            : `User-${message.user_id.slice(0, 6)}`;
        const initials = displayName.slice(0, 2).toUpperCase();

        return (
          <div
            key={message.id}
            className="group flex items-start gap-3 hover:bg-muted/30 -mx-2 px-2 py-1 rounded transition-colors"
          >
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarImage src={message.user_avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm text-foreground">
                  {displayName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.created_at), "MMM d, h:mm a")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>

            {isOwn && (
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDeleteMessage(message.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
