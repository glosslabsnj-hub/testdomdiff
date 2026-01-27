import { useState } from "react";
import {
  DollarSign,
  Users,
  AlertTriangle,
  MessageSquare,
  Zap,
  ChevronDown,
  ArrowRight,
  Crown,
  Flame,
  Instagram,
  Video,
  FileText,
  UserCheck,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AdminSection } from "@/components/admin/AdminSidebar";
import RevenueAnalytics from "@/components/admin/RevenueAnalytics";
import AdminQuickActions from "@/components/admin/AdminQuickActions";
import ClientHealthAlertsPanel from "@/components/admin/ClientHealthAlertsPanel";
import type { useClientAnalytics } from "@/hooks/useClientAnalytics";
import type { useChatLeadAnalytics } from "@/hooks/useChatLeadAnalytics";
import { useContentEngine } from "@/hooks/useContentEngine";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface CollapsibleSectionProps {
  icon: React.ElementType;
  title: string;
  summary: React.ReactNode;
  iconColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  icon: Icon,
  title,
  summary,
  iconColor = "text-primary",
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-charcoal border-border overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center", iconColor)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">{title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{summary}</p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface CommandCenterCollapsibleProps {
  clientAnalytics: ReturnType<typeof useClientAnalytics>["analytics"];
  clientsLoading: boolean;
  leadAnalytics: ReturnType<typeof useChatLeadAnalytics>["analytics"];
  leadsLoading: boolean;
  pendingCheckIns: number;
  onNavigate: (section: AdminSection) => void;
}

export default function CommandCenterCollapsible({
  clientAnalytics,
  clientsLoading,
  leadAnalytics,
  leadsLoading,
  pendingCheckIns,
  onNavigate,
}: CommandCenterCollapsibleProps) {
  // Calculate summary values
  const totalClients = clientAnalytics?.totalClients || 0;
  const activeClients = clientAnalytics?.activeClients || 0;
  const solitaryCount = clientAnalytics?.clientsByPlan.membership || 0;
  const genPopCount = clientAnalytics?.clientsByPlan.transformation || 0;
  const freeWorldCount = clientAnalytics?.clientsByPlan.coaching || 0;
  const totalLeads = leadAnalytics?.totalLeads || 0;
  const conversions = leadAnalytics?.conversions || 0;
  const conversionRate = totalLeads > 0 ? Math.min(100, Math.round((conversions / totalLeads) * 100)) : 0;

  // Calculate MRR estimate
  const mrr = (solitaryCount * 49.99) + (genPopCount * 126.66) + (freeWorldCount * 999.99);

  // Fetch fresh content ideas for Social Media panel
  const { posts: freshContent } = useContentEngine({ status: "fresh" });

  // Fetch Free World clients for quick access
  const { data: coachingClients } = useQuery({
    queryKey: ["coaching-clients-quick"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, avatar_url")
        .not("user_id", "is", null)
        .limit(5);
      
      // Filter to only coaching clients (we'd need subscription data)
      return data || [];
    },
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-foreground">Command Center</h2>
        <p className="text-sm text-muted-foreground">
          Your business at a glance. Click any section to expand.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Main Analytics (2/3 width) */}
        <div className="xl:col-span-2 space-y-4">
          {/* Revenue Overview */}
          <CollapsibleSection
            icon={DollarSign}
            title="Revenue Overview"
            iconColor="text-green-400"
            summary={
              clientsLoading ? (
                "Loading..."
              ) : (
                <>Est. MRR: <span className="text-green-400 font-medium">${mrr.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span> • {activeClients} Active Clients</>
              )
            }
          >
            <div className="space-y-4">
              <RevenueAnalytics />
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => onNavigate("payments")}
              >
                View Payments & Revenue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CollapsibleSection>

          {/* Clients by Tier */}
          <CollapsibleSection
            icon={Users}
            title="Clients by Tier"
            iconColor="text-blue-400"
            summary={
              clientsLoading ? (
                "Loading..."
              ) : (
                <>
                  Solitary: <span className="text-blue-400 font-medium">{solitaryCount}</span> • 
                  Gen Pop: <span className="text-primary font-medium"> {genPopCount}</span> • 
                  Free World: <span className="text-purple-400 font-medium"> {freeWorldCount}</span>
                </>
              )
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30 cursor-pointer hover-lift"
                  onClick={() => onNavigate("users")}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-400">Solitary Confinement</CardTitle>
                    <p className="text-xs text-muted-foreground">Monthly Membership</p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-400">
                      {clientsLoading ? "..." : solitaryCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">active members</p>
                  </CardContent>
                </Card>
                <Card 
                  className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 cursor-pointer hover-lift"
                  onClick={() => onNavigate("users")}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-primary">General Population</CardTitle>
                    <p className="text-xs text-muted-foreground">12-Week Program</p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary">
                      {clientsLoading ? "..." : genPopCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">active members</p>
                  </CardContent>
                </Card>
                <Card 
                  className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30 cursor-pointer hover-lift"
                  onClick={() => onNavigate("freeworld")}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-purple-400">Free World</CardTitle>
                    <p className="text-xs text-muted-foreground">1:1 Coaching</p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-purple-400">
                      {clientsLoading ? "..." : freeWorldCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">active members</p>
                  </CardContent>
                </Card>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => onNavigate("users")}
              >
                View All Users
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CollapsibleSection>

          {/* Health Alerts */}
          <CollapsibleSection
            icon={AlertTriangle}
            title="Health Alerts"
            iconColor="text-amber-400"
            summary={
              <>
                {pendingCheckIns > 0 ? (
                  <><span className="text-amber-400 font-medium">{pendingCheckIns}</span> Pending Check-Ins</>
                ) : (
                  "All clients on track"
                )}
              </>
            }
          >
            <div className="space-y-4">
              <ClientHealthAlertsPanel />
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => onNavigate("check-ins")}
              >
                View All Check-Ins
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CollapsibleSection>

          {/* Lead Pipeline */}
          <CollapsibleSection
            icon={MessageSquare}
            title="Lead Pipeline"
            iconColor="text-cyan-400"
            summary={
              leadsLoading ? (
                "Loading..."
              ) : (
                <>
                  <span className="text-cyan-400 font-medium">{totalLeads}</span> Total Leads • 
                  <span className="text-green-400 font-medium"> {conversionRate}%</span> Conversion Rate
                </>
              )
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-muted/30 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Total Leads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {leadsLoading ? "..." : totalLeads}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Avg Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">
                      {leadsLoading ? "..." : leadAnalytics?.avgMessageCount?.toFixed(1) || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Conversions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">
                      {leadsLoading ? "..." : conversions}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {leadsLoading ? "..." : `${conversionRate}%`}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => onNavigate("analytics")}
              >
                View Full Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CollapsibleSection>

          {/* Quick Actions */}
          <CollapsibleSection
            icon={Zap}
            title="Quick Actions"
            iconColor="text-primary"
            summary="Navigation shortcuts & notification triggers"
          >
            <AdminQuickActions
              onNavigate={(tab) => {
                if (tab === "clients") onNavigate("users");
                else if (tab === "checkins") onNavigate("check-ins");
                else if (tab === "coaching") onNavigate("freeworld");
                else if (tab === "content") onNavigate("content");
                else if (tab === "commissary") onNavigate("commissary");
              }}
              pendingCheckIns={pendingCheckIns}
            />
          </CollapsibleSection>
        </div>

        {/* Right Column - Social Media & Free World Quick Access (1/3 width) */}
        <div className="space-y-4">
          <Tabs defaultValue="social" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-charcoal border border-border">
              <TabsTrigger 
                value="social" 
                className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 gap-1.5"
              >
                <Flame className="h-4 w-4" />
                <span className="hidden sm:inline">Social</span>
              </TabsTrigger>
              <TabsTrigger 
                value="freeworld" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 gap-1.5"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Free World</span>
              </TabsTrigger>
            </TabsList>

            {/* Social Media Tab */}
            <TabsContent value="social" className="mt-4 space-y-4">
              <Card className="bg-charcoal border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-400" />
                      Content Engine
                    </CardTitle>
                    <Badge variant="outline" className="text-orange-400 border-orange-500/30">
                      {freshContent?.length || 0} Fresh
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your daily content playbook
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {freshContent?.length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Fresh Ideas</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {freshContent?.filter(p => p.mode === "done_for_you").length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Ready Scripts</p>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 h-10"
                      onClick={() => onNavigate("content-engine")}
                    >
                      <Video className="h-4 w-4 text-orange-400" />
                      Generate New Ideas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 h-10"
                      onClick={() => onNavigate("content-engine")}
                    >
                      <FileText className="h-4 w-4 text-orange-400" />
                      View Content Library
                    </Button>
                  </div>

                  {/* Recent Fresh Content */}
                  {freshContent && freshContent.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Latest Ideas</p>
                      {freshContent.slice(0, 3).map((post) => (
                        <div 
                          key={post.id} 
                          className="p-2 rounded-lg bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                          onClick={() => onNavigate("content-engine")}
                        >
                          <p className="text-sm font-medium text-foreground line-clamp-1">{post.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs h-5">
                              {post.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {post.mode === "done_for_you" ? "Script" : "Framework"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-orange-400 hover:text-orange-300"
                    onClick={() => onNavigate("content-engine")}
                  >
                    Open Content Engine
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Free World Tab */}
            <TabsContent value="freeworld" className="mt-4 space-y-4">
              <Card className="bg-charcoal border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-400" />
                      Coaching Hub
                    </CardTitle>
                    <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                      {freeWorldCount} Clients
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    1:1 VIP coaching management
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {freeWorldCount}
                      </div>
                      <p className="text-xs text-muted-foreground">Active Clients</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        ${(freeWorldCount * 999.99).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                      <p className="text-xs text-muted-foreground">Monthly Rev</p>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 h-10"
                      onClick={() => onNavigate("freeworld")}
                    >
                      <UserCheck className="h-4 w-4 text-purple-400" />
                      Manage Clients
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 h-10"
                      onClick={() => onNavigate("freeworld")}
                    >
                      <Calendar className="h-4 w-4 text-purple-400" />
                      View Sessions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 h-10"
                      onClick={() => onNavigate("freeworld")}
                    >
                      <MessageCircle className="h-4 w-4 text-purple-400" />
                      Check Messages
                    </Button>
                  </div>

                  {/* Coaching Actions */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 h-9"
                        onClick={() => onNavigate("freeworld")}
                      >
                        Program Library
                      </Button>
                      <Button
                        size="sm"
                        className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 h-9"
                        onClick={() => onNavigate("freeworld")}
                      >
                        Nutrition Library
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-purple-400 hover:text-purple-300"
                    onClick={() => onNavigate("freeworld")}
                  >
                    Open Coaching Hub
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
