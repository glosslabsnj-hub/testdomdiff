import { useState } from "react";
import { Crown, UserPlus, Users, Dumbbell, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CoachingClientList from "@/components/admin/coaching/CoachingClientList";
import ClientProgressPanel from "@/components/admin/coaching/ClientProgressPanel";
import ProgramLibrary from "@/components/admin/coaching/ProgramLibrary";
import NutritionLibrary from "@/components/admin/coaching/NutritionLibrary";
import EmptyState from "@/components/EmptyState";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { useClientAnalytics, type ClientWithSubscription } from "@/hooks/useClientAnalytics";

export default function FreeWorldHub() {
  const [selectedClient, setSelectedClient] = useState<ClientWithSubscription | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("clients");

  const { analytics, loading, refetch } = useClientAnalytics({
    planType: "coaching",
    search: searchQuery,
  });

  const coachingClients = analytics?.clients || [];

  // Navigate to library tabs from client Templates tab
  const handleBrowseWorkouts = () => setActiveTab("programs");
  const handleBrowseNutrition = () => setActiveTab("nutrition");

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between flex-none py-4">
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

      {/* Top-Level Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
        <TabsList className="w-full max-w-lg justify-start bg-charcoal border border-border rounded-lg p-1 flex-none">
          <TabsTrigger
            value="clients"
            className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <Users className="w-4 h-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger
            value="programs"
            className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            <Dumbbell className="w-4 h-4" />
            Program Library
          </TabsTrigger>
          <TabsTrigger
            value="nutrition"
            className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
          >
            <Utensils className="w-4 h-4" />
            Nutrition Library
          </TabsTrigger>
        </TabsList>

        {/* Clients Tab */}
        <TabsContent value="clients" className="flex-1 min-h-0 mt-4 overflow-hidden">
          {loading ? (
            <div className="h-full">
              <DashboardSkeleton variant="cards" count={3} />
            </div>
          ) : coachingClients.length === 0 && !searchQuery ? (
            <div className="h-full flex items-center justify-center">
              <EmptyState
                type="generic"
                title="No coaching clients yet"
                description="When you add coaching clients, they'll appear here for management."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full overflow-hidden">
              {/* Client Sidebar */}
              <div className="lg:col-span-3 h-full overflow-y-auto">
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
              <div className="lg:col-span-9 h-full overflow-hidden">
                {selectedClient ? (
                  <ClientProgressPanel
                    client={selectedClient}
                    onUpdate={() => {
                      refetch();
                    }}
                    onBrowseWorkouts={handleBrowseWorkouts}
                    onBrowseNutrition={handleBrowseNutrition}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-charcoal rounded-lg border border-border">
                    <div className="text-center py-12">
                      <Crown className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Select a Client
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Choose a client from the sidebar to view their details, program, and template recommendations.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Program Library Tab */}
        <TabsContent value="programs" className="flex-1 min-h-0 mt-4 overflow-hidden">
          <ProgramLibrary />
        </TabsContent>

        {/* Nutrition Library Tab */}
        <TabsContent value="nutrition" className="flex-1 min-h-0 mt-4 overflow-hidden">
          <NutritionLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
