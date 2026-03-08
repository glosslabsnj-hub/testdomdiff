import { useState } from "react";
import {
  DollarSign,
  Users,
  ClipboardCheck,
  MessageSquare,
  ChevronDown,
  ArrowRight,
  Crown,
  Flame,
  BookOpen,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AdminSection } from "./adminNavConfig";
import RevenueAnalytics from "@/components/admin/RevenueAnalytics";
import type { useClientAnalytics } from "@/hooks/useClientAnalytics";
import type { useChatLeadAnalytics } from "@/hooks/useChatLeadAnalytics";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const [revenueOpen, setRevenueOpen] = useState(false);
  const [leadsOpen, setLeadsOpen] = useState(false);

  const solitaryCount = clientAnalytics?.clientsByPlan.membership || 0;
  const genPopCount = clientAnalytics?.clientsByPlan.transformation || 0;
  const freeWorldCount = clientAnalytics?.clientsByPlan.coaching || 0;
  const activeClients = clientAnalytics?.activeClients || 0;
  const totalLeads = leadAnalytics?.totalLeads || 0;
  const conversions = leadAnalytics?.conversions || 0;
  const conversionRate = totalLeads > 0 ? Math.min(100, Math.round((conversions / totalLeads) * 100)) : 0;
  const mrr = (solitaryCount * 19.99) + (genPopCount * 83) + (freeWorldCount * 499);

  // Fetch pending support messages count
  const { data: pendingSupport = 0 } = useQuery({
    queryKey: ["pending-support-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("support_messages")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      return count || 0;
    },
    enabled: !!user,
  });

  // Build "Needs Attention" items
  const attentionItems = [
    pendingCheckIns > 0 && {
      icon: ClipboardCheck,
      label: `${pendingCheckIns} check-in${pendingCheckIns > 1 ? "s" : ""} waiting for review`,
      color: "text-destructive",
      action: () => onNavigate("check-ins"),
    },
    pendingSupport > 0 && {
      icon: MessageSquare,
      label: `${pendingSupport} support message${pendingSupport > 1 ? "s" : ""} pending`,
      color: "text-yellow-400",
      action: () => onNavigate("support"),
    },
    totalLeads > 0 && conversions === 0 && {
      icon: Users,
      label: `${totalLeads} leads with 0 conversions — follow up`,
      color: "text-cyan-400",
      action: () => onNavigate("analytics"),
    },
  ].filter(Boolean) as { icon: React.ElementType; label: string; color: string; action: () => void }[];

  return (
    <div className="space-y-4">
      {/* 1. Scoreboard Strip — always visible */}
      <div className="grid grid-cols-2 sm:flex gap-3 overflow-x-auto pb-1 sm:-mx-1 sm:px-1 scrollbar-hide">
        {[
          {
            label: "MRR",
            value: clientsLoading ? "..." : `$${mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            color: "text-green-400",
            bg: "from-green-500/10 to-green-500/5 border-green-500/20",
          },
          {
            label: "Active Clients",
            value: clientsLoading ? "..." : String(activeClients),
            color: "text-blue-400",
            bg: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
          },
          {
            label: "Pending Check-Ins",
            value: String(pendingCheckIns),
            color: pendingCheckIns > 0 ? "text-destructive" : "text-foreground",
            bg: pendingCheckIns > 0
              ? "from-destructive/10 to-destructive/5 border-destructive/20"
              : "from-muted/30 to-muted/10 border-border",
          },
          {
            label: "Leads",
            value: leadsLoading ? "..." : String(totalLeads),
            color: "text-cyan-400",
            bg: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className={cn(
              "sm:min-w-[140px] flex-shrink-0 bg-gradient-to-br border",
              stat.bg
            )}
          >
            <CardContent className="p-3">
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. Needs Attention — always visible if there are items */}
      {attentionItems.length > 0 && (
        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-1">
            {attentionItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted/50 transition-colors text-left"
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0", item.color)} />
                  <span className="flex-1 text-foreground">{item.label}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* 3. Tier Breakdown — grid on mobile, flex on desktop */}
      <div className="grid grid-cols-3 gap-3">
        <Card
          className="flex-1 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30 cursor-pointer hover:border-blue-500/50 transition-colors"
          onClick={() => onNavigate("users")}
        >
          <CardContent className="p-3">
            <p className="text-xs text-blue-400 font-medium">Solitary</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">
              {clientsLoading ? "..." : solitaryCount}
            </p>
            <p className="text-xs text-muted-foreground">$19.99/mo</p>
          </CardContent>
        </Card>
        <Card
          className="flex-1 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => onNavigate("users")}
        >
          <CardContent className="p-3">
            <p className="text-xs text-primary font-medium">Gen Pop</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {clientsLoading ? "..." : genPopCount}
            </p>
            <p className="text-xs text-muted-foreground">$83/mo</p>
          </CardContent>
        </Card>
        <Card
          className="flex-1 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30 cursor-pointer hover:border-purple-500/50 transition-colors"
          onClick={() => onNavigate("freeworld")}
        >
          <CardContent className="p-3">
            <p className="text-xs text-purple-400 font-medium">Free World</p>
            <p className="text-3xl font-bold text-purple-400 mt-1">
              {clientsLoading ? "..." : freeWorldCount}
            </p>
            <p className="text-xs text-muted-foreground">$499/mo</p>
          </CardContent>
        </Card>
      </div>

      {/* 4. Quick Actions — 4 circular icon buttons */}
      <div className="flex justify-around gap-2 px-2">
        {[
          { icon: ClipboardCheck, label: "Check-Ins", color: "text-blue-400 bg-blue-500/10", section: "check-ins" as AdminSection },
          { icon: Users, label: "Clients", color: "text-primary bg-primary/10", section: "users" as AdminSection },
          { icon: BookOpen, label: "Content", color: "text-green-400 bg-green-500/10", section: "content" as AdminSection },
          { icon: Flame, label: "Social", color: "text-orange-400 bg-orange-500/10", section: "content-engine" as AdminSection },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => onNavigate(action.section)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95",
                action.color
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs text-muted-foreground">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Revenue Detail — collapsible */}
      <Collapsible open={revenueOpen} onOpenChange={setRevenueOpen}>
        <Card className="bg-charcoal border-border">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Revenue Detail</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Charts and breakdown
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", revenueOpen && "rotate-180")} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4">
              <RevenueAnalytics />
              <Button variant="ghost" size="sm" className="text-primary mt-2" onClick={() => onNavigate("payments")}>
                View Payments <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 6. Lead Pipeline — collapsible */}
      <Collapsible open={leadsOpen} onOpenChange={setLeadsOpen}>
        <Card className="bg-charcoal border-border">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Lead Pipeline</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {leadsLoading ? "Loading..." : `${totalLeads} leads • ${conversionRate}% conversion`}
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", leadsOpen && "rotate-180")} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-muted/30 border-border">
                  <CardContent className="p-3">
                    <p className="text-2xl font-bold text-primary">{leadsLoading ? "..." : totalLeads}</p>
                    <p className="text-xs text-muted-foreground">Total Leads</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border">
                  <CardContent className="p-3">
                    <p className="text-2xl font-bold text-foreground">{leadsLoading ? "..." : leadAnalytics?.avgMessageCount?.toFixed(1) || 0}</p>
                    <p className="text-xs text-muted-foreground">Avg Messages</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border">
                  <CardContent className="p-3">
                    <p className="text-2xl font-bold text-green-400">{leadsLoading ? "..." : conversions}</p>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border">
                  <CardContent className="p-3">
                    <p className="text-2xl font-bold text-primary">{leadsLoading ? "..." : `${conversionRate}%`}</p>
                    <p className="text-xs text-muted-foreground">Conv. Rate</p>
                  </CardContent>
                </Card>
              </div>
              <Button variant="ghost" size="sm" className="text-primary mt-2" onClick={() => onNavigate("analytics")}>
                Full Analytics <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
