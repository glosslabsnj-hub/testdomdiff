import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  Video,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCoachingSessions, type CreateSessionInput } from "@/hooks/useCoachingSessions";

interface ClientSessionsTabProps {
  clientId: string;
}

export default function ClientSessionsTab({ clientId }: ClientSessionsTabProps) {
  const { sessions, loading, createSession, updateSession, completeSession } =
    useCoachingSessions(clientId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<string | null>(null);

  // Form state
  const [scheduledAt, setScheduledAt] = useState("");
  const [sessionType, setSessionType] = useState("weekly_checkin");
  const [notes, setNotes] = useState("");
  const [notesVisible, setNotesVisible] = useState(false);

  const resetForm = () => {
    setScheduledAt("");
    setSessionType("weekly_checkin");
    setNotes("");
    setNotesVisible(false);
    setEditingSession(null);
  };

  const handleSubmit = async () => {
    if (!scheduledAt) return;

    const input: CreateSessionInput = {
      client_id: clientId,
      scheduled_at: new Date(scheduledAt).toISOString(),
      session_type: sessionType,
      notes: notes || undefined,
      notes_visible_to_client: notesVisible,
    };

    await createSession(input);
    setDialogOpen(false);
    resetForm();
  };

  const handleComplete = async (sessionId: string, sessionNotes?: string) => {
    await completeSession(sessionId, sessionNotes);
  };

  const sessionTypeLabels: Record<string, string> = {
    weekly_checkin: "Weekly Check-in",
    strategy_call: "Strategy Call",
    emergency: "Emergency Session",
    intake: "Intake Call",
  };

  const upcomingSessions = sessions.filter((s) => !s.completed_at);
  const pastSessions = sessions.filter((s) => s.completed_at);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Coaching Sessions</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Session Type</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly_checkin">Weekly Check-in</SelectItem>
                    <SelectItem value="strategy_call">Strategy Call</SelectItem>
                    <SelectItem value="intake">Intake Call</SelectItem>
                    <SelectItem value="emergency">Emergency Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Pre-session notes, agenda items..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Share notes with client</Label>
                <Switch checked={notesVisible} onCheckedChange={setNotesVisible} />
              </div>

              <Button onClick={handleSubmit} className="w-full" variant="gold">
                Schedule Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Upcoming
          </h4>
          <div className="space-y-2">
            {upcomingSessions.map((session) => (
              <Card key={session.id} className="bg-background/50 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {sessionTypeLabels[session.session_type] || session.session_type}
                        </Badge>
                        {new Date(session.scheduled_at) < new Date() && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        {format(new Date(session.scheduled_at), "EEEE, MMMM d 'at' h:mm a")}
                      </p>
                      {session.notes && (
                        <p className="text-xs text-muted-foreground mt-2">{session.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleComplete(session.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Past Sessions ({pastSessions.length})
        </h4>
        {pastSessions.length > 0 ? (
          <div className="space-y-2">
            {pastSessions.map((session) => (
              <Card key={session.id} className="bg-background/50 border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {sessionTypeLabels[session.session_type] || session.session_type}
                        </Badge>
                        <span className="text-xs text-green-400">Completed</span>
                      </div>
                      <p className="text-sm">
                        {format(new Date(session.scheduled_at), "MMMM d, yyyy")}
                      </p>
                      {session.notes && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {session.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSession(session.id);
                        setNotes(session.notes || "");
                        setNotesVisible(session.notes_visible_to_client);
                      }}
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No completed sessions yet
          </p>
        )}
      </div>
    </div>
  );
}
