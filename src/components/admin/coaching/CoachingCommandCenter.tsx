import { useState } from "react";
import { Crown, Loader2 } from "lucide-react";
import { useClientAnalytics, type ClientWithSubscription } from "@/hooks/useClientAnalytics";
import CoachingClientList from "./CoachingClientList";
import ClientProgressPanel from "./ClientProgressPanel";

export default function CoachingCommandCenter() {
  const [selectedClient, setSelectedClient] = useState<ClientWithSubscription | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { analytics, loading, error, refetch } = useClientAnalytics({
    planType: "coaching",
    status: "active",
    search: searchQuery,
  });

  const coachingClients = analytics?.clients || [];

  if (loading && !analytics) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (coachingClients.length === 0 && !searchQuery) {
    return (
      <div className="text-center py-12 bg-charcoal rounded-lg border border-purple-500/30">
        <Crown className="h-12 w-12 mx-auto text-purple-400 mb-4" />
        <p className="text-muted-foreground mb-2">No Free World clients yet</p>
        <p className="text-sm text-muted-foreground">1:1 coaching clients will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[600px]">
      {/* Left Panel - Client List */}
      <div className="w-80 flex-shrink-0">
        <CoachingClientList
          clients={coachingClients}
          selectedClient={selectedClient}
          onSelectClient={setSelectedClient}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
        />
      </div>

      {/* Right Panel - Client Details */}
      <div className="flex-1 min-w-0">
        {selectedClient ? (
          <ClientProgressPanel
            client={selectedClient}
            onUpdate={() => {
              refetch();
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-charcoal rounded-lg border border-border">
            <div className="text-center">
              <Crown className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Select a client to view their case file</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
