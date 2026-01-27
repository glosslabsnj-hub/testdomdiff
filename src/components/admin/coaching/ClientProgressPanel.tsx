import { useState } from "react";
import { format } from "date-fns";
import {
  Crown,
  MessageSquare,
  Calendar,
  Target,
  TrendingUp,
  Mail,
  Phone,
  Loader2,
  FileText,
  ClipboardList,
  Dumbbell,
  Utensils,
  Check,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";
import { useClientProgress } from "@/hooks/useClientProgress";
import ClientOverviewTab from "./ClientOverviewTab";
import ClientSessionsTab from "./ClientSessionsTab";
import ClientGoalsTab from "./ClientGoalsTab";
import ClientMessagesTab from "./ClientMessagesTab";
import ImprovedProgramTab from "./ImprovedProgramTab";
import ClientIntakeTab from "./ClientIntakeTab";
import ClientProgramsTab from "./ClientProgramsTab";

interface ClientProgressPanelProps {
  client: ClientWithSubscription;
  onUpdate: () => void;
  onBrowseWorkouts?: () => void;
  onBrowseNutrition?: () => void;
}

export default function ClientProgressPanel({ 
  client, 
  onUpdate,
  onBrowseWorkouts,
  onBrowseNutrition,
}: ClientProgressPanelProps) {
  const [activeTab, setActiveTab] = useState("programs");
  const { data: progress, loading } = useClientProgress(client.user_id);

  // Fetch assignment status for header badges
  const { data: workoutAssignment } = useQuery({
    queryKey: ["client-workout-assignment", client.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_template_assignments")
        .select("id, template:program_templates(name)")
        .eq("client_id", client.user_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: nutritionAssignment } = useQuery({
    queryKey: ["client-nutrition-assignment", client.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_nutrition_assignments")
        .select("id, template:meal_plan_templates(name)")
        .eq("client_id", client.user_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const fullName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";
  const initials = fullName.slice(0, 2).toUpperCase();
  const startDate = client.activeSubscription?.started_at
    ? format(new Date(client.activeSubscription.started_at), "MMMM d, yyyy")
    : "—";

  const hasWorkout = !!workoutAssignment?.template;
  const hasNutrition = !!nutritionAssignment?.template;

  return (
    <div className="h-full flex flex-col bg-charcoal rounded-lg border border-border overflow-hidden">
      {/* Client Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-purple-500/10 to-transparent flex-none">
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14">
            <AvatarImage src={client.avatar_url || undefined} />
            <AvatarFallback className="bg-purple-500/20 text-purple-400 text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold truncate">{fullName}</h2>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Crown className="w-3 h-3 mr-1" />
                Free World
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {client.email}
              </span>
              {client.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {client.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Started {startDate}
              </span>
            </div>

            {/* Assignment Status Badges */}
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={`text-xs ${
                  hasWorkout
                    ? "border-green-500/50 text-green-500 bg-green-500/10"
                    : "border-amber-500/50 text-amber-500 bg-amber-500/10"
                }`}
              >
                <Dumbbell className="w-3 h-3 mr-1" />
                {hasWorkout ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Training
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3 mr-1" />
                    No Training
                  </>
                )}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${
                  hasNutrition
                    ? "border-green-500/50 text-green-500 bg-green-500/10"
                    : "border-amber-500/50 text-amber-500 bg-amber-500/10"
                }`}
              >
                <Utensils className="w-3 h-3 mr-1" />
                {hasNutrition ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Nutrition
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3 mr-1" />
                    No Nutrition
                  </>
                )}
              </Badge>
            </div>
          </div>

          <Button variant="goldOutline" size="sm" className="flex-shrink-0">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0 overflow-x-auto flex-none">
          <TabsTrigger
            value="programs"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            <Target className="w-4 h-4 mr-2" />
            Programs
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-400 data-[state=active]:bg-transparent px-4 py-3"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="intake"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-400 data-[state=active]:bg-transparent px-4 py-3"
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Intake
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-400 data-[state=active]:bg-transparent px-4 py-3"
          >
            <FileText className="w-4 h-4 mr-2" />
            Program Details
          </TabsTrigger>
          <TabsTrigger
            value="sessions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-400 data-[state=active]:bg-transparent px-4 py-3"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Sessions
          </TabsTrigger>
          <TabsTrigger
            value="goals"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-400 data-[state=active]:bg-transparent px-4 py-3"
          >
            <Target className="w-4 h-4 mr-2" />
            Goals
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-400 data-[state=active]:bg-transparent px-4 py-3"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
          </TabsTrigger>
        </TabsList>

        {/* Tab Content - Flex scroll container */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="p-4 pb-28">
              <TabsContent value="programs" className="m-0">
                <ClientProgramsTab
                  client={client}
                  onTemplateAssigned={onUpdate}
                  onBrowseWorkouts={onBrowseWorkouts}
                  onBrowseNutrition={onBrowseNutrition}
                />
              </TabsContent>

              <TabsContent value="overview" className="m-0">
                <ClientOverviewTab client={client} progress={progress} />
              </TabsContent>

              <TabsContent value="intake" className="m-0">
                <ClientIntakeTab client={client} />
              </TabsContent>

              <TabsContent value="details" className="m-0">
                <ImprovedProgramTab clientId={client.user_id} client={client} />
              </TabsContent>

              <TabsContent value="sessions" className="m-0">
                <ClientSessionsTab clientId={client.user_id} />
              </TabsContent>

              <TabsContent value="goals" className="m-0">
                <ClientGoalsTab clientId={client.user_id} />
              </TabsContent>

              <TabsContent value="messages" className="m-0">
                <ClientMessagesTab clientId={client.user_id} />
              </TabsContent>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
