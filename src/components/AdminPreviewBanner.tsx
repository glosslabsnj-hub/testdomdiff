import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminPreview } from "@/contexts/AdminPreviewContext";

const tierLabels: Record<string, string> = {
  coaching: "Free World",
  transformation: "General Population",
  membership: "Solitary Confinement",
};

export function AdminPreviewBanner() {
  const { isPreviewMode, previewTier, setPreviewTier } = useAdminPreview();

  if (!isPreviewMode || !previewTier) return null;

  return (
    <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2">
      <div className="section-container flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-amber-200">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">
            ADMIN PREVIEW MODE — Viewing as{" "}
            <span className="text-amber-400">{tierLabels[previewTier]}</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPreviewTier(null)}
          className="text-amber-200 hover:text-amber-100 hover:bg-amber-500/20 gap-1 h-7 px-2"
        >
          <X className="w-3 h-3" />
          Exit Preview
        </Button>
      </div>
    </div>
  );
}

export default AdminPreviewBanner;
