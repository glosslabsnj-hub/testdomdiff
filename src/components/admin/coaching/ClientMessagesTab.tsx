import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDirectMessages, type DirectMessage } from "@/hooks/useDirectMessages";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ClientMessagesTabProps {
  clientId: string;
}

export default function ClientMessagesTab({ clientId }: ClientMessagesTabProps) {
  const { user } = useAuth();
  const { messages, loading, sendMessage, markAsRead, fetchMessages } =
    useDirectMessages(clientId);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter messages for this conversation
  const conversationMessages = messages.filter(
    (m) =>
      (m.sender_id === clientId && m.recipient_id === user?.id) ||
      (m.sender_id === user?.id && m.recipient_id === clientId)
  );

  // Mark unread messages as read
  useEffect(() => {
    conversationMessages
      .filter((m) => m.recipient_id === user?.id && !m.read_at)
      .forEach((m) => markAsRead(m.id));
  }, [conversationMessages, user?.id, markAsRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationMessages.length]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(clientId, newMessage.trim());
    if (success) {
      setNewMessage("");
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px]">
      {/* Messages List */}
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        {conversationMessages.length > 0 ? (
          <div className="space-y-3 py-2">
            {conversationMessages
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((message) => {
                const isFromMe = message.sender_id === user?.id;

                return (
                  <div
                    key={message.id}
                    className={cn("flex", isFromMe ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2",
                        isFromMe
                          ? "bg-primary text-primary-foreground"
                          : "bg-charcoal border border-border"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          isFromMe ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}
                      >
                        {format(new Date(message.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No messages yet. Start the conversation.
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border pt-4 mt-4">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[60px] resize-none"
            rows={2}
          />
          <Button
            variant="gold"
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="h-[60px] w-[60px]"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
