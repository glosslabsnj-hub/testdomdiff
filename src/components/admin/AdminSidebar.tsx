import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  MessageSquare,
  BookOpen,
  Layers,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  ScrollText,
  Package,
  ChevronLeft,
  ChevronRight,
  Crown,
  Flame,
  Eye,
  Lock,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminPreview } from "@/contexts/AdminPreviewContext";

export type AdminSection = 
  | "command"
  | "users"
  | "check-ins"
  | "support"
  | "content"
  | "tiers"
  | "payments"
  | "intake"
  | "commissary"
  | "analytics"
  | "settings"
  | "logs"
  | "freeworld"
  | "content-engine";

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  pendingCheckIns?: number;
  pendingSupportTickets?: number;
  coachingClients?: number;
  pendingOrders?: number;
}

export default function AdminSidebar({
  activeSection,
  onSectionChange,
  pendingCheckIns = 0,
  pendingSupportTickets = 0,
  coachingClients = 0,
  pendingOrders = 0,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { setPreviewTier } = useAdminPreview();

  const handlePreviewDashboard = (tier: "membership" | "transformation" | "coaching") => {
    setPreviewTier(tier);
    navigate("/dashboard");
  };

  // Define category colors
  const categoryColors: Record<string, string> = {
    "Overview": "text-primary",
    "People": "text-blue-400",
    "Coaching": "text-purple-400",
    "Content": "text-green-400",
    "Business": "text-amber-400",
    "Growth": "text-orange-400",
    "System": "text-muted-foreground",
  };

  const navGroups: NavGroup[] = [
    {
      title: "Overview",
      items: [
        { id: "command", label: "Command Center", icon: LayoutDashboard },
      ],
    },
    {
      title: "People",
      items: [
        { id: "users", label: "Users", icon: Users },
        { 
          id: "check-ins", 
          label: "Check-Ins", 
          icon: ClipboardCheck, 
          badge: pendingCheckIns,
          badgeColor: "bg-destructive text-destructive-foreground"
        },
        { 
          id: "support", 
          label: "Support", 
          icon: MessageSquare,
          badge: pendingSupportTickets,
          badgeColor: "bg-yellow-500/20 text-yellow-400"
        },
      ],
    },
    {
      title: "Coaching",
      items: [
        { 
          id: "freeworld", 
          label: "Free World", 
          icon: Crown,
          badge: coachingClients > 0 ? coachingClients : undefined,
          badgeColor: "bg-purple-500/20 text-purple-400"
        },
        {
          id: "intake",
          label: "Intake & Forms",
          icon: FileText,
        },
      ],
    },
    {
      title: "Content",
      items: [
        { id: "content", label: "Programs & Content", icon: BookOpen },
        { id: "tiers", label: "Tiers & Access", icon: Layers },
      ],
    },
    {
      title: "Business",
      items: [
        { id: "payments", label: "Payments & Revenue", icon: CreditCard },
        { 
          id: "commissary", 
          label: "Commissary", 
          icon: Package,
          badge: pendingOrders,
          badgeColor: "bg-yellow-500/20 text-yellow-400"
        },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Growth",
      items: [
        { id: "content-engine", label: "Social Command", icon: Flame },
      ],
    },
    {
      title: "System",
      items: [
        { id: "settings", label: "Settings", icon: Settings },
        { id: "logs", label: "Logs & Safety", icon: ScrollText },
      ],
    },
  ];

  // Helper to get icon color for a group
  const getIconColor = (groupTitle: string) => categoryColors[groupTitle] || "text-muted-foreground";

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
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Preview Dashboards */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Preview As User
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => handlePreviewDashboard("membership")}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Lock className="h-3.5 w-3.5 text-orange-400" />
              <span>Solitary Confinement</span>
            </button>
            <button
              onClick={() => handlePreviewDashboard("transformation")}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Eye className="h-3.5 w-3.5 text-blue-400" />
              <span>General Population</span>
            </button>
            <button
              onClick={() => handlePreviewDashboard("coaching")}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Star className="h-3.5 w-3.5 text-yellow-400" />
              <span>Free World</span>
            </button>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="px-2 py-2 border-b border-border space-y-1">
          <button
            onClick={() => handlePreviewDashboard("membership")}
            className="w-full flex items-center justify-center py-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Preview: Solitary Confinement"
          >
            <Lock className="h-4 w-4 text-orange-400" />
          </button>
          <button
            onClick={() => handlePreviewDashboard("transformation")}
            className="w-full flex items-center justify-center py-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Preview: General Population"
          >
            <Eye className="h-4 w-4 text-blue-400" />
          </button>
          <button
            onClick={() => handlePreviewDashboard("coaching")}
            className="w-full flex items-center justify-center py-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Preview: Free World"
          >
            <Star className="h-4 w-4 text-yellow-400" />
          </button>
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
                  const iconColor = getIconColor(group.title);
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSectionChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors relative",
                        collapsed ? "justify-center" : "",
                        isActive
                          ? cn("bg-muted/50", iconColor)
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn("h-4 w-4 flex-shrink-0", iconColor)} />
                      {!collapsed && (
                        <>
                          <span className={cn("flex-1 text-left truncate", isActive && iconColor)}>{item.label}</span>
                          {item.badge && item.badge > 0 && (
                            <Badge className={cn("text-xs h-5 min-w-5 p-0 flex items-center justify-center", item.badgeColor)}>
                              {item.badge > 9 ? "9+" : item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                      {collapsed && item.badge && item.badge > 0 && (
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
