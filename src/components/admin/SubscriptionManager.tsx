import { useState } from "react";
import { Loader2, ArrowRightLeft, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";
import { addDays, format } from "date-fns";

interface SubscriptionManagerProps {
  client: ClientWithSubscription;
  onUpdate: () => void;
}

type PlanType = "membership" | "transformation" | "coaching";

const PLAN_LABELS: Record<PlanType, string> = {
  membership: "Solitary Confinement (Monthly)",
  transformation: "General Population (12-Week)",
  coaching: "Free World (Coaching)",
};

const SubscriptionManager = ({ client, onUpdate }: SubscriptionManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newPlan, setNewPlan] = useState<PlanType | "">("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);

  const activeSub = client.activeSubscription;

  const handleCancelSubscription = async () => {
    if (!activeSub) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", activeSub.id);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: `${client.first_name || client.email}'s subscription has been cancelled.`,
      });
      onUpdate();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowCancelDialog(false);
    }
  };

  const handleChangePlan = async () => {
    if (!newPlan) return;
    
    setLoading(true);
    try {
      // Cancel current subscription if exists
      if (activeSub) {
        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("id", activeSub.id);
      }

      // Calculate expires_at for transformation plan (98 days = 12 weeks + 14 day grace)
      const expiresAt = newPlan === "transformation" 
        ? addDays(new Date(), 98).toISOString() 
        : null;

      // Create new subscription
      const { error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: client.user_id,
          plan_type: newPlan,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: expiresAt,
        });

      if (error) throw error;

      toast({
        title: "Plan Changed",
        description: `${client.first_name || client.email} has been moved to ${PLAN_LABELS[newPlan]}.`,
      });
      onUpdate();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to change plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowChangePlanDialog(false);
      setNewPlan("");
    }
  };

  const handleCreateSubscription = async () => {
    if (!newPlan) return;
    
    setLoading(true);
    try {
      const expiresAt = newPlan === "transformation" 
        ? addDays(new Date(), 98).toISOString() 
        : null;

      const { error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: client.user_id,
          plan_type: newPlan,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: expiresAt,
        });

      if (error) throw error;

      toast({
        title: "Subscription Created",
        description: `${client.first_name || client.email} now has ${PLAN_LABELS[newPlan]}.`,
      });
      onUpdate();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to create subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setNewPlan("");
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <ArrowRightLeft className="w-4 h-4" />
        Manage Subscription
      </h4>

      {activeSub ? (
        <div className="space-y-3">
          {/* Current Plan Info */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground mb-1">Current Plan</p>
            <p className="font-medium">{PLAN_LABELS[activeSub.plan_type]}</p>
            {activeSub.expires_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Expires: {format(new Date(activeSub.expires_at), "MMM d, yyyy")}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Select value={newPlan} onValueChange={(v) => setNewPlan(v as PlanType)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Move to plan..." />
                </SelectTrigger>
                <SelectContent>
                  {(["membership", "transformation", "coaching"] as PlanType[])
                    .filter((p) => p !== activeSub.plan_type)
                    .map((plan) => (
                      <SelectItem key={plan} value={plan}>
                        {PLAN_LABELS[plan]}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                variant="gold"
                size="sm"
                disabled={!newPlan || loading}
                onClick={() => setShowChangePlanDialog(true)}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Move"}
              </Button>
            </div>

            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={loading}
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Subscription
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>No active subscription</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={newPlan} onValueChange={(v) => setNewPlan(v as PlanType)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Assign plan..." />
              </SelectTrigger>
              <SelectContent>
                {(["membership", "transformation", "coaching"] as PlanType[]).map((plan) => (
                  <SelectItem key={plan} value={plan}>
                    {PLAN_LABELS[plan]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="gold"
              size="sm"
              disabled={!newPlan || loading}
              onClick={handleCreateSubscription}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign"}
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately cancel {client.first_name || client.email}'s subscription.
              They will lose access to premium features. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Active</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Plan Dialog */}
      <AlertDialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the current subscription and create a new one for {PLAN_LABELS[newPlan as PlanType]}.
              {newPlan === "transformation" && " The 12-week period will start today."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangePlan}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubscriptionManager;
