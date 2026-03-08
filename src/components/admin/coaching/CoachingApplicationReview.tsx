import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  User,
  Mail,
  Phone,
  Instagram,
  MapPin,
  Target,
  Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import EmptyState from "@/components/EmptyState";

interface CoachingApplication {
  id: string;
  user_id: string | null;
  status: "pending" | "approved" | "rejected" | "enrolled";
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  instagram: string | null;
  age: number | null;
  goals: string;
  experience: string;
  training_preference: string;
  location: string | null;
  why_coaching: string;
  commitment_level: string;
  current_workout: string | null;
  injuries_limitations: string | null;
  budget_confirmed: boolean;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
}

type FilterTab = "all" | "pending" | "approved" | "rejected";

const statusConfig = {
  pending: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock, label: "Pending" },
  approved: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2, label: "Approved" },
  rejected: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle, label: "Rejected" },
  enrolled: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: CheckCircle2, label: "Enrolled" },
};

export default function CoachingApplicationReview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<CoachingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("coaching_applications" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications((data as any as CoachingApplication[]) || []);
    } catch (err: any) {
      toast({
        title: "Error loading applications",
        description: err?.message || "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  const handleAction = async (appId: string, action: "approved" | "rejected") => {
    setProcessing(appId);
    try {
      const notes = adminNotes[appId]?.trim() || null;
      const { error } = await supabase
        .from("coaching_applications" as any)
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id || null,
          admin_notes: notes,
        } as any)
        .eq("id", appId);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: action, reviewed_at: new Date().toISOString(), reviewed_by: user?.id || null, admin_notes: notes }
            : a
        )
      );

      toast({
        title: action === "approved" ? "Application Approved" : "Application Rejected",
        description: `${action === "approved" ? "Approved" : "Rejected"} successfully.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to update application",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return <DashboardSkeleton variant="cards" count={3} />;
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList className="bg-charcoal border border-border">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-yellow-500 text-black">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="ghost" size="sm" onClick={fetchApplications}>
          Refresh
        </Button>
      </div>

      {/* Applications List */}
      {filtered.length === 0 ? (
        <EmptyState
          type="generic"
          title={filter === "all" ? "No applications yet" : `No ${filter} applications`}
          description={
            filter === "all"
              ? "When someone applies for coaching, their application will appear here."
              : `There are no ${filter} applications at the moment.`
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const config = statusConfig[app.status];
            const StatusIcon = config.icon;
            const isExpanded = expandedId === app.id;

            return (
              <div
                key={app.id}
                className="bg-charcoal rounded-lg border border-border overflow-hidden"
              >
                {/* Summary Row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(app.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {app.first_name} {app.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{app.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <Badge
                      variant="outline"
                      className={`${config.color} border text-xs`}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(app.created_at).toLocaleDateString()}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-border p-4 sm:p-6 space-y-5 animate-fade-in">
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{app.email}</span>
                      </div>
                      {app.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{app.phone}</span>
                        </div>
                      )}
                      {app.instagram && (
                        <div className="flex items-center gap-2 text-sm">
                          <Instagram className="w-4 h-4 text-muted-foreground" />
                          <span>{app.instagram}</span>
                        </div>
                      )}
                      {app.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{app.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-background rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Experience
                        </p>
                        <p className="text-sm font-medium capitalize">{app.experience}</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Preference
                        </p>
                        <p className="text-sm font-medium capitalize">{app.training_preference}</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Commitment
                        </p>
                        <p className="text-sm font-medium capitalize">
                          {app.commitment_level.replace("-", " ")}
                        </p>
                      </div>
                    </div>

                    {/* Long-form answers */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-primary" />
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Goals
                          </p>
                        </div>
                        <p className="text-sm bg-background p-3 rounded-lg border border-border">
                          {app.goals}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4 text-primary" />
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Why Coaching
                          </p>
                        </div>
                        <p className="text-sm bg-background p-3 rounded-lg border border-border">
                          {app.why_coaching}
                        </p>
                      </div>

                      {app.current_workout && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                            Current Workout
                          </p>
                          <p className="text-sm bg-background p-3 rounded-lg border border-border">
                            {app.current_workout}
                          </p>
                        </div>
                      )}

                      {app.injuries_limitations && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                            Injuries / Limitations
                          </p>
                          <p className="text-sm bg-background p-3 rounded-lg border border-border">
                            {app.injuries_limitations}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Age + Budget */}
                    <div className="flex items-center gap-4 text-sm">
                      {app.age && (
                        <span className="text-muted-foreground">
                          Age: <span className="text-foreground">{app.age}</span>
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        Budget confirmed:{" "}
                        <span className={app.budget_confirmed ? "text-green-400" : "text-red-400"}>
                          {app.budget_confirmed ? "Yes" : "No"}
                        </span>
                      </span>
                    </div>

                    {/* Admin Notes + Actions */}
                    {app.status === "pending" && (
                      <div className="border-t border-border pt-4 space-y-3">
                        <Textarea
                          value={adminNotes[app.id] || ""}
                          onChange={(e) =>
                            setAdminNotes((prev) => ({ ...prev, [app.id]: e.target.value }))
                          }
                          placeholder="Admin notes (optional)..."
                          className="bg-background border-border min-h-[80px]"
                        />
                        <div className="flex items-center gap-3">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAction(app.id, "approved")}
                            disabled={processing === app.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processing === app.id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction(app.id, "rejected")}
                            disabled={processing === app.id}
                          >
                            {processing === app.id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-1" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Show existing admin notes for reviewed apps */}
                    {app.status !== "pending" && app.admin_notes && (
                      <div className="border-t border-border pt-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                          Admin Notes
                        </p>
                        <p className="text-sm bg-background p-3 rounded-lg border border-border">
                          {app.admin_notes}
                        </p>
                        {app.reviewed_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Reviewed on {new Date(app.reviewed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
