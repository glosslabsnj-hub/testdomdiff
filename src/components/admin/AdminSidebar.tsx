import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Lock, Eye, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminPreview } from "@/contexts/AdminPreviewContext";
import { navGroups, type AdminSection, type BadgeCounts } from "./adminNavConfig";
import { Crown } from "lucide-react";

// Re-export the type so existing imports still work
export type { AdminSection };

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  badges: BadgeCounts;
}

export default function AdminSidebar({
  activeSection,
  onSectionChange,
  badges,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { setPreviewTier } = useAdminPreview();

  const handlePreviewDashboard = (tier: "membership" | "transformation" | "coaching") => {
    setPreviewTier(tier);
    navigate("/dashboard");
  };

  return (
    <div
      className={cn(
        "h-full bg-charcoal border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Crown className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Preview Dashboards */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Preview As User
          </h3>
          <div className="space-y-1">
            {[
              { tier: "membership" as const, icon: Lock, color: "text-orange-400", label: "Solitary Confinement" },
              { tier: "transformation" as const, icon: Eye, color: "text-blue-400", label: "General Population" },
              { tier: "coaching" as const, icon: Star, color: "text-yellow-400", label: "Free World" },
            ].map((p) => (
              <button
                key={p.tier}
                onClick={() => handlePreviewDashboard(p.tier)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <p.icon className={cn("h-3.5 w-3.5", p.color)} />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {collapsed && (
        <div className="px-2 py-2 border-b border-border space-y-1">
          {[
            { tier: "membership" as const, icon: Lock, color: "text-orange-400", title: "Preview: Solitary" },
            { tier: "transformation" as const, icon: Eye, color: "text-blue-400", title: "Preview: Gen Pop" },
            { tier: "coaching" as const, icon: Star, color: "text-yellow-400", title: "Preview: Free World" },
          ].map((p) => (
            <button
              key={p.tier}
              onClick={() => handlePreviewDashboard(p.tier)}
              className="w-full flex items-center justify-center py-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              title={p.title}
            >
              <p.icon className={cn("h-4 w-4", p.color)} />
            </button>
          ))}
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {navGroups.map((group, groupIndex) => (
            <div key={group.title}>
              {!collapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                  {group.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSectionChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-2.5 rounded-md text-sm transition-colors relative",
                        collapsed ? "justify-center" : "",
                        isActive
                          ? cn("bg-muted/50", group.color)
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      aria-current={isActive ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn("h-4 w-4 flex-shrink-0", group.color)} />
                      {!collapsed && (
                        <>
                          <span className={cn("flex-1 text-left truncate", isActive && group.color)}>
                            {item.label}
                          </span>
                          {badgeCount > 0 && (
                            <Badge className={cn("text-xs h-5 min-w-5 p-0 flex items-center justify-center", item.badgeColor)}>
                              {badgeCount > 9 ? "9+" : badgeCount}
                            </Badge>
                          )}
                        </>
                      )}
                      {collapsed && badgeCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
              {groupIndex < navGroups.length - 1 && !collapsed && (
                <Separator className="mt-3" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
