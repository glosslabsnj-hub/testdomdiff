import { useState } from "react";
import { Crown, UserPlus, Dumbbell, Utensils, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CoachingClientList from "@/components/admin/coaching/CoachingClientList";
import ClientProgressPanel from "@/components/admin/coaching/ClientProgressPanel";
import FreeWorldWorkoutTemplates from "@/components/admin/coaching/FreeWorldWorkoutTemplates";
import FreeWorldNutritionTemplates from "@/components/admin/coaching/FreeWorldNutritionTemplates";
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
        {activeTab === "clients" && (
          <Button variant="goldOutline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        )}
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="flex-none w-fit bg-charcoal border border-border">
          <TabsTrigger value="clients" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Users className="w-4 h-4 mr-2" />
            Clients
          </TabsTrigger>
        <TabsTrigger value="workouts" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Dumbbell className="w-4 h-4 mr-2" />
            Workout Templates
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Utensils className="w-4 h-4 mr-2" />
            Nutrition Templates
          </TabsTrigger>
        </TabsList>

        {/* Clients Tab */}
        <TabsContent value="clients" className="flex-1 min-h-0 overflow-hidden mt-4">
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
        </TabsContent>

        {/* Workout Templates Tab */}
        <TabsContent value="workouts" className="flex-1 min-h-0 overflow-hidden mt-4">
          <FreeWorldWorkoutTemplates selectedClient={selectedClient} />
        </TabsContent>

        {/* Nutrition Templates Tab */}
        <TabsContent value="nutrition" className="flex-1 min-h-0 overflow-hidden mt-4">
          <FreeWorldNutritionTemplates selectedClient={selectedClient} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
