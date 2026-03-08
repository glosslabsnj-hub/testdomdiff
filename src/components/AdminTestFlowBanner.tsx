import { useLocation, useNavigate } from "react-router-dom";
import { StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminPreview } from "@/contexts/AdminPreviewContext";

const tierLabels: Record<string, string> = {
  membership: "Solitary Confinement",
  transformation: "General Population",
  coaching: "Free World",
};

/**
 * Shows a persistent banner during admin test flow on non-dashboard pages.
 * Dashboard pages get the banner from DashboardLayout's AdminPreviewBanner.
 */
export default function AdminTestFlowBanner() {
  const { isAdmin, isTestingFlow, previewTier, stopTestFlow } = useAdminPreview();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't render on dashboard pages (DashboardLayout has its own banner)
  if (!isAdmin || !isTestingFlow || location.pathname.startsWith("/dashboard")) return null;

  const handleStop = () => {
    stopTestFlow();
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-green-600/90 backdrop-blur-sm border-b border-green-400/30 px-4 py-2">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <span className="text-white text-xs sm:text-sm font-medium">
          Testing: {previewTier ? tierLabels[previewTier] : "Unknown"} Flow
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStop}
          className="text-white/80 hover:text-white hover:bg-white/10 gap-1 h-7 px-2"
        >
          <StopCircle className="w-3 h-3" />
          <span>Stop Test</span>
        </Button>
      </div>
    </div>
  );
}
