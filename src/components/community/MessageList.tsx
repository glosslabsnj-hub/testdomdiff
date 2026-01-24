import { useRef, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import type { CommunityMessage } from "@/hooks/useCommunity";

interface MessageListProps {
  messages: CommunityMessage[];
  loading: boolean;
  onDeleteMessage: (messageId: string) => void;
}

// Helper to get display name based on preference
function getDisplayName(message: CommunityMessage): string {
  const preference = message.user_display_name_preference || "full_name";
  const displayName = message.user_display_name;
  const firstName = message.user_first_name;
  const lastName = message.user_last_name;
  const email = message.user_email;

  // Apply preference logic
  if (preference === "nickname" && displayName) {
    return displayName;
  }
  
  if (preference === "first_name" && firstName) {
    return firstName;
  }
  
  // Default to full name
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  if (firstName) {
    return firstName;
  }

  // Fallback chain: email username → User-{id}
  if (email) {
    return email.split("@")[0];
  }
  
  return `User-${message.user_id.slice(0, 6)}`;
}

// Helper to get initials
function getInitials(message: CommunityMessage): string {
  const displayName = getDisplayName(message);
  const parts = displayName.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return displayName.slice(0, 2).toUpperCase();
}

export default function MessageList({ messages, loading, onDeleteMessage }: MessageListProps) {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No messages yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="space-y-4 py-4">
        {messages.map((message) => {
          const isOwn = message.user_id === user?.id;
          const displayName = getDisplayName(message);
          const initials = getInitials(message);

          return (
            <div key={message.id} className="flex gap-3 group">
              <Avatar className="h-8 w-8 flex-shrink-0">
                {message.user_avatar_url ? (
                  <AvatarImage src={message.user_avatar_url} alt={displayName} />
                ) : null}
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
                <p className="text-sm text-foreground/90 mt-0.5 break-words">
                  {message.content}
                </p>
              </div>

              {isOwn && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => onDeleteMessage(message.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
