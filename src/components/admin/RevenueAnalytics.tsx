import { useMemo, useState } from "react";
import { DollarSign, TrendingUp, Users, AlertCircle, ChevronDown, Calendar, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientAnalytics } from "@/hooks/useClientAnalytics";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Pricing assumptions
const PLAN_PRICES = {
  membership: 49.99,       // Monthly (Solitary)
  transformation: 379.99,  // One-time (spread over 3 months for MRR calc) (Gen Pop)
  coaching: 999.99,        // Monthly (Free World)
} as const;

const PLAN_DISPLAY_NAMES = {
  membership: "Solitary Confinement",
  transformation: "General Population",
  coaching: "Free World Coaching",
} as const;

const PLAN_COLORS = {
  membership: "bg-blue-500",
  transformation: "bg-primary",
  coaching: "bg-purple-500",
} as const;

export function RevenueAnalytics() {
  const { analytics, loading } = useClientAnalytics();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const revenueData = useMemo(() => {
    if (!analytics) return null;
    
    // Calculate MRR
    const membershipMRR = analytics.clientsByPlan.membership * PLAN_PRICES.membership;
    const transformationMRR = analytics.clientsByPlan.transformation * (PLAN_PRICES.transformation / 3);
    const coachingMRR = analytics.clientsByPlan.coaching * PLAN_PRICES.coaching;
    const totalMRR = membershipMRR + transformationMRR + coachingMRR;
    
    // Calculate retention rate (active / (active + expired + cancelled)) - clamped to 0-100
    const totalHistorical = analytics.totalClients;
    const retentionRate = totalHistorical > 0 
      ? Math.min(100, Math.max(0, Math.round((analytics.activeClients / totalHistorical) * 100)))
      : 0;
    
    // Clients expiring soon (transformation clients with <14 days remaining)
    const expiringClients = analytics.clients.filter(c => 
      c.activeSubscription?.plan_type === "transformation" &&
      c.daysRemaining !== null &&
      c.daysRemaining <= 14 &&
      c.daysRemaining > 0
    );

    // Per-plan breakdown
    const planBreakdown = [
      {
        key: "membership" as const,
        name: PLAN_DISPLAY_NAMES.membership,
        count: analytics.clientsByPlan.membership,
        pricePerMember: PLAN_PRICES.membership,
        monthlyRevenue: membershipMRR,
        color: PLAN_COLORS.membership,
      },
      {
        key: "transformation" as const,
        name: PLAN_DISPLAY_NAMES.transformation,
        count: analytics.clientsByPlan.transformation,
        pricePerMember: PLAN_PRICES.transformation / 3, // Monthly equivalent
        monthlyRevenue: transformationMRR,
        color: PLAN_COLORS.transformation,
      },
      {
        key: "coaching" as const,
        name: PLAN_DISPLAY_NAMES.coaching,
        count: analytics.clientsByPlan.coaching,
        pricePerMember: PLAN_PRICES.coaching,
        monthlyRevenue: coachingMRR,
        color: PLAN_COLORS.coaching,
      },
    ];

    // Calculate percentages
    const planBreakdownWithPercentage = planBreakdown.map(plan => ({
      ...plan,
      percentage: totalMRR > 0 ? (plan.monthlyRevenue / totalMRR) * 100 : 0,
    }));

    // Find highest contributing tier
    const highestTier = planBreakdownWithPercentage.reduce((max, plan) => 
      plan.monthlyRevenue > max.monthlyRevenue ? plan : max
    , planBreakdownWithPercentage[0]);
    
    return {
      totalMRR,
      membershipMRR,
      transformationMRR,
      coachingMRR,
      retentionRate,
      expiringCount: expiringClients.length,
      activeClients: analytics.activeClients,
      planBreakdown: planBreakdownWithPercentage,
      avgRevenuePerMember: analytics.activeClients > 0 ? totalMRR / analytics.activeClients : 0,
      projectedAnnual: totalMRR * 12,
      highestTier,
    };
  }, [analytics]);
  
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30 animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-1/2 mb-2" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </CardContent>
      </Card>
    );
  }
  
  if (!revenueData) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total MRR - Expandable */}
      <Collapsible 
        open={isExpanded} 
        onOpenChange={setIsExpanded}
        className={cn(
          "col-span-1",
          isExpanded && "md:col-span-2 lg:col-span-4"
        )}
      >
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30 cursor-pointer transition-all duration-300 hover:border-green-500/50">
          <CollapsibleTrigger asChild>
            <div className="w-full">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm text-green-400">Est. Monthly Revenue</CardTitle>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <ChevronDown className={cn(
                    "h-4 w-4 text-green-400 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  ${revenueData.totalMRR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {revenueData.activeClients} active subscribers • Click to expand
                </p>
              </CardContent>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
            <div className="px-6 pb-6 pt-2 border-t border-green-500/20 mt-2">
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-400" />
                Revenue Breakdown by Tier
              </h4>
              
              <div className="space-y-4">
                {revenueData.planBreakdown.map((plan) => (
                  <div key={plan.key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", plan.color)} />
                        <span className="font-medium">{plan.name}</span>
                      </div>
                      <span className="text-muted-foreground">{plan.count} members</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={plan.percentage} 
                        className="h-2 flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {plan.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ${plan.pricePerMember.toFixed(2)}/mo × {plan.count} = 
                      <span className="text-foreground font-medium ml-1">
                        ${plan.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-4 border-t border-border space-y-2">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-400" />
                  Quick Stats
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Avg Revenue/Member</p>
                    <p className="text-foreground font-semibold">
                      ${revenueData.avgRevenuePerMember.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Projected Annual</p>
                    <p className="text-foreground font-semibold">
                      ${revenueData.projectedAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Top Tier Value</p>
                    <p className="text-foreground font-semibold">
                      {revenueData.highestTier.name.split(" ")[0]} ({revenueData.highestTier.percentage.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      
      {/* Revenue Breakdown - Hide when expanded */}
      {!isExpanded && (
        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-400">Solitary</span>
              <span className="text-foreground">${revenueData.membershipMRR.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-primary">Gen Pop</span>
              <span className="text-foreground">${revenueData.transformationMRR.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-400">Free World</span>
              <span className="text-foreground">${revenueData.coachingMRR.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Retention Rate - Hide when expanded */}
      {!isExpanded && (
        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm text-muted-foreground">Retention Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              revenueData.retentionRate >= 80 ? "text-green-400" :
              revenueData.retentionRate >= 60 ? "text-yellow-400" :
              "text-red-400"
            }`}>
              {revenueData.retentionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active vs total historical
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Expiring Soon - Hide when expanded */}
      {!isExpanded && (
        <Card className={`border ${
          revenueData.expiringCount > 0 
            ? "bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30" 
            : "bg-charcoal border-border"
        }`}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className={`text-sm ${revenueData.expiringCount > 0 ? "text-amber-400" : "text-muted-foreground"}`}>
              Expiring Soon
            </CardTitle>
            {revenueData.expiringCount > 0 ? (
              <AlertCircle className="h-4 w-4 text-amber-400" />
            ) : (
              <Users className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${revenueData.expiringCount > 0 ? "text-amber-400" : "text-foreground"}`}>
              {revenueData.expiringCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gen Pop clients within 14 days
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default RevenueAnalytics;
