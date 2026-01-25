import { useAdminPreview } from "@/contexts/AdminPreviewContext";

/**
 * Hook that returns the effective subscription based on admin preview mode.
 * Use this instead of useAuth().subscription throughout the dashboard
 * to support admin tier preview functionality.
 */
export function useEffectiveSubscription() {
  const { effectiveSubscription, isPreviewMode, previewTier } = useAdminPreview();

  const planType = effectiveSubscription?.plan_type;
  const isCoaching = planType === "coaching";
  const isTransformation = planType === "transformation";
  const isMembership = planType === "membership";

  return {
    subscription: effectiveSubscription,
    planType,
    isCoaching,
    isTransformation,
    isMembership,
    isPreviewMode,
    previewTier,
  };
}
