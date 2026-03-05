import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Crown,
  Check,
  X,
  Loader2,
  Dumbbell,
  UtensilsCrossed,
  Sparkles,
  MessageSquare,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlanOption {
  id: string;
  user_id: string;
  plan_type: "workout" | "meal";
  option_number: number;
  status: string;
  approach_title: string;
  approach_summary: string;
  sample_week_overview: Record<string, string>;
  key_differentiators: string[];
  dom_notes: string | null;
  created_at: string;
}

interface PlanOptionsReviewProps {
  userId?: string; // if provided, show for specific user. Otherwise show all pending.
}

export default function PlanOptionsReview({ userId }: PlanOptionsReviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [domNotes, setDomNotes] = useState<Record<string, string>>({});
  const [expandedOption, setExpandedOption] = useState<string | null>(null);

  // Fetch pending plan options
  const { data: options, isLoading } = useQuery({
    queryKey: ["coaching-plan-options", userId],
    queryFn: async () => {
      let query = supabase
        .from("coaching_plan_options")
        .select("*")
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      } else {
        query = query.eq("status", "pending_review");
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profile names for the users
      const userIds = [...new Set((data || []).map((d: any) => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      return (data || []).map((opt: any) => ({
        ...opt,
        profiles: profileMap.get(opt.user_id) || { first_name: "", last_name: "", email: "" },
      })) as (PlanOption & { profiles: { first_name: string; last_name: string; email: string } })[];
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ optionId, notes }: { optionId: string; notes?: string }) => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approve-coaching-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ optionId, domNotes: notes }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to approve");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Plan Approved",
        description: `${data.approved_option} is now being generated for the client.`,
      });
      queryClient.invalidateQueries({ queryKey: ["coaching-plan-options"] });
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Group options by user
  const grouped = (options || []).reduce((acc, opt) => {
    const key = `${opt.user_id}-${opt.plan_type}`;
    if (!acc[key]) {
      acc[key] = {
        userId: opt.user_id,
        planType: opt.plan_type,
        clientName: opt.profiles
          ? `${opt.profiles.first_name || ""} ${opt.profiles.last_name || ""}`.trim() || opt.profiles.email
          : "Unknown",
        options: [],
      };
    }
    acc[key].options.push(opt);
    return acc;
  }, {} as Record<string, { userId: string; planType: string; clientName: string; options: PlanOption[] }>);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const groups = Object.values(grouped);

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 bg-charcoal rounded-lg border border-border">
        <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No plans pending review</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          When Free World clients complete intake, their plan options will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={`${group.userId}-${group.planType}`} className="space-y-4">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-lg">{group.clientName}</h3>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {group.planType === "workout" ? (
                <><Dumbbell className="w-3 h-3 mr-1" /> Workout Plan</>
              ) : (
                <><UtensilsCrossed className="w-3 h-3 mr-1" /> Meal Plan</>
              )}
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {group.options
              .sort((a, b) => a.option_number - b.option_number)
              .map((option) => {
                const isExpanded = expandedOption === option.id;
                const isApproved = option.status === "approved";
                const isRejected = option.status === "rejected";
                const isPending = option.status === "pending_review";

                return (
                  <Card
                    key={option.id}
                    className={`transition-all cursor-pointer ${
                      isApproved
                        ? "border-green-500/50 bg-green-500/5"
                        : isRejected
                        ? "border-border/30 opacity-50"
                        : "border-purple-500/30 hover:border-purple-500/50 bg-charcoal"
                    }`}
                    onClick={() => setExpandedOption(isExpanded ? null : option.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          Option {option.option_number}
                        </Badge>
                        {isApproved && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <Check className="w-3 h-3 mr-1" /> Approved
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge variant="outline" className="text-muted-foreground">
                            <X className="w-3 h-3 mr-1" /> Passed
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base mt-2">{option.approach_title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{option.approach_summary}</p>

                      {/* Key Differentiators */}
                      <div className="space-y-1">
                        {(option.key_differentiators || []).map((diff, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <ChevronRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{diff}</span>
                          </div>
                        ))}
                      </div>

                      {/* Expanded: Sample Week */}
                      {isExpanded && option.sample_week_overview && (
                        <div className="pt-3 border-t border-border space-y-2">
                          <p className="text-xs font-medium text-primary uppercase tracking-wider">
                            {group.planType === "workout" ? "Sample Week" : "Sample Day"}
                          </p>
                          {Object.entries(option.sample_week_overview).map(([day, desc]) => (
                            <div key={day} className="flex gap-2 text-xs">
                              <span className="font-medium text-foreground min-w-[80px]">{day}</span>
                              <span className="text-muted-foreground">{desc as string}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Approve controls */}
                      {isPending && isExpanded && (
                        <div className="pt-3 border-t border-border space-y-3" onClick={(e) => e.stopPropagation()}>
                          <Textarea
                            placeholder="Add notes for this client's plan (optional)..."
                            value={domNotes[option.id] || ""}
                            onChange={(e) => setDomNotes((prev) => ({ ...prev, [option.id]: e.target.value }))}
                            className="text-sm bg-background border-border min-h-[60px]"
                          />
                          <Button
                            variant="gold"
                            size="sm"
                            className="w-full"
                            disabled={approveMutation.isPending}
                            onClick={() =>
                              approveMutation.mutate({
                                optionId: option.id,
                                notes: domNotes[option.id],
                              })
                            }
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Check className="w-4 h-4 mr-2" />
                            )}
                            Approve This Plan
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
