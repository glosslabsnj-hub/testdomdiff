import { useState } from "react";
import { format } from "date-fns";
import { 
  Users, 
  Search, 
  Loader2, 
  MessageSquare, 
  Calendar, 
  Crown,
  Phone,
  Mail,
  Target
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useClientAnalytics, type ClientWithSubscription } from "@/hooks/useClientAnalytics";
import ClientDetailPanel from "@/components/admin/ClientDetailPanel";

export default function CoachingClientsManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const { analytics, loading, error } = useClientAnalytics({
    planType: "coaching",
    status: "active",
    search: searchQuery,
  });

  const [selectedClient, setSelectedClient] = useState<ClientWithSubscription | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  const coachingClients = analytics?.clients || [];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-400 flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Free World Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-400">
              {loading ? "..." : coachingClients.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">active coaching</p>
          </CardContent>
        </Card>
        
        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ${loading ? "..." : (coachingClients.length * 999.99).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">from coaching</p>
          </CardContent>
        </Card>

        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {loading ? "..." : "3.2"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">months retained</p>
          </CardContent>
        </Card>

        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              {loading ? "..." : Math.min(coachingClients.length, 2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">check-ins due</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search coaching clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-charcoal border-border"
        />
      </div>

      {/* Client Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : coachingClients.length === 0 ? (
        <div className="text-center py-12 bg-charcoal rounded-lg border border-purple-500/30">
          <Crown className="h-12 w-12 mx-auto text-purple-400 mb-4" />
          <p className="text-muted-foreground mb-2">No Free World clients yet</p>
          <p className="text-sm text-muted-foreground">1:1 coaching clients will appear here</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coachingClients.map((client) => {
            const fullName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";
            const initials = fullName.slice(0, 2).toUpperCase();
            const startDate = client.activeSubscription?.started_at 
              ? format(new Date(client.activeSubscription.started_at), "MMM d, yyyy")
              : "—";

            return (
              <Card 
                key={client.id}
                className="bg-charcoal border-purple-500/30 hover:border-purple-500/50 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedClient(client);
                  setDetailPanelOpen(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={client.avatar_url || undefined} />
                      <AvatarFallback className="bg-purple-500/20 text-purple-400">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{fullName}</h3>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                          Free World
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>Started {startDate}</span>
                        </div>
                        {client.goal && (
                          <div className="flex items-center gap-1.5">
                            <Target className="w-3 h-3" />
                            <span className="truncate">{client.goal}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to DMs
                        window.location.href = `/dashboard/messages?client=${client.user_id}`;
                      }}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                    <Button
                      variant="goldOutline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setDetailPanelOpen(true);
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ClientDetailPanel
        client={selectedClient}
        open={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        onUpdate={() => setDetailPanelOpen(false)}
      />
    </div>
  );
}
