import { Eye, X, PlayCircle, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminPreview } from "@/contexts/AdminPreviewContext";
import { useNavigate } from "react-router-dom";

type PlanType = "membership" | "transformation" | "coaching";

const tiers: { value: PlanType; label: string; short: string }[] = [
  { value: "membership", label: "Solitary Confinement", short: "Solitary" },
  { value: "transformation", label: "General Population", short: "Gen Pop" },
  { value: "coaching", label: "Free World", short: "Free World" },
];

export function AdminPreviewBanner() {
  const { isAdmin, isPreviewMode, previewTier, setPreviewTier, isTestingFlow, startTestFlow, stopTestFlow } = useAdminPreview();
  const navigate = useNavigate();

  if (!isAdmin) return null;

  const handleTestFlow = (tier: PlanType) => {
    startTestFlow(tier);
    // Coaching uses a different intake route
    const intakeRoute = tier === "coaching" ? "/freeworld-intake" : "/intake";
    navigate(intakeRoute, { replace: true });
  };

  const handleStopTestFlow = () => {
    stopTestFlow();
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="bg-amber-500/20 border-b border-amber-500/30 px-3 py-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-amber-200">
          <Eye className="w-4 h-4 shrink-0" />
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
            {isTestingFlow ? "Testing Flow:" : isPreviewMode ? "Viewing as:" : "Admin Mode"}
          </span>
        </div>

        {/* Tier switcher buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {tiers.map((tier) => (
            <Button
              key={tier.value}
              variant="ghost"
              size="sm"
              onClick={() => setPreviewTier(tier.value)}
              className={`h-7 px-2.5 text-xs font-medium transition-colors ${
                previewTier === tier.value
                  ? "bg-amber-500/40 text-amber-100 hover:bg-amber-500/50"
                  : "text-amber-300/70 hover:text-amber-100 hover:bg-amber-500/20"
              }`}
            >
              <span className="hidden sm:inline">{tier.label}</span>
              <span className="sm:hidden">{tier.short}</span>
            </Button>
          ))}

          {/* Separator */}
          <div className="w-px h-5 bg-amber-500/30 mx-1 hidden sm:block" />

          {/* Test Flow button */}
          {isTestingFlow ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStopTestFlow}
              className="text-red-300 hover:text-red-100 hover:bg-red-500/20 gap-1 h-7 px-2"
            >
              <StopCircle className="w-3 h-3" />
              <span className="hidden sm:inline">Stop Test</span>
              <span className="sm:hidden">Stop</span>
            </Button>
          ) : previewTier ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTestFlow(previewTier)}
              className="text-green-300 hover:text-green-100 hover:bg-green-500/20 gap-1 h-7 px-2"
            >
              <PlayCircle className="w-3 h-3" />
              <span className="hidden sm:inline">Test Full Flow</span>
              <span className="sm:hidden">Test</span>
            </Button>
          ) : null}

          {isPreviewMode && !isTestingFlow && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewTier(null)}
              className="text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/20 gap-1 h-7 px-2 ml-1"
            >
              <X className="w-3 h-3" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPreviewBanner;
