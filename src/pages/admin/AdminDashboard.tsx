import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Users, MessageSquare, TrendingUp, Package, Loader2, Search, ShoppingBag, Crown, ClipboardCheck, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientDetailPanel from "@/components/admin/ClientDetailPanel";
import ProductManager from "@/components/admin/ProductManager";
import OrdersManager from "@/components/admin/OrdersManager";
import WorkoutContentManager from "@/components/admin/WorkoutContentManager";
import FaithLessonsManager from "@/components/admin/FaithLessonsManager";
import ProgramBuilder from "@/components/admin/ProgramBuilder";
import DisciplineManager from "@/components/admin/DisciplineManager";
import NutritionManager from "@/components/admin/NutritionManager";
import SkillLessonsManager from "@/components/admin/SkillLessonsManager";
import MealPlanManager from "@/components/admin/MealPlanManager";
import MealAnalyticsPanel from "@/components/admin/MealAnalyticsPanel";
import { CoachingCommandCenter } from "@/components/admin/coaching";
import WelcomeVideosManager from "@/components/admin/WelcomeVideosManager";
import CheckInReviewManager from "@/components/admin/CheckInReviewManager";
import ClientHealthAlertsPanel from "@/components/admin/ClientHealthAlertsPanel";
import AdminQuickActions from "@/components/admin/AdminQuickActions";
import ContentNavigation from "@/components/admin/ContentNavigation";
import ClientBulkActions from "@/components/admin/ClientBulkActions";
import RevenueAnalytics from "@/components/admin/RevenueAnalytics";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import EmptyState from "@/components/EmptyState";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useChatLeadAnalytics } from "@/hooks/useChatLeadAnalytics";
import { useClientAnalytics, type ClientWithSubscription } from "@/hooks/useClientAnalytics";
import { useAdminCheckIns } from "@/hooks/useAdminCheckIns";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { analytics: leadAnalytics, isLoading: leadsLoading, error: leadsError } = useChatLeadAnalytics();
  const { checkIns } = useAdminCheckIns();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [contentSection, setContentSection] = useState("workouts");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { analytics: clientAnalytics, loading: clientsLoading, error: clientsError, refetch: refetchClients } = useClientAnalytics({
    planType: planFilter, status: statusFilter, search: searchQuery,
  });

  const [selectedClient, setSelectedClient] = useState<ClientWithSubscription | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());

  // Count pending check-ins
  const pendingCheckIns = checkIns.filter(c => !c.coach_reviewed_at).length;

  if (adminLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case "cancelled": return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Cancelled</Badge>;
      case "expired": return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Expired</Badge>;
      default: return <Badge variant="secondary">No Sub</Badge>;
    }
  };

  const getPlanBadge = (planType: string) => {
    switch (planType) {
      case "transformation": return <Badge className="bg-primary/20 text-primary border-primary/30">12-Week</Badge>;
      case "membership": return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Monthly</Badge>;
      case "coaching": return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Coaching</Badge>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 section-container py-8 pt-24">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="headline-card">Admin Dashboard</h1><p className="text-muted-foreground text-sm">Manage clients, leads, and products</p></div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-charcoal border border-border flex-wrap h-auto gap-1 p-1.5 w-full justify-start">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3"><TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /><span className="hidden xs:inline">Overview</span><span className="xs:hidden">Stats</span></TabsTrigger>
            <TabsTrigger value="clients" className="text-xs sm:text-sm px-2 sm:px-3"><Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />Clients</TabsTrigger>
            <TabsTrigger value="checkins" className="text-xs sm:text-sm px-2 sm:px-3 relative">
              <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Check-Ins</span><span className="sm:hidden">Review</span>
              {pendingCheckIns > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {pendingCheckIns > 9 ? "9+" : pendingCheckIns}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="coaching" className="text-xs sm:text-sm px-2 sm:px-3"><Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-purple-400" /><span className="hidden sm:inline">Free World</span><span className="sm:hidden">VIP</span></TabsTrigger>
            <TabsTrigger value="leads" className="text-xs sm:text-sm px-2 sm:px-3"><MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />Leads</TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm px-2 sm:px-3"><Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /><span className="hidden sm:inline">Products</span><span className="sm:hidden">Shop</span></TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm px-2 sm:px-3"><ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />Orders</TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm px-2 sm:px-3"><BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Revenue Analytics */}
            <RevenueAnalytics />

            {/* Top Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-charcoal border-border hover-lift"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Clients</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-primary">{clientsLoading ? "..." : clientAnalytics?.totalClients || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border hover-lift"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Subscriptions</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-success">{clientsLoading ? "..." : clientAnalytics?.activeClients || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border hover-lift"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Leads</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-foreground">{leadsLoading ? "..." : leadAnalytics?.totalLeads || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border hover-lift"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Leads Today</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-foreground">{leadsLoading ? "..." : leadAnalytics?.leadsToday || 0}</div></CardContent></Card>
            </div>

            {/* Quick Actions */}
            <AdminQuickActions 
              onNavigate={setActiveTab} 
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
                  <div className="text-4xl font-bold text-blue-400">{clientsLoading ? "..." : clientAnalytics?.clientsByPlan.membership || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">active members</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary">General Population</CardTitle>
                  <p className="text-xs text-muted-foreground">12-Week Program</p>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">{clientsLoading ? "..." : clientAnalytics?.clientsByPlan.transformation || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">active members</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-400">Free World</CardTitle>
                  <p className="text-xs text-muted-foreground">1:1 Coaching</p>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-400">{clientsLoading ? "..." : clientAnalytics?.clientsByPlan.coaching || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">active members</p>
                </CardContent>
              </Card>
            </div>

            {/* Client Health Alerts */}
            <ClientHealthAlertsPanel />

            {/* Additional Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Intake Completed</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-foreground">{clientsLoading ? "..." : clientAnalytics?.intakeCompleted || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expired</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-destructive">{clientsLoading ? "..." : clientAnalytics?.expiredClients || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cancelled</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-yellow-400">{clientsLoading ? "..." : clientAnalytics?.cancelledClients || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Conversion Rate</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-primary">{leadsLoading || !leadAnalytics?.totalLeads ? "..." : `${Math.round(((leadAnalytics?.conversions || 0) / leadAnalytics.totalLeads) * 100)}%`}</div></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-charcoal border-border" />
              </div>
              <div className="flex gap-2 sm:gap-4">
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="flex-1 sm:w-[130px] bg-charcoal border-border text-xs sm:text-sm">
                    <SelectValue placeholder="All Plans" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="transformation">12-Week</SelectItem>
                    <SelectItem value="membership">Monthly</SelectItem>
                    <SelectItem value="coaching">Coaching</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1 sm:w-[130px] bg-charcoal border-border text-xs sm:text-sm">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            <ClientBulkActions
              clients={clientAnalytics?.clients || []}
              selectedIds={selectedClientIds}
              onSelectAll={() => setSelectedClientIds(new Set(clientAnalytics?.clients.map(c => c.id) || []))}
              onDeselectAll={() => setSelectedClientIds(new Set())}
              onRefresh={() => {
                refetchClients();
                setSelectedClientIds(new Set());
              }}
            />

            {clientsLoading ? (
              <DashboardSkeleton variant="table" count={6} />
            ) : clientAnalytics?.clients.length === 0 ? (
              <EmptyState
                type="generic"
                title="No clients found"
                description="No clients match your current filters. Try adjusting your search or filter criteria."
                actionLabel="Clear Filters"
                onAction={() => {
                  setSearchQuery("");
                  setPlanFilter("all");
                  setStatusFilter("all");
                }}
              />
            ) : (
              <div className="bg-charcoal rounded-lg border border-border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="w-10 text-xs sm:text-sm">
                        <Checkbox
                          checked={selectedClientIds.size === clientAnalytics?.clients.length && clientAnalytics.clients.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedClientIds(new Set(clientAnalytics?.clients.map(c => c.id) || []));
                            } else {
                              setSelectedClientIds(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">Name</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Email</TableHead>
                      <TableHead className="text-xs sm:text-sm">Plan</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientAnalytics?.clients.map((client) => (
                      <TableRow 
                        key={client.id} 
                        className={`border-border cursor-pointer hover:bg-muted/50 active:bg-muted/70 transition-colors ${
                          selectedClientIds.has(client.id) ? "bg-primary/10" : ""
                        }`}
                      >
                        <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedClientIds.has(client.id)}
                            onCheckedChange={(checked) => {
                              const newSet = new Set(selectedClientIds);
                              if (checked) {
                                newSet.add(client.id);
                              } else {
                                newSet.delete(client.id);
                              }
                              setSelectedClientIds(newSet);
                            }}
                          />
                        </TableCell>
                        <TableCell 
                          className="font-medium text-xs sm:text-sm"
                          onClick={() => { setSelectedClient(client); setDetailPanelOpen(true); }}
                        >
                          <div>
                            <span className="block">{client.first_name || client.last_name ? `${client.first_name || ""} ${client.last_name || ""}`.trim() : "—"}</span>
                            <span className="text-muted-foreground text-xs sm:hidden">{client.email}</span>
                          </div>
                        </TableCell>
                        <TableCell 
                          className="text-muted-foreground text-xs sm:text-sm hidden sm:table-cell"
                          onClick={() => { setSelectedClient(client); setDetailPanelOpen(true); }}
                        >
                          {client.email}
                        </TableCell>
                        <TableCell onClick={() => { setSelectedClient(client); setDetailPanelOpen(true); }}>
                          {client.activeSubscription ? getPlanBadge(client.activeSubscription.plan_type) : <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell onClick={() => { setSelectedClient(client); setDetailPanelOpen(true); }}>
                          {client.activeSubscription ? getStatusBadge(client.activeSubscription.status) : getStatusBadge("none")}
                        </TableCell>
                        <TableCell 
                          className="text-muted-foreground text-xs sm:text-sm hidden md:table-cell"
                          onClick={() => { setSelectedClient(client); setDetailPanelOpen(true); }}
                        >
                          {format(new Date(client.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="checkins">
            <CheckInReviewManager />
          </TabsContent>

          <TabsContent value="coaching">
            <CoachingCommandCenter />
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Leads</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-primary">{leadsLoading ? "..." : leadAnalytics?.totalLeads || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Messages</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-foreground">{leadsLoading ? "..." : leadAnalytics?.avgMessageCount?.toFixed(1) || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Conversions</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-400">{leadsLoading ? "..." : leadAnalytics?.conversions || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-foreground">{leadsLoading ? "..." : leadAnalytics?.leadsToday || 0}</div></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="products"><ProductManager /></TabsContent>

          <TabsContent value="orders"><OrdersManager /></TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Sidebar Navigation for Content */}
              <ContentNavigation 
                activeSection={contentSection} 
                onSelectSection={setContentSection}
              />
              
              {/* Content Area */}
              <div className="flex-1 min-w-0">
                {contentSection === "program" && <ProgramBuilder />}
                {contentSection === "workouts" && <WorkoutContentManager />}
                {contentSection === "faith" && <FaithLessonsManager />}
                {contentSection === "nutrition" && <NutritionManager />}
                {contentSection === "mealplans" && <MealPlanManager />}
                {contentSection === "meal-analytics" && <MealAnalyticsPanel />}
                {contentSection === "discipline" && <DisciplineManager />}
                {contentSection === "skills" && <SkillLessonsManager />}
                {contentSection === "welcome-videos" && <WelcomeVideosManager />}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <ClientDetailPanel client={selectedClient} open={detailPanelOpen} onClose={() => setDetailPanelOpen(false)} onUpdate={() => { setDetailPanelOpen(false); }} />
    </div>
  );
}