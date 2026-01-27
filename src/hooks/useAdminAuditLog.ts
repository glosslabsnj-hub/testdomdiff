import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export type ActionType = 
  | "user_upgrade"
  | "user_downgrade"
  | "user_deactivate"
  | "user_reactivate"
  | "subscription_cancel"
  | "subscription_create"
  | "subscription_modify"
  | "content_create"
  | "content_update"
  | "content_delete"
  | "product_create"
  | "product_update"
  | "product_delete"
  | "order_update"
  | "check_in_review"
  | "settings_update"
  | "intake_review";

export type TargetType = 
  | "user"
  | "subscription"
  | "content"
  | "product"
  | "order"
  | "check_in"
  | "setting"
  | "intake";

interface LogActionParams {
  actionType: ActionType;
  targetType?: TargetType;
  targetId?: string;
  details?: Record<string, string | number | boolean | null>;
}

export function useAdminAuditLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch recent audit logs
  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-audit-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as AuditLogEntry[];
    },
  });

  // Log an admin action
  const logAction = useMutation({
    mutationFn: async ({ actionType, targetType, targetId, details }: LogActionParams) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("admin_audit_log")
        .insert([{
          admin_id: user.id,
          action_type: actionType,
          target_type: targetType || null,
          target_id: targetId || null,
          details: details || null,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-audit-log"] });
    },
  });

  // Helper to get human-readable action descriptions
  const getActionDescription = (log: AuditLogEntry): string => {
    const details = log.details as Record<string, string> | null;
    const userName = details?.userName || details?.user_name || "a user";
    
    switch (log.action_type) {
      case "user_upgrade":
        return `Upgraded ${userName} to ${details?.newPlan || "new plan"}`;
      case "user_downgrade":
        return `Downgraded ${userName} to ${details?.newPlan || "new plan"}`;
      case "user_deactivate":
        return `Deactivated ${userName}'s account`;
      case "user_reactivate":
        return `Reactivated ${userName}'s account`;
      case "subscription_cancel":
        return `Cancelled ${userName}'s subscription`;
      case "subscription_create":
        return `Created ${details?.planType || ""} subscription for ${userName}`;
      case "subscription_modify":
        return `Modified ${userName}'s subscription`;
      case "content_create":
        return `Created ${details?.contentType || "content"}: ${details?.title || ""}`;
      case "content_update":
        return `Updated ${details?.contentType || "content"}: ${details?.title || ""}`;
      case "content_delete":
        return `Deleted ${details?.contentType || "content"}: ${details?.title || ""}`;
      case "product_create":
        return `Added product: ${details?.productName || ""}`;
      case "product_update":
        return `Updated product: ${details?.productName || ""}`;
      case "product_delete":
        return `Deleted product: ${details?.productName || ""}`;
      case "order_update":
        return `Updated order status to ${details?.newStatus || ""}`;
      case "check_in_review":
        return `Reviewed check-in from ${userName}`;
      case "settings_update":
        return `Updated ${details?.settingName || "settings"}`;
      case "intake_review":
        return `Reviewed intake from ${userName}`;
      default:
        return log.action_type.replace(/_/g, " ");
    }
  };

  return {
    logs,
    isLoading,
    error,
    refetch,
    logAction,
    getActionDescription,
  };
}
