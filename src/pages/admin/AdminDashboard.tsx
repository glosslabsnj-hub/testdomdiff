import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Users, MessageSquare, TrendingUp, Package, Loader2, Search, BookOpen } from "lucide-react";
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
import WorkoutContentManager from "@/components/admin/WorkoutContentManager";
import FaithLessonsManager from "@/components/admin/FaithLessonsManager";
import ProgramWeeksManager from "@/components/admin/ProgramWeeksManager";
import DisciplineManager from "@/components/admin/DisciplineManager";
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
          <TabsList className="bg-charcoal border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview"><TrendingUp className="h-4 w-4 mr-2" />Overview</TabsTrigger>
            <TabsTrigger value="clients"><Users className="h-4 w-4 mr-2" />Clients</TabsTrigger>
            <TabsTrigger value="leads"><MessageSquare className="h-4 w-4 mr-2" />Leads</TabsTrigger>
            <TabsTrigger value="products"><Package className="h-4 w-4 mr-2" />Products</TabsTrigger>
            <TabsTrigger value="content"><BookOpen className="h-4 w-4 mr-2" />Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Clients</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-primary">{clientsLoading ? "..." : clientAnalytics?.totalClients || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Subscriptions</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-400">{clientsLoading ? "..." : clientAnalytics?.activeClients || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Leads</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-foreground">{leadsLoading ? "..." : leadAnalytics?.totalLeads || 0}</div></CardContent></Card>
              <Card className="bg-charcoal border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Leads Today</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-foreground">{leadsLoading ? "..." : leadAnalytics?.leadsToday || 0}</div></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-charcoal border-border" /></div>
              <Select value={planFilter} onValueChange={setPlanFilter}><SelectTrigger className="w-full sm:w-[150px] bg-charcoal border-border"><SelectValue placeholder="All Plans" /></SelectTrigger><SelectContent><SelectItem value="all">All Plans</SelectItem><SelectItem value="transformation">12-Week</SelectItem><SelectItem value="membership">Monthly</SelectItem><SelectItem value="coaching">Coaching</SelectItem></SelectContent></Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-[150px] bg-charcoal border-border"><SelectValue placeholder="All Statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem><SelectItem value="expired">Expired</SelectItem></SelectContent></Select>
            </div>
            {clientsLoading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
              <div className="bg-charcoal rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="border-border"><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {clientAnalytics?.clients.map((client) => (
                      <TableRow key={client.id} className="border-border cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedClient(client); setDetailPanelOpen(true); }}>
                        <TableCell className="font-medium">{client.first_name || client.last_name ? `${client.first_name || ""} ${client.last_name || ""}`.trim() : "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{client.email}</TableCell>
                        <TableCell>{client.activeSubscription ? getPlanBadge(client.activeSubscription.plan_type) : "—"}</TableCell>
                        <TableCell>{client.activeSubscription ? getStatusBadge(client.activeSubscription.status) : getStatusBadge("none")}</TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(client.created_at), "MMM d, yyyy")}</TableCell>
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

          <TabsContent value="content" className="space-y-8">
            <Tabs defaultValue="workouts" className="space-y-6">
              <TabsList className="bg-background border border-border">
                <TabsTrigger value="workouts">Workouts</TabsTrigger>
                <TabsTrigger value="program">12-Week Program</TabsTrigger>
                <TabsTrigger value="faith">Faith Lessons</TabsTrigger>
                <TabsTrigger value="discipline">Discipline</TabsTrigger>
              </TabsList>
              <TabsContent value="workouts"><WorkoutContentManager /></TabsContent>
              <TabsContent value="program"><ProgramWeeksManager /></TabsContent>
              <TabsContent value="faith"><FaithLessonsManager /></TabsContent>
              <TabsContent value="discipline"><DisciplineManager /></TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <ClientDetailPanel client={selectedClient} open={detailPanelOpen} onClose={() => setDetailPanelOpen(false)} />
    </div>
  );
}