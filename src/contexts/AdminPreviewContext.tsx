import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";

type PlanType = "membership" | "transformation" | "coaching";

interface PreviewSubscription {
  id: string;
  plan_type: PlanType;
  status: "active";
  started_at: string;
  expires_at: string | null;
}

interface AdminPreviewContextType {
  previewTier: PlanType | null;
  setPreviewTier: (tier: PlanType | null) => void;
  effectiveSubscription: PreviewSubscription | null;
  isPreviewMode: boolean;
  isAdmin: boolean;
  isAdminLoading: boolean;
  isTestingFlow: boolean;
  startTestFlow: (tier: PlanType) => void;
  stopTestFlow: () => void;
}

const AdminPreviewContext = createContext<AdminPreviewContextType | undefined>(undefined);

const STORAGE_KEY = "admin_preview_tier";
const TEST_FLOW_KEY = "admin_test_flow";

export function AdminPreviewProvider({ children }: { children: ReactNode }) {
  const { subscription } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useAdminCheck();
  const [isTestingFlow, setIsTestingFlow] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(TEST_FLOW_KEY) === "true";
  });
  const [previewTier, setPreviewTierState] = useState<PlanType | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ["membership", "transformation", "coaching"].includes(stored)) {
      return stored as PlanType;
    }
    // Default to coaching (Free World) if no stored preference
    return "coaching";
  });

  // Persist preview tier to localStorage
  useEffect(() => {
    if (previewTier) {
      localStorage.setItem(STORAGE_KEY, previewTier);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [previewTier]);

  // Clear preview tier if user is not admin
  useEffect(() => {
    if (!isAdminLoading && !isAdmin && previewTier) {
      setPreviewTierState(null);
      setIsTestingFlow(false);
      sessionStorage.removeItem(TEST_FLOW_KEY);
    }
  }, [isAdmin, isAdminLoading, previewTier]);

  const setPreviewTier = (tier: PlanType | null) => {
    if (!isAdmin) return;
    setPreviewTierState(tier);
  };

  const startTestFlow = (tier: PlanType) => {
    if (!isAdmin) return;
    setPreviewTierState(tier);
    setIsTestingFlow(true);
    sessionStorage.setItem(TEST_FLOW_KEY, "true");
  };

  const stopTestFlow = () => {
    setIsTestingFlow(false);
    sessionStorage.removeItem(TEST_FLOW_KEY);
  };

  // Build effective subscription
  const effectiveSubscription: PreviewSubscription | null = (() => {
    // If not admin or no preview active, use real subscription
    if (!isAdmin || !previewTier) {
      return subscription as PreviewSubscription | null;
    }

    // Admin with preview mode - create mock subscription
    return {
      id: "preview-mode",
      plan_type: previewTier,
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: previewTier === "transformation" 
        ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() 
        : null,
    };
  })();

  const isPreviewMode = isAdmin && previewTier !== null;

  return (
    <AdminPreviewContext.Provider
      value={{
        previewTier,
        setPreviewTier,
        effectiveSubscription,
        isPreviewMode,
        isAdmin,
        isAdminLoading,
        isTestingFlow,
        startTestFlow,
        stopTestFlow,
      }}
    >
      {children}
    </AdminPreviewContext.Provider>
  );
}

export function useAdminPreview() {
  const context = useContext(AdminPreviewContext);
  if (!context) {
    throw new Error("useAdminPreview must be used within an AdminPreviewProvider");
  }
  return context;
}
