import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Users, ClipboardCheck, MessageSquare, BookOpen, Layers, CreditCard, FileText, BarChart3, Settings, ScrollText, Package, Crown, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";

// Nav config
import { type AdminSection, type BadgeCounts } from "@/components/admin/adminNavConfig";

// Nav components
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileHeader from "@/components/admin/AdminMobileHeader";
import AdminBottomNav from "@/components/admin/AdminBottomNav";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";

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
import SocialCommandCenter from "@/components/admin/social-command/SocialCommandCenter";

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

  const pendingCheckIns = checkIns.filter(c => !c.coach_reviewed_at).length;
  const coachingClients = clientAnalytics?.clientsByPlan.coaching || 0;

  const badges: BadgeCounts = {
    pendingCheckIns,
    pendingSupportTickets: 0,
    coachingClients,
    pendingOrders: 0,
  };

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
            <AdminSectionHeader
              icon={Users}
              title="Users"
              description="Manage all members across all tiers."
              iconColor="text-blue-400"
            />
            <PeopleHub />
          </div>
        );

      case "check-ins":
        return (
          <div className="space-y-4">
            <AdminSectionHeader
              icon={ClipboardCheck}
              title="Check-Ins"
              description="Review weekly progress from members."
              iconColor="text-blue-400"
            />
            <CheckInReviewManager />
          </div>
        );

      case "support":
        return (
          <div className="space-y-4">
            <AdminSectionHeader
              icon={MessageSquare}
              title="Support Inbox"
              description="Member questions and help requests."
              iconColor="text-yellow-400"
            />
            <SupportInbox />
          </div>
        );

      case "content":
        return (
          <div className="space-y-4">
            <AdminSectionHeader
              icon={BookOpen}
              title="Programs & Content"
              description="Create and organize training content."
              iconColor="text-green-400"
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
        return (
          <div className="space-y-4">
            <AdminSectionHeader
              icon={Layers}
              title="Tiers & Access"
              description="Configure tier benefits and access levels."
              iconColor="text-green-400"
            />
            <TiersAccessManager />
          </div>
        );

      case "freeworld":
        return (
          <div className="space-y-4">
            <AdminSectionHeader
              icon={Crown}
              title="Free World"
              description="1:1 VIP coaching management."
              iconColor="text-purple-400"
            />
            <FreeWorldHub />
          </div>
        );

      case "payments":
        return (
          <div className="space-y-4">
            <AdminSectionHeader
              icon={CreditCard}
              title="Payments & Revenue"
              description="Track revenue and manage billing."
              iconColor="text-amber-400"
            />
            <PaymentsHub />
          </div>
        );

      case "intake":
        return (
          <div className="space-y-4">
            <AdminSectionHeader
              icon={FileText}
              title="Intake & Forms"
              description="View onboarding questionnaires and forms."
              iconColor="text-purple-400"
            />
            <IntakeManager />
          </div>
        );

      case "commissary":
        return (
          <div className="space-y-4">
            <AdminSectionHeader
              icon={Package}
              title="Commissary"
              description="Manage products and orders."
              iconColor="text-amber-400"
            />
            <CommissaryHub />
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-4">
            <AdminSectionHeader
              icon={BarChart3}
              title="Analytics"
              description="Engagement, leads, and growth metrics."
              iconColor="text-amber-400"
            />
            <AnalyticsHub />
          </div>
        );

      case "settings":
        return (
          <div className="space-y-4">
            <AdminSectionHeader
              icon={Settings}
              title="System Settings"
              description="Platform config and integrations."
              iconColor="text-muted-foreground"
            />
            <SiteSettingsManager />
          </div>
        );

      case "logs":
        return (
          <div className="space-y-4">
            <AdminSectionHeader
              icon={ScrollText}
              title="Logs & Safety"
              description="Audit trail and admin activity."
              iconColor="text-muted-foreground"
            />
            <AdminAuditLog />
          </div>
        );

      case "content-engine":
        return (
          <div className="space-y-4">
            <AdminSectionHeader
              icon={Flame}
              title="Social Command Center"
              description="Content ideas, scripts, and social growth."
              iconColor="text-orange-400"
            />
            <SocialCommandCenter />
          </div>
        );

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
          badges={badges}
        />

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AdminSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            badges={badges}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className={`p-4 md:p-6 ${isMobile ? "pb-24" : ""}`}>
            {/* Desktop breadcrumb */}
            <div className="hidden md:flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="headline-card">Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm">Manage your business, clients, and content</p>
              </div>
            </div>

            {renderSectionContent()}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <AdminBottomNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        badges={badges}
      />
    </div>
  );
}
