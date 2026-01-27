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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuditLog } from "@/hooks/useAdminAuditLog";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
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
  const { logAction } = useAdminAuditLog();
  const [loading, setLoading] = useState(false);
  const [newPlan, setNewPlan] = useState<PlanType | "">("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);

  const activeSub = client.activeSubscription;
  const clientName = client.first_name || client.email;

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

      // Log the action
      await logAction.mutateAsync({
        actionType: "subscription_cancel",
        targetType: "subscription",
        targetId: activeSub.id,
        details: {
          userName: clientName,
          planType: activeSub.plan_type,
        },
      });

      toast({
        title: "Subscription Cancelled",
        description: `${clientName}'s subscription has been cancelled.`,
      });
      onUpdate();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to cancel subscription";
      toast({
        title: "Error",
        description: errorMessage,
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

      // Log the action
      await logAction.mutateAsync({
        actionType: activeSub ? "subscription_modify" : "subscription_create",
        targetType: "subscription",
        targetId: client.user_id,
        details: {
          userName: clientName,
          newPlan: PLAN_LABELS[newPlan],
          previousPlan: activeSub ? PLAN_LABELS[activeSub.plan_type] : null,
        },
      });

      toast({
        title: "Plan Changed",
        description: `${clientName} has been moved to ${PLAN_LABELS[newPlan]}.`,
      });
      onUpdate();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to change plan";
      toast({
        title: "Error",
        description: errorMessage,
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

      // Log the action
      await logAction.mutateAsync({
        actionType: "subscription_create",
        targetType: "subscription",
        targetId: client.user_id,
        details: {
          userName: clientName,
          planType: PLAN_LABELS[newPlan],
        },
      });

      toast({
        title: "Subscription Created",
        description: `${clientName} now has ${PLAN_LABELS[newPlan]}.`,
      });
      onUpdate();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to create subscription";
      toast({
        title: "Error",
        description: errorMessage,
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

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Subscription?"
        description={`You are about to cancel ${clientName}'s subscription.`}
        impacts={[
          "User will lose access immediately",
          "This action cannot be undone",
          "User will need to re-subscribe to regain access",
        ]}
        confirmButtonText="Cancel Subscription"
        confirmButtonVariant="destructive"
        isLoading={loading}
        onConfirm={handleCancelSubscription}
      />

      {/* Change Plan Confirmation Modal */}
      <ConfirmationModal
        open={showChangePlanDialog}
        onOpenChange={setShowChangePlanDialog}
        title="Change Plan?"
        description={`You are about to move ${clientName} to ${newPlan ? PLAN_LABELS[newPlan as PlanType] : ""}.`}
        impacts={
          newPlan === "transformation" 
            ? ["Current subscription will be cancelled", "New 12-week period starts today", "User will have 98 days of access"]
            : ["Current subscription will be cancelled", "New plan takes effect immediately"]
        }
        confirmText="CHANGE"
        confirmButtonText="Confirm Change"
        confirmButtonVariant="gold"
        isLoading={loading}
        onConfirm={handleChangePlan}
      />
    </div>
  );
};

export default SubscriptionManager;
