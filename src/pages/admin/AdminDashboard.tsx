import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TrendingUp, Users, Package, BookOpen, MessageSquare, ArrowLeft, Loader2, Settings, ClipboardCheck, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PeopleHub from "@/components/admin/PeopleHub";
import FreeWorldHub from "@/components/admin/FreeWorldHub";
import CommissaryHub from "@/components/admin/CommissaryHub";
import RevenueAnalytics from "@/components/admin/RevenueAnalytics";
import AdminQuickActions from "@/components/admin/AdminQuickActions";
import ClientHealthAlertsPanel from "@/components/admin/ClientHealthAlertsPanel";
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
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";
import ProgramTemplateManager from "@/components/admin/ProgramTemplateManager";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useChatLeadAnalytics } from "@/hooks/useChatLeadAnalytics";
import { useClientAnalytics } from "@/hooks/useClientAnalytics";
import { useAdminCheckIns } from "@/hooks/useAdminCheckIns";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { analytics: leadAnalytics, isLoading: leadsLoading } = useChatLeadAnalytics();
  const { checkIns } = useAdminCheckIns();
  const { analytics: clientAnalytics, loading: clientsLoading } = useClientAnalytics({});

  const [activeTab, setActiveTab] = useState("command");
  const [contentSection, setContentSection] = useState("workouts");

  // Count pending check-ins for badge
  const pendingCheckIns = checkIns.filter(c => !c.coach_reviewed_at).length;

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 section-container py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="headline-card">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage your business, clients, and content</p>
          </div>
        </div>

        {/* Consolidated Tabs - 4 Main Hubs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-charcoal border border-border flex-wrap h-auto gap-1 p-1.5 w-full justify-start">
            <TabsTrigger value="command" className="text-xs sm:text-sm px-3">
              <TrendingUp className="h-4 w-4 mr-2" />
              Command Center
            </TabsTrigger>
            <TabsTrigger value="people" className="text-xs sm:text-sm px-3 relative">
              <Users className="h-4 w-4 mr-2" />
              People
              {pendingCheckIns > 0 && (
                <Badge className="ml-2 bg-destructive text-destructive-foreground text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {pendingCheckIns > 9 ? "9+" : pendingCheckIns}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="freeworld" className="text-xs sm:text-sm px-3">
              <Crown className="h-4 w-4 mr-2 text-purple-400" />
              Free World
              {!clientsLoading && (clientAnalytics?.clientsByPlan.coaching || 0) > 0 && (
                <Badge className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  {clientAnalytics?.clientsByPlan.coaching || 0}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="commissary" className="text-xs sm:text-sm px-3">
              <Package className="h-4 w-4 mr-2" />
              Commissary
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm px-3">
              <BookOpen className="h-4 w-4 mr-2" />
              Content CMS
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm px-3">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Command Center - Overview + Leads */}
          <TabsContent value="command" className="space-y-6">
            {/* Revenue Analytics */}
            <RevenueAnalytics />

            {/* Top Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-charcoal border-border hover-lift">
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
              <Card className="bg-charcoal border-border hover-lift">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Leads Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {leadsLoading ? "..." : leadAnalytics?.leadsToday || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <AdminQuickActions 
              onNavigate={(tab) => setActiveTab(tab === "clients" || tab === "checkins" || tab === "coaching" ? "people" : tab)} 
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
          </TabsContent>

          {/* People Hub - Clients + Check-Ins */}
          <TabsContent value="people">
            <PeopleHub />
          </TabsContent>

          {/* Free World Hub - Coaching Clients */}
          <TabsContent value="freeworld">
            <FreeWorldHub />
          </TabsContent>

          {/* Commissary Hub - Products + Orders */}

          {/* Commissary Hub - Products + Orders */}
          <TabsContent value="commissary">
            <CommissaryHub />
          </TabsContent>

          {/* Content CMS - Unchanged */}
          <TabsContent value="content" className="space-y-6">
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
          </TabsContent>

          {/* Settings Hub */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Site Settings</h2>
                <p className="text-sm text-muted-foreground">Configure analytics pixels, integrations, and contact info</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/audit" className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  View Audit Report
                </Link>
              </Button>
            </div>
            <SiteSettingsManager />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
