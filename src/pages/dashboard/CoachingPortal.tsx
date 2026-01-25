import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { 
  Crown, 
  Video, 
  MessageCircle, 
  Calendar, 
  Star,
  Target,
  CheckCircle2,
  Loader2,
  Send,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardBackLink from "@/components/DashboardBackLink";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachingSessions } from "@/hooks/useCoachingSessions";
import { useCoachingGoals } from "@/hooks/useCoachingGoals";
import { useCoachingActionItems } from "@/hooks/useCoachingActionItems";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useToast } from "@/hooks/use-toast";

// Dom's admin user ID - needed for direct messaging
const DOM_USER_ID = "00000000-0000-0000-0000-000000000000";

const CoachingPortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sessions, loading: sessionsLoading } = useCoachingSessions(user?.id);
  const { goals, loading: goalsLoading } = useCoachingGoals(user?.id);
  const { actionItems, toggleComplete, loading: itemsLoading, getPendingItems, getOverdueItems } = useCoachingActionItems(user?.id);
  const { messages, sendMessage, loading: messagesLoading } = useDirectMessages();
  
  const [quickMessage, setQuickMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Get upcoming session
  const upcomingSession = sessions
    .filter(s => !s.completed_at && new Date(s.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0];

  // Get past sessions with visible notes
  const pastSessions = sessions
    .filter(s => s.completed_at && s.notes_visible_to_client && s.notes)
    .slice(0, 5);

  // Active goals
  const activeGoals = goals.filter(g => g.status === "active");

  // Pending action items
  const pendingItems = getPendingItems();
  const overdueItems = getOverdueItems();

  const handleSendMessage = async () => {
    if (!quickMessage.trim()) return;
    
    setSending(true);
    try {
      const success = await sendMessage(DOM_USER_ID, quickMessage.trim());
      if (success) {
        toast({
          title: "Message Sent",
          description: "Your P.O. will respond within 24-48 hours.",
        });
        setQuickMessage("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const loading = sessionsLoading || goalsLoading || itemsLoading;

  return (
    <DashboardLayout>
      <div className="section-container py-8">
        <DashboardBackLink />
        
        {/* Premium Header */}
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-8 h-8 text-purple-400" />
          <h1 className="headline-section">
            <span className="text-purple-400">Free World</span> — P.O. Portal
          </h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Your direct line to Dom. Maximum accountability on the outside.
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Premium Features Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Next Check-in Card */}
              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30">
                <Video className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="headline-card mb-2">Weekly P.O. Check-In</h3>
                {upcomingSession ? (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Your next session:</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="font-medium">
                        {format(new Date(upcomingSession.scheduled_at), "EEEE, MMMM d 'at' h:mm a")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">
                    No upcoming sessions scheduled. Book your next check-in.
                  </p>
                )}
                <Button variant="gold" asChild>
                  <Link to="/dashboard/book-po-checkin">
                    {upcomingSession ? "Reschedule" : "Schedule Report"}
                  </Link>
                </Button>
              </div>

              {/* Quick Message Card */}
              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30">
                <MessageCircle className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="headline-card mb-2">Direct Line to Your P.O.</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Send a quick message to Dom. He'll respond within 24-48 hours.
                </p>
                <div className="space-y-3">
                  <Textarea
                    value={quickMessage}
                    onChange={(e) => setQuickMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[80px] bg-background/50"
                    rows={2}
                  />
                  <Button 
                    variant="goldOutline" 
                    className="w-full"
                    onClick={handleSendMessage}
                    disabled={!quickMessage.trim() || sending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>

              {/* Goals Card */}
              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30">
                <Target className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="headline-card mb-2">Your Goals</h3>
                {activeGoals.length > 0 ? (
                  <div className="space-y-3">
                    {activeGoals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{goal.title}</span>
                          <span className="text-purple-400">{Math.min(100, Math.max(0, goal.progress_pct || 0))}%</span>
                        </div>
                        <Progress value={Math.min(100, Math.max(0, goal.progress_pct || 0))} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No goals set yet. Dom will set goals during your next check-in.
                  </p>
                )}
              </div>

              {/* Action Items Card */}
              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30">
                <CheckCircle2 className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="headline-card mb-2">
                  Your Action Items
                  {overdueItems.length > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {overdueItems.length} overdue
                    </Badge>
                  )}
                </h3>
                {pendingItems.length > 0 ? (
                  <div className="space-y-2">
                    {pendingItems.slice(0, 4).map((item) => {
                      const isOverdue = item.due_date && new Date(item.due_date) < new Date();
                      return (
                        <div 
                          key={item.id}
                          className={`flex items-start gap-3 p-2 rounded-lg ${
                            isOverdue ? "bg-red-500/10" : "bg-background/30"
                          }`}
                        >
                          <Checkbox
                            checked={!!item.completed_at}
                            onCheckedChange={() => toggleComplete(item.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{item.title}</p>
                            {item.due_date && (
                              <p className={`text-xs ${isOverdue ? "text-red-400" : "text-muted-foreground"}`}>
                                {isOverdue && <AlertCircle className="w-3 h-3 inline mr-1" />}
                                Due: {format(new Date(item.due_date), "MMM d")}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    All caught up! No pending tasks.
                  </p>
                )}
              </div>
            </div>

            {/* Case File Notes Section */}
            <div className="p-8 bg-charcoal rounded-lg border border-border mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-purple-400" />
                <h3 className="headline-card">Case File Notes</h3>
              </div>
              
              {pastSessions.length > 0 ? (
                <div className="space-y-4">
                  {pastSessions.map((session) => (
                    <Card key={session.id} className="bg-background/50 border-border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            {format(new Date(session.scheduled_at), "MMMM d, yyyy")}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {session.session_type.replace("_", " ")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {session.notes}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-background/50 rounded border border-dashed border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    No case notes yet. Complete your first check-in to get started.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-8 bg-charcoal rounded-lg border border-purple-500/30">
              <h3 className="headline-card mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="gold" asChild>
                  <Link to="/dashboard/book-po-checkin">Schedule P.O. Check-In</Link>
                </Button>
                <Button variant="goldOutline" asChild>
                  <Link to="/dashboard/check-in">Submit Weekly Report</Link>
                </Button>
                <Button variant="goldOutline" asChild>
                  <Link to="/dashboard/messages">View All Messages</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CoachingPortal;
