import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";

// Sidebar & Sections
import AdminSidebar, { type AdminSection } from "@/components/admin/AdminSidebar";
import AdminMobileHeader from "@/components/admin/AdminMobileHeader";

// Section Components
import CommandCenterCollapsible from "@/components/admin/CommandCenterCollapsible";
import PeopleHub from "@/components/admin/PeopleHub";
import FreeWorldHub from "@/components/admin/FreeWorldHub";
import CommissaryHub from "@/components/admin/CommissaryHub";
import CheckInReviewManager from "@/components/admin/CheckInReviewManager";
import SupportInbox from "@/components/admin/SupportInbox";
import TiersAccessManager from "@/components/admin/TiersAccessManager";
import PaymentsHub from "@/components/admin/PaymentsHub";
import IntakeManager from "@/components/admin/IntakeManager";
import AnalyticsHub from "@/components/admin/AnalyticsHub";
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";
import AdminAuditLog from "@/components/admin/AdminAuditLog";
import ContentEngineHub from "@/components/admin/ContentEngineHub";

// Content CMS
import ContentNavigation from "@/components/admin/ContentNavigation";
import ProgramBuilder from "@/components/admin/ProgramBuilder";
import WorkoutContentManager from "@/components/admin/WorkoutContentManager";
import FaithLessonsManager from "@/components/admin/FaithLessonsManager";
import NutritionManager from "@/components/admin/NutritionManager";
import MealPlanManager from "@/components/admin/MealPlanManager";
import MealAnalyticsPanel from "@/components/admin/MealAnalyticsPanel";
import DisciplineManager from "@/components/admin/DisciplineManager";
import SkillLessonsManager from "@/components/admin/SkillLessonsManager";
import WelcomeVideosManager from "@/components/admin/WelcomeVideosManager";
import TierOnboardingManager from "@/components/admin/TierOnboardingManager";
import ProgramTemplateManager from "@/components/admin/ProgramTemplateManager";

import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useChatLeadAnalytics } from "@/hooks/useChatLeadAnalytics";
import { useClientAnalytics } from "@/hooks/useClientAnalytics";
import { useAdminCheckIns } from "@/hooks/useAdminCheckIns";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { analytics: leadAnalytics, isLoading: leadsLoading } = useChatLeadAnalytics();
  const { checkIns } = useAdminCheckIns();
  const { analytics: clientAnalytics, loading: clientsLoading } = useClientAnalytics({});

  const [activeSection, setActiveSection] = useState<AdminSection>("command");
  const [contentSection, setContentSection] = useState("workouts");

  // Count pending check-ins for badge
  const pendingCheckIns = checkIns.filter(c => !c.coach_reviewed_at).length;
  const coachingClients = clientAnalytics?.clientsByPlan.coaching || 0;

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You don't have permission to view this page.</p>
        <Button variant="gold" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    );
  }

  // Render the active section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case "command":
        return (
          <CommandCenterCollapsible
            clientAnalytics={clientAnalytics}
            clientsLoading={clientsLoading}
            leadAnalytics={leadAnalytics}
            leadsLoading={leadsLoading}
            pendingCheckIns={pendingCheckIns}
            onNavigate={setActiveSection}
          />
        );
      
      case "users":
        return (
          <div className="space-y-4">
            <SectionHeader 
              title="Users" 
              description="Manage all members across all tiers. Search, filter, and take action."
            />
            <PeopleHub />
          </div>
        );
      
      case "check-ins":
        return (
          <div className="space-y-4">
            <SectionHeader 
              title="Check-Ins" 
              description="Review weekly progress submissions from members. Mark as reviewed to track your coaching."
            />
            <CheckInReviewManager />
          </div>
        );
      
      case "support":
        return (
          <div className="space-y-4">
            <SectionHeader 
              title="Support Inbox" 
              description="Member questions and help requests. Respond directly or flag for follow-up."
            />
            <SupportInbox />
          </div>
        );
      
      case "content":
        return (
          <div className="space-y-4">
            <SectionHeader 
              title="Programs & Content" 
              description="Create, edit, and organize all training and lifestyle content."
            />
            <div className="flex flex-col md:flex-row gap-6">
              <ContentNavigation 
                activeSection={contentSection} 
                onSelectSection={setContentSection}
              />
              <div className="flex-1 min-w-0">
                {contentSection === "program" && <ProgramBuilder />}
                {contentSection === "workouts" && <WorkoutContentManager />}
                {contentSection === "freeworld-templates" && <ProgramTemplateManager />}
                {contentSection === "faith" && <FaithLessonsManager />}
                {contentSection === "nutrition" && <NutritionManager />}
                {contentSection === "mealplans" && <MealPlanManager />}
                {contentSection === "meal-analytics" && <MealAnalyticsPanel />}
                {contentSection === "discipline" && <DisciplineManager />}
                {contentSection === "skills" && <SkillLessonsManager />}
                {contentSection === "welcome-videos" && <WelcomeVideosManager />}
                {contentSection === "tier-onboarding" && <TierOnboardingManager />}
              </div>
            </div>
          </div>
        );
      
      case "tiers":
        return <TiersAccessManager />;
      
      case "freeworld":
        return (
          <div className="h-full">
            <FreeWorldHub />
          </div>
        );
      
      case "payments":
        return <PaymentsHub />;
      
      case "intake":
        return <IntakeManager />;
      
      case "commissary":
        return (
          <div className="space-y-4">
            <SectionHeader 
              title="Commissary" 
              description="Manage products and orders for the shop."
            />
            <CommissaryHub />
          </div>
        );
      
      case "analytics":
        return <AnalyticsHub />;
      
      case "settings":
        return (
          <div className="space-y-4">
            <SectionHeader 
              title="System Settings" 
              description="Configure platform settings, integrations, and administrative preferences."
            />
            <SiteSettingsManager />
          </div>
        );
      
      case "logs":
        return <AdminAuditLog />;
      
      case "content-engine":
        return <ContentEngineHub />;
      
      default:
        return null;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      {/* Desktop header only */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col md:flex-row md:pt-16">
        {/* Mobile Header with Drawer */}
        <AdminMobileHeader
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          pendingCheckIns={pendingCheckIns}
          coachingClients={coachingClients}
        />

        {/* Desktop Sidebar - Hidden on Mobile */}
        <div className="hidden md:block">
          <AdminSidebar 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            pendingCheckIns={pendingCheckIns}
            coachingClients={coachingClients}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-4 md:p-6">
            {/* Desktop Back to Dashboard link - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="headline-card">Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm">Manage your business, clients, and content</p>
              </div>
            </div>

            {/* Section Content */}
            {renderSectionContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

// Section Header Component
function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

