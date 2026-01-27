import { useState } from "react";
import { Menu, X, Crown, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  Flame,
} from "lucide-react";
import type { AdminSection } from "./AdminSidebar";

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
  color: string;
}

interface AdminMobileDrawerProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  pendingCheckIns?: number;
  pendingSupportTickets?: number;
  coachingClients?: number;
  pendingOrders?: number;
}

export default function AdminMobileDrawer({
  activeSection,
  onSectionChange,
  pendingCheckIns = 0,
  pendingSupportTickets = 0,
  coachingClients = 0,
  pendingOrders = 0,
}: AdminMobileDrawerProps) {
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Overview", "People", "Coaching"]);

  const navGroups: NavGroup[] = [
    {
      title: "Overview",
      color: "text-primary",
      items: [
        { id: "command", label: "Command Center", icon: LayoutDashboard },
      ],
    },
    {
      title: "People",
      color: "text-blue-400",
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
      color: "text-purple-400",
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
      color: "text-green-400",
      items: [
        { id: "content", label: "Programs & Content", icon: BookOpen },
        { id: "tiers", label: "Tiers & Access", icon: Layers },
      ],
    },
    {
      title: "Business",
      color: "text-amber-400",
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
      color: "text-orange-400",
      items: [
        { id: "content-engine", label: "Content Engine", icon: Flame },
      ],
    },
    {
      title: "System",
      color: "text-muted-foreground",
      items: [
        { id: "settings", label: "Settings", icon: Settings },
        { id: "logs", label: "Logs & Safety", icon: ScrollText },
      ],
    },
  ];

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => 
      prev.includes(title) 
        ? prev.filter(g => g !== title)
        : [...prev, title]
    );
  };

  const handleSelect = (section: AdminSection) => {
    onSectionChange(section);
    setOpen(false);
  };

  // Find current section label
  const currentLabel = navGroups
    .flatMap(g => g.items)
    .find(item => item.id === activeSection)?.label || "Admin";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-10 w-10"
          aria-label="Open admin navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 bg-charcoal">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-left text-base">Admin Panel</SheetTitle>
              <p className="text-xs text-muted-foreground text-left">{currentLabel}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100vh-80px)] py-2">
          {navGroups.map((group) => (
            <Collapsible
              key={group.title}
              open={expandedGroups.includes(group.title)}
              onOpenChange={() => toggleGroup(group.title)}
            >
              <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50">
                <span className={cn("text-xs font-semibold uppercase tracking-wider", group.color)}>
                  {group.title}
                </span>
                {expandedGroups.includes(group.title) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-2 pb-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors min-h-[48px]",
                          isActive
                            ? cn("bg-muted/50", group.color)
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className={cn("h-5 w-5 flex-shrink-0", group.color)} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <Badge className={cn("text-xs h-6 min-w-6 px-2", item.badgeColor)}>
                            {item.badge > 99 ? "99+" : item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
