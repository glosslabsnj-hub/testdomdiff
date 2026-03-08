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
  Crown,
  Flame,
} from "lucide-react";

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

export interface NavItem {
  id: AdminSection;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badgeKey?: "pendingCheckIns" | "pendingSupportTickets" | "coachingClients" | "pendingOrders";
  badgeColor?: string;
}

export interface NavGroup {
  title: string;
  color: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: "Overview",
    color: "text-primary",
    items: [
      { id: "command", label: "Command Center", shortLabel: "Home", icon: LayoutDashboard },
    ],
  },
  {
    title: "People",
    color: "text-blue-400",
    items: [
      { id: "users", label: "Users", shortLabel: "Users", icon: Users },
      {
        id: "check-ins",
        label: "Check-Ins",
        shortLabel: "Check-Ins",
        icon: ClipboardCheck,
        badgeKey: "pendingCheckIns",
        badgeColor: "bg-destructive text-destructive-foreground",
      },
      {
        id: "support",
        label: "Support",
        shortLabel: "Support",
        icon: MessageSquare,
        badgeKey: "pendingSupportTickets",
        badgeColor: "bg-yellow-500/20 text-yellow-400",
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
        shortLabel: "Free World",
        icon: Crown,
        badgeKey: "coachingClients",
        badgeColor: "bg-purple-500/20 text-purple-400",
      },
      { id: "intake", label: "Intake & Forms", shortLabel: "Intake", icon: FileText },
    ],
  },
  {
    title: "Content",
    color: "text-green-400",
    items: [
      { id: "content", label: "Programs & Content", shortLabel: "Content", icon: BookOpen },
      { id: "tiers", label: "Tiers & Access", shortLabel: "Tiers", icon: Layers },
    ],
  },
  {
    title: "Business",
    color: "text-amber-400",
    items: [
      { id: "payments", label: "Payments & Revenue", shortLabel: "Payments", icon: CreditCard },
      {
        id: "commissary",
        label: "Commissary",
        shortLabel: "Shop",
        icon: Package,
        badgeKey: "pendingOrders",
        badgeColor: "bg-yellow-500/20 text-yellow-400",
      },
      { id: "analytics", label: "Analytics", shortLabel: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Growth",
    color: "text-orange-400",
    items: [
      { id: "content-engine", label: "Social Command", shortLabel: "Social", icon: Flame },
    ],
  },
  {
    title: "System",
    color: "text-muted-foreground",
    items: [
      { id: "settings", label: "Settings", shortLabel: "Settings", icon: Settings },
      { id: "logs", label: "Logs & Safety", shortLabel: "Logs", icon: ScrollText },
    ],
  },
];

export const sectionTitles: Record<AdminSection, string> = Object.fromEntries(
  navGroups.flatMap((g) => g.items.map((item) => [item.id, item.label]))
) as Record<AdminSection, string>;

/** The 5 most-used sections for the mobile bottom nav */
export const bottomNavItems: AdminSection[] = [
  "command",
  "check-ins",
  "users",
  "support",
  "content-engine",
];

export type BadgeCounts = {
  pendingCheckIns: number;
  pendingSupportTickets: number;
  coachingClients: number;
  pendingOrders: number;
};
