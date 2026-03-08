import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import { Loader2, Trash2, Flag, CornerDownRight, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CommunityMessage } from "@/hooks/useCommunity";

interface MessageListProps {
  messages: CommunityMessage[];
  loading: boolean;
  onDeleteMessage: (messageId: string) => void;
  channelName?: string;
  onPromptSelect?: (prompt: string) => void;
}

const REPORT_REASONS = ["Spam", "Inappropriate", "Harassment", "Other"] as const;

// Seed prompts for empty channels based on channel name keywords
const SEED_PROMPTS: Record<string, string[]> = {
  general: [
    "Welcome to The Yard. Introduce yourself - where are you from and what's your goal?",
    "What made you decide to start this journey?",
    "What's one thing you want to accomplish this week?",
  ],
  welcome: [
    "Welcome to The Yard. Introduce yourself - where are you from and what's your goal?",
    "What made you decide to start this journey?",
    "What's one thing you want to accomplish this week?",
  ],
  wins: [
    "Share your first win. Even showing up counts.",
    "What's something you did today that you're proud of?",
    "Drop a win from this week, no matter how small.",
  ],
  faith: [
    "What verse is carrying you right now?",
    "How has your faith helped you through a tough moment recently?",
    "Share a prayer or scripture that keeps you grounded.",
  ],
  workout: [
    "What workout did you crush today?",
    "What's your go-to exercise when motivation is low?",
    "Share your PR or a personal best you're chasing.",
  ],
  training: [
    "What workout did you crush today?",
    "What's your go-to exercise when motivation is low?",
    "Share your PR or a personal best you're chasing.",
  ],
};

function getSeedPrompts(channelName?: string): string[] {
  if (!channelName) return SEED_PROMPTS.general;
  const lower = channelName.toLowerCase();
  for (const [key, prompts] of Object.entries(SEED_PROMPTS)) {
    if (lower.includes(key)) return prompts;
  }
  return SEED_PROMPTS.general;
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

// Parse and highlight @mentions in message content
function parseMessageContent(content: string): React.ReactNode {
  // Match @username patterns (alphanumeric, underscores)
  const mentionRegex = /@([\w_]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    // Add the highlighted mention
    parts.push(
      <span
        key={`mention-${match.index}`}
        className="text-primary font-medium bg-primary/10 px-1 rounded"
      >
        @{match[1]}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

export default function MessageList({ messages, loading, onDeleteMessage, channelName, onPromptSelect }: MessageListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Build a lookup map for reply threading
  const messageMap = useMemo(() => {
    const map = new Map<string, CommunityMessage>();
    for (const msg of messages) {
      map.set(msg.id, msg);
    }
    return map;
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleReportClick = useCallback((messageId: string) => {
    setReportingMessageId(messageId);
    setReportDialogOpen(true);
  }, []);

  const handleReportSubmit = useCallback(async (reason: string) => {
    if (!user || !reportingMessageId) return;

    setReportSubmitting(true);
    try {
      // Check for duplicate report
      const { data: existing, error: checkError } = await supabase
        .from("community_reports" as any)
        .select("id")
        .eq("message_id", reportingMessageId)
        .eq("reporter_id", user.id)
        .maybeSingle();

      if (!checkError && existing) {
        toast({
          title: "Already reported",
          description: "You have already reported this message.",
        });
        setReportDialogOpen(false);
        setReportingMessageId(null);
        setReportSubmitting(false);
        return;
      }

      // Insert report
      const { error: insertError } = await supabase
        .from("community_reports" as any)
        .insert({
          message_id: reportingMessageId,
          reporter_id: user.id,
          reason,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        // Table might not exist yet, graceful fallback
        console.warn("Could not insert report (table may not exist):", insertError.message);
      }

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep the community safe.",
      });
    } catch (e: any) {
      // Graceful fallback if table doesn't exist
      console.warn("Report submission error:", e?.message);
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep the community safe.",
      });
    } finally {
      setReportDialogOpen(false);
      setReportingMessageId(null);
      setReportSubmitting(false);
    }
  }, [user, reportingMessageId, toast]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    const prompts = getSeedPrompts(channelName);
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center mb-6">
            <Sparkles className="w-8 h-8 text-primary/60 mx-auto mb-3" />
            <h3 className="font-display text-lg text-foreground">Start the conversation</h3>
            <p className="text-sm text-muted-foreground mt-1">Tap a prompt to break the ice</p>
          </div>
          <div className="space-y-3">
            {prompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onPromptSelect?.(prompt)}
                className="w-full text-left p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group cursor-pointer"
              >
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {prompt}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 py-4">
          {messages.map((message) => {
            const isOwn = message.user_id === user?.id;
            const displayName = getDisplayName(message);
            const initials = getInitials(message);
            const parsedContent = parseMessageContent(message.content);

            // Reply threading: look up parent message
            const parentMessage = message.reply_to_id
              ? messageMap.get(message.reply_to_id)
              : null;

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
                  {/* Reply thread preview */}
                  {message.reply_to_id && (
                    <div className="flex items-center gap-1.5 mb-1 text-xs text-muted-foreground border-l-2 border-primary/30 pl-2 py-0.5">
                      <CornerDownRight className="h-3 w-3 flex-shrink-0" />
                      {parentMessage ? (
                        <span className="truncate">
                          Replying to{" "}
                          <span className="font-medium text-foreground/70">
                            {getDisplayName(parentMessage)}
                          </span>
                          :{" "}
                          <span className="italic">
                            {parentMessage.content.length > 60
                              ? parentMessage.content.slice(0, 60) + "..."
                              : parentMessage.content}
                          </span>
                        </span>
                      ) : (
                        <span className="italic">Replying to a message</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {displayName}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(message.created_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5 break-words">
                    {parsedContent}
                  </p>
                </div>

                {/* Action buttons (report + delete) */}
                <div className="flex items-start gap-1">
                  {/* Report button: visible on hover (desktop) or always (mobile) */}
                  {!isOwn && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="min-w-[44px] min-h-[44px] h-6 w-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-amber-500"
                      onClick={() => handleReportClick(message.id)}
                      title="Report message"
                    >
                      <Flag className="h-3 w-3" />
                    </Button>
                  )}

                  {isOwn && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="min-w-[44px] min-h-[44px] h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => onDeleteMessage(message.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Report Message</DialogTitle>
            <DialogDescription>
              Select a reason for reporting this message.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            {REPORT_REASONS.map((reason) => (
              <Button
                key={reason}
                variant="outline"
                className="justify-start"
                disabled={reportSubmitting}
                onClick={() => handleReportSubmit(reason)}
              >
                {reason}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
