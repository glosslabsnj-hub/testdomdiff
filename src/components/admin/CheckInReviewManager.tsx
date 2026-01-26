import { useState } from "react";
import { format } from "date-fns";
import {
  ClipboardCheck,
  Search,
  Filter,
  MessageSquare,
  User,
  Scale,
  Dumbbell,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Send,
  CheckSquare,
  Square,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAdminCheckIns, type AdminCheckIn } from "@/hooks/useAdminCheckIns";
import { useToast } from "@/hooks/use-toast";

export default function CheckInReviewManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterReview, setFilterReview] = useState<string>("all");
  const [expandedCheckIn, setExpandedCheckIn] = useState<string | null>(null);
  const [coachNotes, setCoachNotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const { toast } = useToast();

  const { checkIns, loading, addCoachNotes, getCheckInStats, refetch } = useAdminCheckIns({
    search: searchQuery,
    needsReview: filterReview === "pending",
  });

  const stats = getCheckInStats();

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === checkIns.filter(c => !c.coach_reviewed_at).length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(checkIns.filter(c => !c.coach_reviewed_at).map(c => c.id)));
    }
  };

  const handleBulkMarkReviewed = async () => {
    if (selectedIds.size === 0) return;
    
    setBulkProcessing(true);
    let successCount = 0;
    
    for (const id of selectedIds) {
      const success = await addCoachNotes(id, "Bulk reviewed - no additional notes.");
      if (success) successCount++;
    }
    
    setBulkProcessing(false);
    setSelectedIds(new Set());
    
    toast({
      title: "Bulk review complete",
      description: `${successCount} check-in${successCount !== 1 ? 's' : ''} marked as reviewed.`,
    });
  };

  const handleSubmitNotes = async (checkIn: AdminCheckIn) => {
    const notes = coachNotes[checkIn.id];
    if (!notes?.trim()) {
      toast({
        title: "Error",
        description: "Please enter coach notes before submitting",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(checkIn.id);
    const success = await addCoachNotes(checkIn.id, notes);
    setSubmitting(null);

    if (success) {
      toast({
        title: "Success",
        description: "Coach notes saved and check-in marked as reviewed",
      });
      setCoachNotes(prev => ({ ...prev, [checkIn.id]: "" }));
      setExpandedCheckIn(null);
    } else {
      toast({
        title: "Error",
        description: "Failed to save coach notes",
        variant: "destructive",
      });
    }
  };

  const getPlanBadge = (planType?: string) => {
    switch (planType) {
      case "transformation":
        return <Badge className="bg-primary/20 text-primary border-primary/30">12-Week</Badge>;
      case "membership":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Monthly</Badge>;
      case "coaching":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Coaching</Badge>;
      default:
        return null;
    }
  };

  const getInitials = (checkIn: AdminCheckIn) => {
    const first = checkIn.profile?.first_name?.[0] || "";
    const last = checkIn.profile?.last_name?.[0] || "";
    return (first + last).toUpperCase() || "??";
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Check-Ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{loading ? "..." : stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{loading ? "..." : stats.thisWeek}</div>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{loading ? "..." : stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Reviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{loading ? "..." : stats.reviewed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Bulk Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-charcoal border-border"
            />
          </div>
          <Select value={filterReview} onValueChange={setFilterReview}>
            <SelectTrigger className="w-full sm:w-[180px] bg-charcoal border-border">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Check-Ins</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions Bar */}
        {checkIns.filter(c => !c.coach_reviewed_at).length > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedIds.size === checkIns.filter(c => !c.coach_reviewed_at).length && selectedIds.size > 0}
                onCheckedChange={toggleSelectAll}
                className="border-muted-foreground"
              />
              <span className="text-sm text-muted-foreground">
                {selectedIds.size > 0 
                  ? `${selectedIds.size} selected` 
                  : `Select all pending (${checkIns.filter(c => !c.coach_reviewed_at).length})`}
              </span>
            </div>
            {selectedIds.size > 0 && (
              <Button
                variant="gold"
                size="sm"
                onClick={handleBulkMarkReviewed}
                disabled={bulkProcessing}
                className="gap-2"
              >
                {bulkProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckSquare className="h-4 w-4" />
                )}
                Mark {selectedIds.size} Reviewed
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Check-Ins List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : checkIns.length === 0 ? (
        <Card className="bg-charcoal border-border">
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No check-ins found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {checkIns.map((checkIn) => (
            <Collapsible
              key={checkIn.id}
              open={expandedCheckIn === checkIn.id}
              onOpenChange={(open) => setExpandedCheckIn(open ? checkIn.id : null)}
            >
              <Card className="bg-charcoal border-border overflow-hidden">
                <CollapsibleTrigger asChild>
                  <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Checkbox for pending items */}
                        {!checkIn.coach_reviewed_at && (
                          <Checkbox
                            checked={selectedIds.has(checkIn.id)}
                            onCheckedChange={() => toggleSelect(checkIn.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="border-muted-foreground"
                          />
                        )}
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={checkIn.profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {getInitials(checkIn)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">
                              {checkIn.profile?.first_name || checkIn.profile?.last_name
                                ? `${checkIn.profile?.first_name || ""} ${checkIn.profile?.last_name || ""}`.trim()
                                : "Unknown"}
                            </p>
                            {getPlanBadge(checkIn.subscription?.plan_type)}
                            <Badge variant="outline" className="text-xs">
                              Week {checkIn.week_number}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(checkIn.submitted_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {checkIn.coach_reviewed_at ? (
                          <Badge className="bg-success/20 text-success border-success/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Reviewed
                          </Badge>
                        ) : (
                          <Badge className="bg-warning/20 text-warning border-warning/30">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        {expandedCheckIn === checkIn.id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="flex gap-6 mt-3 text-sm">
                      {checkIn.weight && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Scale className="h-3.5 w-3.5" />
                          <span>{checkIn.weight} lbs</span>
                        </div>
                      )}
                      {checkIn.workouts_completed !== null && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Dumbbell className="h-3.5 w-3.5" />
                          <span>{checkIn.workouts_completed} workouts</span>
                        </div>
                      )}
                      {checkIn.steps_avg && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>{checkIn.steps_avg.toLocaleString()} steps/day</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Weight</p>
                        <p className="font-semibold">{checkIn.weight ? `${checkIn.weight} lbs` : "—"}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Waist</p>
                        <p className="font-semibold">{checkIn.waist ? `${checkIn.waist}"` : "—"}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Avg Steps</p>
                        <p className="font-semibold">{checkIn.steps_avg?.toLocaleString() || "—"}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Workouts</p>
                        <p className="font-semibold">{checkIn.workouts_completed ?? "—"}</p>
                      </div>
                    </div>

                    {/* Text Responses */}
                    <div className="space-y-3">
                      {checkIn.wins && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Wins This Week</p>
                          <p className="text-sm bg-muted/20 rounded-lg p-3">{checkIn.wins}</p>
                        </div>
                      )}
                      {checkIn.struggles && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Struggles</p>
                          <p className="text-sm bg-muted/20 rounded-lg p-3">{checkIn.struggles}</p>
                        </div>
                      )}
                      {checkIn.changes && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Changes Noticed</p>
                          <p className="text-sm bg-muted/20 rounded-lg p-3">{checkIn.changes}</p>
                        </div>
                      )}
                      {checkIn.faith_reflection && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Faith Reflection</p>
                          <p className="text-sm bg-muted/20 rounded-lg p-3">{checkIn.faith_reflection}</p>
                        </div>
                      )}
                    </div>

                    {/* Existing Coach Notes */}
                    {checkIn.coach_notes && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <p className="text-sm font-semibold text-primary">Coach Notes</p>
                          {checkIn.coach_reviewed_at && (
                            <span className="text-xs text-muted-foreground">
                              — {format(new Date(checkIn.coach_reviewed_at), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{checkIn.coach_notes}</p>
                      </div>
                    )}

                    {/* Add/Update Coach Notes */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {checkIn.coach_notes ? "Update Coach Notes" : "Add Coach Notes"}
                      </p>
                      <Textarea
                        placeholder="Enter your feedback and notes for this check-in..."
                        value={coachNotes[checkIn.id] || ""}
                        onChange={(e) =>
                          setCoachNotes((prev) => ({ ...prev, [checkIn.id]: e.target.value }))
                        }
                        className="bg-muted/30 border-border min-h-[100px]"
                      />
                      <Button
                        variant="gold"
                        onClick={() => handleSubmitNotes(checkIn)}
                        disabled={submitting === checkIn.id}
                        className="w-full sm:w-auto"
                      >
                        {submitting === checkIn.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Save Notes & Mark Reviewed
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}
