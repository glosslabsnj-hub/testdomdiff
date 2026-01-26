import { useState } from "react";
import { Crown, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CoachingClientList from "@/components/admin/coaching/CoachingClientList";
import ClientProgressPanel from "@/components/admin/coaching/ClientProgressPanel";
import EmptyState from "@/components/EmptyState";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { useClientAnalytics, type ClientWithSubscription } from "@/hooks/useClientAnalytics";

export default function FreeWorldHub() {
  const [selectedClient, setSelectedClient] = useState<ClientWithSubscription | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { analytics, loading, refetch } = useClientAnalytics({
    planType: "coaching",
    search: searchQuery,
  });

  const coachingClients = analytics?.clients || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Free World Coaching</h2>
            <p className="text-sm text-muted-foreground">
              Manage your premium 1:1 coaching clients
            </p>
          </div>
        </div>
        <Button variant="goldOutline" size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Split-Pane Layout */}
      {loading ? (
        <DashboardSkeleton variant="cards" count={3} />
      ) : coachingClients.length === 0 && !searchQuery ? (
        <EmptyState
          type="generic"
          title="No coaching clients yet"
          description="When you add coaching clients, they'll appear here for management."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-220px)] overflow-hidden">
          {/* Client Sidebar */}
          <div className="lg:col-span-3">
            <CoachingClientList
              clients={coachingClients}
              selectedClient={selectedClient}
              onSelectClient={setSelectedClient}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              loading={loading}
            />
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-9">
            {selectedClient ? (
              <ClientProgressPanel
                client={selectedClient}
                onUpdate={() => {
                  refetch();
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-charcoal rounded-lg border border-border">
                <div className="text-center py-12">
                  <Crown className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Select a Client
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Choose a client from the sidebar to view their details, program, and progress.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
