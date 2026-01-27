import { useState } from "react";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  ClipboardCheck,
  Target,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientAnalytics } from "@/hooks/useClientAnalytics";
import { useChatLeadAnalytics } from "@/hooks/useChatLeadAnalytics";
import { useAdminCheckIns } from "@/hooks/useAdminCheckIns";

export default function AnalyticsHub() {
  const [timeRange, setTimeRange] = useState("30d");
  const { analytics: clientAnalytics, loading: clientsLoading } = useClientAnalytics({});
  const { analytics: leadAnalytics, isLoading: leadsLoading } = useChatLeadAnalytics();
  const { checkIns } = useAdminCheckIns();

  // Calculate metrics
  const totalClients = clientAnalytics?.totalClients || 0;
  const activeClients = clientAnalytics?.activeClients || 0;
  const retentionRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;

  // Tier conversion (approximation)
  const tier1Count = clientAnalytics?.clientsByPlan.membership || 0;
  const tier2Count = clientAnalytics?.clientsByPlan.transformation || 0;
  const tier3Count = clientAnalytics?.clientsByPlan.coaching || 0;
  const totalTiered = tier1Count + tier2Count + tier3Count;
  const tier2Conversion = totalTiered > 0 ? Math.round(((tier2Count + tier3Count) / totalTiered) * 100) : 0;
  const tier3Conversion = totalTiered > 0 ? Math.round((tier3Count / totalTiered) * 100) : 0;

  // Check-in rate
  const totalCheckIns = checkIns.length;
  const reviewedCheckIns = checkIns.filter(c => c.coach_reviewed_at).length;
  const checkInReviewRate = totalCheckIns > 0 ? Math.round((reviewedCheckIns / totalCheckIns) * 100) : 0;

  // Lead conversion
  const totalLeads = leadAnalytics?.totalLeads || 0;
  const conversions = leadAnalytics?.conversions || 0;
  const leadConversionRate = totalLeads > 0 ? Math.round((conversions / totalLeads) * 100) : 0;

  const metricCards = [
    {
      title: "User Retention",
      question: "How many users stay active?",
      value: `${retentionRate}%`,
      subValue: `${activeClients} of ${totalClients} users`,
      trend: retentionRate >= 70 ? "up" : "down",
      color: retentionRate >= 70 ? "text-green-400" : "text-yellow-400",
    },
    {
      title: "Tier Conversion",
      question: "How many upgrade to higher tiers?",
      value: `${tier2Conversion}%`,
      subValue: `to Tier 2+`,
      trend: tier2Conversion >= 30 ? "up" : "neutral",
      color: "text-primary",
      secondaryValue: `${tier3Conversion}% to Tier 3`,
    },
    {
      title: "Lead Conversion",
      question: "How many leads become clients?",
      value: `${leadConversionRate}%`,
      subValue: `${conversions} of ${totalLeads} leads`,
      trend: leadConversionRate >= 10 ? "up" : "neutral",
      color: leadConversionRate >= 10 ? "text-green-400" : "text-yellow-400",
    },
    {
      title: "Check-In Review Rate",
      question: "Are check-ins being reviewed?",
      value: `${checkInReviewRate}%`,
      subValue: `${reviewedCheckIns} of ${totalCheckIns} reviewed`,
      trend: checkInReviewRate >= 80 ? "up" : "down",
      color: checkInReviewRate >= 80 ? "text-green-400" : "text-yellow-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Understand how your business is performing. Each metric answers a specific question.
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList className="bg-charcoal border border-border">
            <TabsTrigger value="7d" className="text-xs">7 days</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs">30 days</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs">90 days</TabsTrigger>
            <TabsTrigger value="all" className="text-xs">All time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metricCards.map((metric) => (
          <Card key={metric.title} className="bg-charcoal border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">
                  {metric.title}
                </CardTitle>
                {metric.trend === "up" && (
                  <ArrowUpRight className="h-4 w-4 text-green-400" />
                )}
                {metric.trend === "down" && (
                  <ArrowDownRight className="h-4 w-4 text-yellow-400" />
                )}
              </div>
              <CardDescription className="text-xs">
                {metric.question}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metric.color}`}>
                {clientsLoading || leadsLoading ? "..." : metric.value}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{metric.subValue}</p>
              {metric.secondaryValue && (
                <p className="text-xs text-muted-foreground">{metric.secondaryValue}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tier Distribution */}
      <Card className="bg-charcoal border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Distribution by Tier
          </CardTitle>
          <CardDescription>
            How are users distributed across subscription tiers?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-blue-400">Tier 1: Solitary Confinement</span>
                <span className="text-sm font-medium">{tier1Count} users</span>
              </div>
              <Progress 
                value={totalTiered > 0 ? (tier1Count / totalTiered) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-primary">Tier 2: General Population</span>
                <span className="text-sm font-medium">{tier2Count} users</span>
              </div>
              <Progress 
                value={totalTiered > 0 ? (tier2Count / totalTiered) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-purple-400">Tier 3: Free World</span>
                <span className="text-sm font-medium">{tier3Count} users</span>
              </div>
              <Progress 
                value={totalTiered > 0 ? (tier3Count / totalTiered) * 100 : 0} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Avg. Messages per Lead
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leadsLoading ? "..." : (leadAnalytics?.avgMessageCount?.toFixed(1) || "0")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Higher engagement = more likely to convert
            </p>
          </CardContent>
        </Card>

        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Pending Check-Ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checkIns.filter(c => !c.coach_reviewed_at).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Top Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {leadsLoading ? "..." : (
                leadAnalytics?.topGoals && Object.keys(leadAnalytics.topGoals).length > 0
                  ? Object.entries(leadAnalytics.topGoals).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
                  : "—"
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Most common client goal
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
