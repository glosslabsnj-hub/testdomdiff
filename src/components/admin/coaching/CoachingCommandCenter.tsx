import { useState } from "react";
import { Crown, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100vh-280px)] min-h-[600px]">
      {/* Left Panel - Client List: full width on mobile, hidden when client selected on mobile */}
      <div className={`w-full md:w-80 flex-shrink-0 ${selectedClient ? "hidden md:block" : "block"}`}>
        <CoachingClientList
          clients={coachingClients}
          selectedClient={selectedClient}
          onSelectClient={setSelectedClient}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
        />
      </div>

      {/* Right Panel - Client Details: full width on mobile, with back button */}
      <div className={`flex-1 min-w-0 ${!selectedClient ? "hidden md:block" : "block"}`}>
        {selectedClient ? (
          <div className="h-full flex flex-col">
            {/* Mobile back button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden self-start mb-2 min-h-[44px]"
              onClick={() => setSelectedClient(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clients
            </Button>
            <div className="flex-1 min-h-0">
              <ClientProgressPanel
                client={selectedClient}
                onUpdate={() => {
                  refetch();
                }}
              />
            </div>
          </div>
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
