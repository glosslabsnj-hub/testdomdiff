import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

// Sidebar & Sections
import AdminSidebar, { type AdminSection } from "@/components/admin/AdminSidebar";

// Section Components
import RevenueAnalytics from "@/components/admin/RevenueAnalytics";
import AdminQuickActions from "@/components/admin/AdminQuickActions";
import ClientHealthAlertsPanel from "@/components/admin/ClientHealthAlertsPanel";
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
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
        return <CommandCenterContent 
          clientAnalytics={clientAnalytics}
          clientsLoading={clientsLoading}
          leadAnalytics={leadAnalytics}
          leadsLoading={leadsLoading}
          pendingCheckIns={pendingCheckIns}
          onNavigate={setActiveSection}
        />;
      
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
      
      default:
        return null;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <Header />
      <main className="flex-1 min-h-0 overflow-hidden flex pt-16">
        {/* Left Sidebar Navigation */}
        <AdminSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          pendingCheckIns={pendingCheckIns}
          coachingClients={coachingClients}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-6">
            {/* Back to Dashboard link */}
            <div className="flex items-center gap-4 mb-6">
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

// Command Center Content Component
function CommandCenterContent({ 
  clientAnalytics, 
  clientsLoading, 
  leadAnalytics, 
  leadsLoading,
  pendingCheckIns,
  onNavigate,
}: {
  clientAnalytics: ReturnType<typeof useClientAnalytics>['analytics'];
  clientsLoading: boolean;
  leadAnalytics: ReturnType<typeof useChatLeadAnalytics>['analytics'];
  leadsLoading: boolean;
  pendingCheckIns: number;
  onNavigate: (section: AdminSection) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Command Center" 
        description="Your business at a glance. Click any card to dive deeper."
      />

      {/* Revenue Analytics */}
      <RevenueAnalytics />

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className="bg-charcoal border-border hover-lift cursor-pointer"
          onClick={() => onNavigate("users")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {clientsLoading ? "..." : clientAnalytics?.totalClients || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-border hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {clientsLoading ? "..." : clientAnalytics?.activeClients || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-border hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {leadsLoading ? "..." : leadAnalytics?.totalLeads || 0}
            </div>
          </CardContent>
        </Card>
        <Card 
          className="bg-charcoal border-border hover-lift cursor-pointer"
          onClick={() => onNavigate("check-ins")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Check-Ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {pendingCheckIns}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <AdminQuickActions 
        onNavigate={(tab) => {
          if (tab === "clients") onNavigate("users");
          else if (tab === "checkins") onNavigate("check-ins");
          else if (tab === "coaching") onNavigate("intake");
          else if (tab === "content") onNavigate("content");
          else if (tab === "commissary") onNavigate("commissary");
        }} 
        pendingCheckIns={pendingCheckIns}
      />

      {/* Active Subscriptions by Program */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-400">Solitary Confinement</CardTitle>
            <p className="text-xs text-muted-foreground">Monthly Membership</p>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-400">
              {clientsLoading ? "..." : clientAnalytics?.clientsByPlan.membership || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">active members</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary">General Population</CardTitle>
            <p className="text-xs text-muted-foreground">12-Week Program</p>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {clientsLoading ? "..." : clientAnalytics?.clientsByPlan.transformation || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">active members</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-400">Free World</CardTitle>
            <p className="text-xs text-muted-foreground">1:1 Coaching</p>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-400">
              {clientsLoading ? "..." : clientAnalytics?.clientsByPlan.coaching || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">active members</p>
          </CardContent>
        </Card>
      </div>

      {/* Client Health Alerts */}
      <ClientHealthAlertsPanel />

      {/* Lead Stats */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          Lead Analytics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-charcoal border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {leadsLoading ? "..." : leadAnalytics?.totalLeads || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-charcoal border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Avg Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {leadsLoading ? "..." : leadAnalytics?.avgMessageCount?.toFixed(1) || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-charcoal border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {leadsLoading ? "..." : leadAnalytics?.conversions || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-charcoal border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {leadsLoading || !leadAnalytics?.totalLeads ? "..." : `${Math.min(100, Math.round(((leadAnalytics?.conversions || 0) / leadAnalytics.totalLeads) * 100))}%`}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
