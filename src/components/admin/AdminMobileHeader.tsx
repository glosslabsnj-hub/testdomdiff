import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AdminMobileDrawer from "./AdminMobileDrawer";
import { sectionTitles, type AdminSection, type BadgeCounts } from "./adminNavConfig";

interface AdminMobileHeaderProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  badges: BadgeCounts;
}

export default function AdminMobileHeader({
  activeSection,
  onSectionChange,
  badges,
}: AdminMobileHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="md:hidden flex items-center gap-2 px-3 py-2.5 border-b border-border bg-charcoal sticky top-0 z-40">
      <AdminMobileDrawer
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        badges={badges}
      />

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold truncate">
          {sectionTitles[activeSection]}
        </h1>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        onClick={() => navigate("/dashboard")}
        aria-label="Back to dashboard"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
