import { useState } from "react";
import { format } from "date-fns";
import { 
  FileText, 
  Search, 
  CheckCircle, 
  Clock, 
  Flag, 
  User,
  Target,
  Activity,
  Utensils,
  Cross,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientAnalytics, type ClientWithSubscription } from "@/hooks/useClientAnalytics";

interface IntakeSection {
  title: string;
  icon: React.ElementType;
  fields: { label: string; value: string | null }[];
}

export default function IntakeManager() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientWithSubscription | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  // Get Free World coaching clients who have completed intake
  const { analytics, loading, refetch } = useClientAnalytics({
    planType: "coaching",
    search: searchQuery,
  });

  const clients = analytics?.clients || [];

  // Filter clients based on intake status
  const filteredClients = clients.filter(client => {
    if (filter === "all") return true;
    // For now, all coaching clients are considered "completed" if they have profile data
    // In a real implementation, you'd track intake_reviewed status
    const hasIntake = client.first_name && client.goal;
    if (filter === "completed") return hasIntake;
    if (filter === "in-progress") return !hasIntake;
    return true;
  });

  const getIntakeSections = (client: ClientWithSubscription): IntakeSection[] => {
    return [
      {
        title: "Physical Stats",
        icon: Activity,
        fields: [
          { label: "Age", value: client.age?.toString() || null },
          { label: "Height", value: client.height || null },
          { label: "Weight", value: client.weight || null },
          { label: "Body Fat", value: client.body_fat_estimate || null },
          { label: "Activity Level", value: client.activity_level || null },
        ],
      },
      {
        title: "Goals",
        icon: Target,
        fields: [
          { label: "Primary Goal", value: client.goal || null },
          { label: "Goal Type", value: client.goal_type || null },
          { label: "Biggest Obstacle", value: client.biggest_obstacle || null },
          { label: "Motivation", value: client.motivation || null },
        ],
      },
      {
        title: "Injuries & Limitations",
        icon: AlertCircle,
        fields: [
          { label: "Injuries", value: client.injuries || "None reported" },
          { label: "Medical Conditions", value: client.medical_conditions || "None reported" },
        ],
      },
      {
        title: "Schedule & Equipment",
        icon: Clock,
        fields: [
          { label: "Training Days/Week", value: client.training_days_per_week?.toString() || null },
          { label: "Session Length", value: client.session_length_preference || null },
          { label: "Equipment", value: client.equipment || null },
          { label: "Training Style", value: client.training_style || null },
        ],
      },
      {
        title: "Nutrition",
        icon: Utensils,
        fields: [
          { label: "Dietary Restrictions", value: client.dietary_restrictions || "None" },
          { label: "Nutrition Style", value: client.nutrition_style || null },
          { label: "Meal Prep", value: client.meal_prep_preference || null },
          { label: "Food Dislikes", value: client.food_dislikes || null },
        ],
      },
      {
        title: "Faith",
        icon: Cross,
        fields: [
          { label: "Faith Commitment", value: client.faith_commitment ? "Yes - Committed believer" : "Not specified" },
        ],
      },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Intake & Forms</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review Free World coaching applications and intake data. Add notes and flag for follow-up.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-charcoal border-border"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px] bg-charcoal border-border">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Submissions</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Client List */}
        <div className="lg:col-span-4">
          <Card className="bg-charcoal border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Intake Submissions</CardTitle>
              <CardDescription>
                {filteredClients.length} submission{filteredClients.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {loading ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
                  ) : filteredClients.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No intake submissions found
                    </p>
                  ) : (
                    filteredClients.map((client) => {
                      const hasIntake = client.first_name && client.goal;
                      const isSelected = selectedClient?.id === client.id;
                      
                      return (
                        <button
                          key={client.id}
                          onClick={() => setSelectedClient(client)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            isSelected
                              ? "bg-purple-500/20 border-purple-500/50"
                              : "bg-muted/30 border-border hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">
                              {client.first_name || client.last_name
                                ? `${client.first_name || ""} ${client.last_name || ""}`.trim()
                                : client.email.split("@")[0]}
                            </span>
                            {hasIntake ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Joined {format(new Date(client.created_at), "MMM d, yyyy")}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Intake Detail */}
        <div className="lg:col-span-8">
          {selectedClient ? (
            <Card className="bg-charcoal border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedClient.first_name || selectedClient.last_name
                          ? `${selectedClient.first_name || ""} ${selectedClient.last_name || ""}`.trim()
                          : "Unknown"}
                      </CardTitle>
                      <CardDescription>{selectedClient.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Flag className="h-4 w-4 mr-2" />
                      Flag
                    </Button>
                    <Button variant="gold" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Reviewed
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[450px]">
                  <div className="space-y-4">
                    {getIntakeSections(selectedClient).map((section) => {
                      const Icon = section.icon;
                      const hasData = section.fields.some(f => f.value);
                      
                      return (
                        <Collapsible key={section.title} defaultOpen={hasData}>
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">{section.title}</span>
                              </div>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="p-3 space-y-2">
                              {section.fields.map((field) => (
                                <div key={field.label} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{field.label}</span>
                                  <span className={field.value ? "text-foreground" : "text-muted-foreground/50"}>
                                    {field.value || "Not provided"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}

                    {/* Admin Notes */}
                    <div className="pt-4 border-t border-border">
                      <h4 className="font-medium text-sm mb-2">Admin Notes</h4>
                      <Textarea
                        placeholder="Add private notes about this client's intake..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="bg-background border-border min-h-[100px]"
                      />
                      <Button variant="outline" size="sm" className="mt-2">
                        Save Notes
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-charcoal border-border h-full flex items-center justify-center min-h-[500px]">
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Select a Submission
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Choose a client from the list to view their intake details.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
