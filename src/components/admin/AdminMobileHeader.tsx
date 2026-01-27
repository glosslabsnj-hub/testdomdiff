import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AdminMobileDrawer from "./AdminMobileDrawer";
import type { AdminSection } from "./AdminSidebar";

interface AdminMobileHeaderProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  pendingCheckIns?: number;
  pendingSupportTickets?: number;
  coachingClients?: number;
  pendingOrders?: number;
}

const sectionTitles: Record<AdminSection, string> = {
  command: "Command Center",
  users: "Users",
  "check-ins": "Check-Ins",
  support: "Support",
  content: "Programs & Content",
  tiers: "Tiers & Access",
  payments: "Payments",
  intake: "Intake & Forms",
  commissary: "Commissary",
  analytics: "Analytics",
  settings: "Settings",
  logs: "Logs & Safety",
  freeworld: "Free World",
  "content-engine": "Content Engine",
};

export default function AdminMobileHeader({
  activeSection,
  onSectionChange,
  pendingCheckIns,
  pendingSupportTickets,
  coachingClients,
  pendingOrders,
}: AdminMobileHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="md:hidden flex items-center gap-2 p-4 border-b border-border bg-charcoal sticky top-0 z-40">
      <AdminMobileDrawer
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        pendingCheckIns={pendingCheckIns}
        pendingSupportTickets={pendingSupportTickets}
        coachingClients={coachingClients}
        pendingOrders={pendingOrders}
      />
      
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold truncate">
          {sectionTitles[activeSection]}
        </h1>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/dashboard")}
        className="text-xs text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Exit
      </Button>
    </div>
  );
}
