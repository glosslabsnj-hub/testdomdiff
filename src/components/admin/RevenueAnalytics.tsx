import { useMemo } from "react";
import { DollarSign, TrendingUp, Users, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientAnalytics } from "@/hooks/useClientAnalytics";

// Pricing assumptions
const PLAN_PRICES = {
  membership: 49.99,      // Monthly
  transformation: 749.99, // One-time (spread over 3 months for MRR calc)
  coaching: 1250,         // Monthly
} as const;

export function RevenueAnalytics() {
  const { analytics, loading } = useClientAnalytics();
  
  const revenueData = useMemo(() => {
    if (!analytics) return null;
    
    // Calculate MRR
    const membershipMRR = analytics.clientsByPlan.membership * PLAN_PRICES.membership;
    const transformationMRR = analytics.clientsByPlan.transformation * (PLAN_PRICES.transformation / 3);
    const coachingMRR = analytics.clientsByPlan.coaching * PLAN_PRICES.coaching;
    const totalMRR = membershipMRR + transformationMRR + coachingMRR;
    
    // Calculate retention rate (active / (active + expired + cancelled))
    const totalHistorical = analytics.totalClients;
    const retentionRate = totalHistorical > 0 
      ? Math.round((analytics.activeClients / totalHistorical) * 100) 
      : 0;
    
    // Clients expiring soon (transformation clients with <14 days remaining)
    const expiringClients = analytics.clients.filter(c => 
      c.activeSubscription?.plan_type === "transformation" &&
      c.daysRemaining !== null &&
      c.daysRemaining <= 14 &&
      c.daysRemaining > 0
    );
    
    return {
      totalMRR,
      membershipMRR,
      transformationMRR,
      coachingMRR,
      retentionRate,
      expiringCount: expiringClients.length,
      activeClients: analytics.activeClients,
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
      {/* Total MRR */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm text-green-400">Est. Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-400">
            ${revenueData.totalMRR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on {revenueData.activeClients} active subscribers
          </p>
        </CardContent>
      </Card>
      
      {/* Revenue Breakdown */}
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
      
      {/* Retention Rate */}
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
      
      {/* Expiring Soon */}
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
    </div>
  );
}

export default RevenueAnalytics;
