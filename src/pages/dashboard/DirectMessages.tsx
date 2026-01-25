import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";

// Dom's user ID - this would typically come from an admin config
const DOM_USER_ID = "00000000-0000-0000-0000-000000000000";

const DirectMessages = () => {
  const { user } = useAuth();
  const { isCoaching } = useEffectiveSubscription();
  const { messages, loading, sendMessage } = useDirectMessages();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only coaching users can access
  if (!isCoaching) {
    return <UpgradePrompt feature="Direct Messaging" upgradeTo="coaching" />;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(DOM_USER_ID, newMessage.trim());
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="section-container py-6 flex-shrink-0">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cell Block
        </Link>
      </div>

      <div className="section-container flex-grow flex flex-col pb-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-gradient-to-r from-primary/20 to-amber-500/20 text-primary border-primary/30">
              Free World Exclusive
            </Badge>
          </div>
          <h1 className="headline-section mb-2">
            Direct Line to <span className="text-primary">Your P.O.</span>
          </h1>
          <p className="text-muted-foreground">
            Direct access to Dom. Ask questions, share wins, get guidance on the outside.
          </p>
        </div>

        {/* Messages Container */}
        <div className="flex-grow bg-card rounded-lg border border-border overflow-hidden flex flex-col">
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Send a message to start the conversation
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-charcoal border border-border"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-charcoal">
            <div className="flex gap-3">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[60px] resize-none"
                disabled={sending}
              />
              <Button
                variant="gold"
                size="icon"
                className="h-[60px] w-[60px]"
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectMessages;
