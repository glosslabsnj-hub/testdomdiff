import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Users, MessageSquare, TrendingUp, Package, Loader2, Search, BookOpen, ShoppingBag, Utensils, Dumbbell, Cross, Clock, Calendar, Briefcase, ChefHat, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useChatLeadAnalytics } from "@/hooks/useChatLeadAnalytics";
import { useClientAnalytics, type ClientWithSubscription } from "@/hooks/useClientAnalytics";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { analytics: leadAnalytics, isLoading: leadsLoading, error: leadsError } = useChatLeadAnalytics();
  
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { analytics: clientAnalytics, loading: clientsLoading, error: clientsError } = useClientAnalytics({
    planType: planFilter, status: statusFilter, search: searchQuery,
  });

  const [selectedClient, setSelectedClient] = useState<ClientWithSubscription | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-charcoal border border-border flex-wrap h-auto gap-1 p-1.5 w-full justify-start">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3"><TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /><span className="hidden xs:inline">Overview</span><span className="xs:hidden">Stats</span></TabsTrigger>
            <TabsTrigger value="clients" className="text-xs sm:text-sm px-2 sm:px-3"><Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />Clients</TabsTrigger>
            <TabsTrigger value="leads" className="text-xs sm:text-sm px-2 sm:px-3"><MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />Leads</TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm px-2 sm:px-3"><Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /><span className="hidden sm:inline">Products</span><span className="sm:hidden">Shop</span></TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm px-2 sm:px-3"><ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />Orders</TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm px-2 sm:px-3"><BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Clients</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-primary">{clientsLoading ? "..." : clientAnalytics?.totalClients || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Subscriptions</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-400">{clientsLoading ? "..." : clientAnalytics?.activeClients || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Leads</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-foreground">{leadsLoading ? "..." : leadAnalytics?.totalLeads || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Leads Today</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-foreground">{leadsLoading ? "..." : leadAnalytics?.leadsToday || 0}</div></CardContent></Card>
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
            {clientsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : clientAnalytics?.clients.length === 0 ? (
              <div className="text-center py-12 bg-charcoal rounded-lg border border-border">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No clients found</p>
              </div>
            ) : (
              <div className="bg-charcoal rounded-lg border border-border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
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
                        className="border-border cursor-pointer hover:bg-muted/50 active:bg-muted/70 transition-colors" 
                        onClick={() => { setSelectedClient(client); setDetailPanelOpen(true); }}
                      >
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <div>
                            <span className="block">{client.first_name || client.last_name ? `${client.first_name || ""} ${client.last_name || ""}`.trim() : "—"}</span>
                            <span className="text-muted-foreground text-xs sm:hidden">{client.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">{client.email}</TableCell>
                        <TableCell>{client.activeSubscription ? getPlanBadge(client.activeSubscription.plan_type) : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                        <TableCell>{client.activeSubscription ? getStatusBadge(client.activeSubscription.status) : getStatusBadge("none")}</TableCell>
                        <TableCell className="text-muted-foreground text-xs sm:text-sm hidden md:table-cell">{format(new Date(client.created_at), "MMM d, yyyy")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
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
            <Tabs defaultValue="workouts" className="space-y-4 sm:space-y-6">
              <TabsList className="bg-background border border-border flex-wrap h-auto gap-1 p-1 w-full justify-start">
                <TabsTrigger value="program" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3"><Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />12-Week Program</TabsTrigger>
                <TabsTrigger value="workouts" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3"><Dumbbell className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Templates</span><span className="sm:hidden">Gym</span></TabsTrigger>
                <TabsTrigger value="faith" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3"><Cross className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Faith</TabsTrigger>
                <TabsTrigger value="nutrition" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3"><Utensils className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Nutrition</span><span className="sm:hidden">Food</span></TabsTrigger>
                <TabsTrigger value="mealplans" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3"><ChefHat className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Meal Plans</span><span className="sm:hidden">Meals</span></TabsTrigger>
                <TabsTrigger value="discipline" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3"><Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Discipline</span><span className="sm:hidden">Daily</span></TabsTrigger>
                <TabsTrigger value="skills" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3"><Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Skills</TabsTrigger>
                <TabsTrigger value="meal-analytics" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3"><BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Meal Analytics</span><span className="sm:hidden">Stats</span></TabsTrigger>
              </TabsList>
              <TabsContent value="program"><ProgramBuilder /></TabsContent>
              <TabsContent value="workouts"><WorkoutContentManager /></TabsContent>
              <TabsContent value="faith"><FaithLessonsManager /></TabsContent>
              <TabsContent value="nutrition"><NutritionManager /></TabsContent>
              <TabsContent value="mealplans"><MealPlanManager /></TabsContent>
              <TabsContent value="discipline"><DisciplineManager /></TabsContent>
              <TabsContent value="skills"><SkillLessonsManager /></TabsContent>
              <TabsContent value="meal-analytics"><MealAnalyticsPanel /></TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <ClientDetailPanel client={selectedClient} open={detailPanelOpen} onClose={() => setDetailPanelOpen(false)} />
    </div>
  );
}