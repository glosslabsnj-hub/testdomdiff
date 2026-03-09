import { useState } from "react";
import { format } from "date-fns";
import { X, Mail, Phone, Calendar, Target, Dumbbell, Heart, AlertTriangle, ChevronDown, ChevronUp, Activity, Flame, Camera, ClipboardCheck, Send, Loader2, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import SubscriptionManager from "./SubscriptionManager";
import { useClientProgress } from "@/hooks/useClientProgress";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useAuth } from "@/contexts/AuthContext";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";

interface ClientDetailPanelProps {
  client: ClientWithSubscription | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const ClientDetailPanel = ({ client, open, onClose, onUpdate }: ClientDetailPanelProps) => {
  const { user } = useAuth();
  const [intakeExpanded, setIntakeExpanded] = useState(false);
  const [progressExpanded, setProgressExpanded] = useState(true);
  const [messagesExpanded, setMessagesExpanded] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { data: progressData, loading: progressLoading } = useClientProgress(client?.user_id ?? null);
  const { messages, sendMessage, markAsRead } = useDirectMessages(client?.user_id ?? null);

  if (!client) return null;

  // Filter messages for this conversation
  const conversationMessages = messages
    .filter(
      (m) =>
        (m.sender_id === client.user_id && m.recipient_id === user?.id) ||
        (m.sender_id === user?.id && m.recipient_id === client.user_id)
    )
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !client.user_id) return;
    setSending(true);
    const success = await sendMessage(client.user_id, newMessage.trim());
    if (success) setNewMessage("");
    setSending(false);
  };

  const getInitials = () => {
    const first = client.first_name?.[0] || "";
    const last = client.last_name?.[0] || "";
    return (first + last).toUpperCase() || "?";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case "cancelled":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Cancelled</Badge>;
      case "expired":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (planType: string) => {
    switch (planType) {
      case "transformation":
        return <Badge className="bg-primary/20 text-primary border-primary/30">Transformation</Badge>;
      case "membership":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Membership</Badge>;
      case "coaching":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Coaching</Badge>;
      default:
        return <Badge variant="secondary">{planType}</Badge>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4 sm:p-6">
        {/* Sticky header for mobile navigation */}
        <div className="sticky top-0 z-10 bg-background pb-2 mb-2 border-b border-border sm:hidden flex items-center justify-between">
          <span className="font-semibold text-sm truncate">
            {client.first_name || "Unknown"} {client.last_name || ""}
          </span>
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
              <AvatarImage src={client.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-lg sm:text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-lg sm:text-xl">
                {client.first_name || "Unknown"} {client.last_name || ""}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-3 w-3" />
                {client.email}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Contact Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Member since {format(new Date(client.created_at), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subscription Status */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Subscription Status
            </h3>
            {client.activeSubscription ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {getPlanBadge(client.activeSubscription.plan_type)}
                  {getStatusBadge(client.activeSubscription.status)}
                </div>
                <div className="text-sm sm:text-base space-y-2">
                  <p>
                    <span className="text-muted-foreground">Started:</span>{" "}
                    {format(new Date(client.activeSubscription.started_at), "MMM d, yyyy")}
                  </p>
                  {client.activeSubscription.expires_at && (
                    <p>
                      <span className="text-muted-foreground">Expires:</span>{" "}
                      {format(new Date(client.activeSubscription.expires_at), "MMM d, yyyy")}
                      {client.daysRemaining !== null && (
                        <span className="text-primary ml-2">({client.daysRemaining} days left)</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active subscription</p>
            )}

            <Separator className="my-4" />

            {/* Subscription Management */}
            <SubscriptionManager 
              client={client} 
              onUpdate={() => {
                onUpdate?.();
              }}
            />
          </div>

          <Separator />

          {/* Intake Status */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Intake Status
            </h3>
            {client.intake_completed_at ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Completed {format(new Date(client.intake_completed_at), "MMM d, yyyy")}
              </Badge>
            ) : (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Not Completed
              </Badge>
            )}
          </div>

          {client.intake_completed_at && (
            <>
              <Separator />

              {/* Intake Responses (collapsible) */}
              <div>
                <button
                  type="button"
                  className="flex items-center justify-between w-full min-h-[44px] text-left"
                  onClick={() => setIntakeExpanded(!intakeExpanded)}
                >
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Intake Responses
                  </h3>
                  {intakeExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {intakeExpanded && (
                <div className="space-y-4 mt-3">
                  {/* Physical Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Age</p>
                      <p className="font-semibold">{client.age || "—"}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Height</p>
                      <p className="font-semibold">{client.height || "—"}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="font-semibold">{client.weight ? `${client.weight} lbs` : "—"}</p>
                    </div>
                  </div>

                  {/* Goal */}
                  {client.goal && (
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Primary Goal</p>
                        <p className="font-medium">{client.goal}</p>
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {client.experience && (
                    <div className="flex items-start gap-3">
                      <Dumbbell className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Experience Level</p>
                        <p className="font-medium">{client.experience}</p>
                      </div>
                    </div>
                  )}

                  {/* Equipment */}
                  {client.equipment && (
                    <div className="flex items-start gap-3">
                      <Dumbbell className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Available Equipment</p>
                        <p className="font-medium">{client.equipment}</p>
                      </div>
                    </div>
                  )}

                  {/* Injuries */}
                  {client.injuries && (
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Injuries/Limitations</p>
                        <p className="font-medium">{client.injuries}</p>
                      </div>
                    </div>
                  )}

                  {/* Faith Commitment */}
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Faith Commitment</p>
                      <p className="font-medium">
                        {client.faith_commitment ? "Committed" : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Progress Overview */}
          <div>
            <button
              type="button"
              className="flex items-center justify-between w-full min-h-[44px] text-left"
              onClick={() => setProgressExpanded(!progressExpanded)}
            >
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4" /> Progress Overview
              </h3>
              {progressExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {progressExpanded && (
              <div className="mt-3">
                {progressLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : progressData ? (
                  <div className="space-y-4">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <Dumbbell className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <p className="text-lg font-bold">{progressData.stats.totalWorkoutsCompleted}</p>
                        <p className="text-xs text-muted-foreground">Total Workouts</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                        <p className="text-lg font-bold">{progressData.stats.currentStreak}</p>
                        <p className="text-xs text-muted-foreground">Day Streak</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <ClipboardCheck className="h-4 w-4 mx-auto mb-1 text-green-500" />
                        <p className="text-lg font-bold">{progressData.checkIns.length}</p>
                        <p className="text-xs text-muted-foreground">Check-ins</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <Camera className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                        <p className="text-lg font-bold">{progressData.progressPhotos.length}</p>
                        <p className="text-xs text-muted-foreground">Photos</p>
                      </div>
                    </div>

                    {/* This Week + Weight */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">This Week</p>
                        <p className="font-semibold">{progressData.stats.currentWeekWorkouts} workouts</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Weight</p>
                        <p className="font-semibold">
                          {progressData.stats.latestWeight
                            ? `${progressData.stats.latestWeight} lbs`
                            : "No data"}
                          {progressData.stats.weightChange != null && (
                            <span className={progressData.stats.weightChange < 0 ? "text-green-400 ml-1" : "text-yellow-400 ml-1"}>
                              ({progressData.stats.weightChange > 0 ? "+" : ""}{progressData.stats.weightChange})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Recent Check-ins */}
                    {progressData.checkIns.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Recent Check-ins</p>
                        <div className="space-y-2">
                          {progressData.checkIns.slice(0, 3).map((ci: any) => (
                            <div key={ci.id} className="bg-muted/30 rounded p-2 text-sm">
                              <div className="flex justify-between">
                                <span className="font-medium">Week {ci.week_number}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(ci.created_at), "MMM d")}
                                </span>
                              </div>
                              {ci.wins && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ci.wins}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No progress data yet</p>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Direct Messages */}
          <div>
            <button
              type="button"
              className="flex items-center justify-between w-full min-h-[44px] text-left"
              onClick={() => setMessagesExpanded(!messagesExpanded)}
            >
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Messages
                {conversationMessages.filter(m => m.recipient_id === user?.id && !m.read_at).length > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0">
                    {conversationMessages.filter(m => m.recipient_id === user?.id && !m.read_at).length}
                  </Badge>
                )}
              </h3>
              {messagesExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {messagesExpanded && (
              <div className="mt-3 space-y-3">
                {/* Message History */}
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {conversationMessages.length > 0 ? (
                    conversationMessages.map((msg) => {
                      const isFromMe = msg.sender_id === user?.id;
                      // Mark unread messages as read
                      if (msg.recipient_id === user?.id && !msg.read_at) {
                        markAsRead(msg.id);
                      }
                      return (
                        <div key={msg.id} className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            isFromMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-charcoal border border-border"
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isFromMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {format(new Date(msg.created_at), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No messages yet. Start the conversation below.
                    </p>
                  )}
                </div>

                {/* Send Message */}
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="min-h-[50px] resize-none text-sm"
                    rows={2}
                  />
                  <Button
                    variant="gold"
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="h-[50px] w-[50px] shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Enter to send, Shift+Enter for new line</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Subscription History */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Subscription History
            </h3>
            {client.subscriptions.length > 0 ? (
              <div className="space-y-3">
                {client.subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-muted/50 rounded-lg p-3 text-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      {getPlanBadge(sub.plan_type)}
                      {getStatusBadge(sub.status)}
                    </div>
                    <div className="text-muted-foreground space-y-1">
                      <p>Started: {format(new Date(sub.started_at), "MMM d, yyyy")}</p>
                      {sub.expires_at && (
                        <p>Expires: {format(new Date(sub.expires_at), "MMM d, yyyy")}</p>
                      )}
                      {sub.cancelled_at && (
                        <p>Cancelled: {format(new Date(sub.cancelled_at), "MMM d, yyyy")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No subscription history</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ClientDetailPanel;
