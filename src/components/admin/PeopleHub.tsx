import { useState } from "react";
import { format } from "date-fns";
import { Search, Users, ClipboardCheck, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import ClientDetailPanel from "@/components/admin/ClientDetailPanel";
import ClientBulkActions from "@/components/admin/ClientBulkActions";
import CheckInReviewManager from "@/components/admin/CheckInReviewManager";
import SupportInbox from "@/components/admin/SupportInbox";

import DashboardSkeleton from "@/components/DashboardSkeleton";
import EmptyState from "@/components/EmptyState";
import { useClientAnalytics, type ClientWithSubscription } from "@/hooks/useClientAnalytics";
import { useAdminCheckIns } from "@/hooks/useAdminCheckIns";

export default function PeopleHub() {
  const [subTab, setSubTab] = useState("all-clients");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientWithSubscription | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());

  const { analytics: clientAnalytics, loading: clientsLoading, refetch: refetchClients } = useClientAnalytics({
    planType: planFilter,
    status: statusFilter,
    search: searchQuery,
  });

  const { checkIns } = useAdminCheckIns();
  const pendingCheckIns = checkIns.filter(c => !c.coach_reviewed_at).length;

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
    <div className="space-y-4">
      {/* Sub-navigation for People hub */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="bg-charcoal border border-border h-auto gap-1 p-1">
          <TabsTrigger value="all-clients" className="text-xs sm:text-sm px-3">
            <Users className="h-4 w-4 mr-2" />
            All Clients
            <Badge variant="secondary" className="ml-2 text-xs">
              {clientAnalytics?.totalClients || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="check-ins" className="text-xs sm:text-sm px-3 relative">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Check-Ins
            {pendingCheckIns > 0 && (
              <Badge className="ml-2 bg-destructive text-destructive-foreground text-xs">
                {pendingCheckIns}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="support" className="text-xs sm:text-sm px-3">
            <MessageSquare className="h-4 w-4 mr-2" />
            Support
          </TabsTrigger>
        </TabsList>

        {/* All Clients View */}
        <TabsContent value="all-clients" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, email, or phone..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10 bg-charcoal border-border" 
              />
            </div>
            <div className="flex gap-2">
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[120px] bg-charcoal border-border text-xs sm:text-sm">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="transformation">12-Week</SelectItem>
                  <SelectItem value="membership">Monthly</SelectItem>
                  <SelectItem value="coaching">Coaching</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] bg-charcoal border-border text-xs sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
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

          {/* Client Table */}
          {clientsLoading ? (
            <DashboardSkeleton variant="table" count={6} />
          ) : clientAnalytics?.clients.length === 0 ? (
            <EmptyState
              type="generic"
              title="No clients found"
              description="No clients match your current filters."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery("");
                setPlanFilter("all");
                setStatusFilter("all");
              }}
            />
          ) : (
            <ScrollArea className="h-[calc(100vh-400px)] min-h-[400px]">
              <div className="bg-charcoal rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="w-10">
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
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientAnalytics?.clients.map((client) => (
                      <TableRow 
                        key={client.id} 
                        className={`border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedClientIds.has(client.id) ? "bg-primary/10" : ""
                        }`}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
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
                          className="font-medium"
                          onClick={() => { setSelectedClient(client); setDetailPanelOpen(true); }}
                        >
                          <div>
                            <span className="block">{client.first_name || client.last_name ? `${client.first_name || ""} ${client.last_name || ""}`.trim() : "—"}</span>
                            <span className="text-muted-foreground text-xs sm:hidden">{client.email}</span>
                          </div>
                        </TableCell>
                        <TableCell 
                          className="text-muted-foreground hidden sm:table-cell"
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
                          className="text-muted-foreground hidden md:table-cell"
                          onClick={() => { setSelectedClient(client); setDetailPanelOpen(true); }}
                        >
                          {format(new Date(client.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Check-Ins View */}
        <TabsContent value="check-ins" className="mt-4">
          <CheckInReviewManager />
        </TabsContent>


        {/* Support View */}
        <TabsContent value="support" className="mt-4">
          <SupportInbox />
        </TabsContent>
      </Tabs>

      {/* Client Detail Panel */}
      <ClientDetailPanel 
        client={selectedClient} 
        open={detailPanelOpen} 
        onClose={() => setDetailPanelOpen(false)} 
        onUpdate={() => { setDetailPanelOpen(false); refetchClients(); }} 
      />
    </div>
  );
}
