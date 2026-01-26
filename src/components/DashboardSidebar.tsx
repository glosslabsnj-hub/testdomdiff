import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Play,
  Dumbbell,
  Calendar,
  Clock,
  Utensils,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
  Users,
  Crown,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Lock,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
  Images,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  locked?: boolean;
  premium?: boolean;
}

export function DashboardSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { isCoaching, isTransformation, isMembership } = useEffectiveSubscription();

  // Core navigation items available to all tiers
  const coreItems: NavItem[] = [
    {
      title: "Cell Block",
      subtitle: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: isCoaching ? "Welcome Home" : "Intake",
      subtitle: "Start Here",
      href: "/dashboard/start-here",
      icon: Play,
    },
    {
      title: isCoaching ? "Your Program" : "The Sentence",
      subtitle: "12-Week",
      href: "/dashboard/program",
      icon: Calendar,
      locked: isMembership,
    },
    {
      title: isCoaching ? "Training" : isMembership ? "Yard Time" : "Workout Library",
      subtitle: isMembership ? "Bodyweight" : "All Workouts",
      href: "/dashboard/workouts",
      icon: Dumbbell,
    },
    {
      title: isCoaching ? "Structure" : "Lights On/Out",
      subtitle: "Discipline",
      href: "/dashboard/discipline",
      icon: Clock,
    },
  ];

  // Lifestyle items - Solitary only has basic nutrition, not full Chow Hall or Chapel
  const lifestyleItems: NavItem[] = [
    {
      title: isCoaching ? "Meal Planning" : isMembership ? "Basic Nutrition" : "Chow Hall",
      subtitle: isMembership ? "Basics" : "Nutrition",
      href: "/dashboard/nutrition",
      icon: Utensils,
      // Solitary has basic nutrition access, not locked
    },
    {
      title: isCoaching ? "Faith & Mindset" : "Chapel",
      subtitle: "Faith",
      href: "/dashboard/faith",
      icon: BookOpen,
      locked: isMembership, // Chapel is Gen Pop+ only
    },
  ];

  // Accountability items
  const accountabilityItems: NavItem[] = [
    {
      title: isCoaching ? "Weekly Report" : "Roll Call",
      subtitle: "Check-In",
      href: "/dashboard/check-in",
      icon: ClipboardCheck,
    },
    {
      title: isCoaching ? "Progress" : "Time Served",
      subtitle: "Progress",
      href: "/dashboard/progress",
      icon: TrendingUp,
    },
    {
      title: "Photo Gallery",
      subtitle: "Photos",
      href: "/dashboard/photos",
      icon: Images,
    },
  ];

  // Growth items
  const growthItems: NavItem[] = [
    {
      title: isCoaching ? "Career Building" : "Work Release",
      subtitle: "Skills",
      href: "/dashboard/skills",
      icon: Briefcase,
      locked: isMembership,
    },
    {
      title: isCoaching ? "The Network" : "The Yard",
      subtitle: "Community",
      href: "/dashboard/community",
      icon: Users,
      locked: isMembership,
    },
  ];

  // Premium coaching items
  const premiumItems: NavItem[] = isCoaching ? [
    {
      title: "Entrepreneur Track",
      subtitle: "Advanced",
      href: "/dashboard/advanced-skills",
      icon: GraduationCap,
      premium: true,
    },
    {
      title: "Direct Line",
      subtitle: "Messages",
      href: "/dashboard/messages",
      icon: MessageCircle,
      premium: true,
    },
    {
      title: "Coaching Portal",
      subtitle: "1:1 Access",
      href: "/dashboard/coaching",
      icon: Crown,
      premium: true,
    },
  ] : [];

  const isActive = (path: string) => location.pathname === path;

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={collapsed ? item.title : undefined}
        >
          <Link
            to={item.locked ? "#" : item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200",
              active && !item.locked && "bg-primary/10 text-primary border-l-2 border-primary",
              item.locked && "opacity-50 cursor-not-allowed",
              item.premium && !active && "text-primary/80",
              !active && !item.locked && !item.premium && "hover:bg-muted/50"
            )}
            onClick={(e) => item.locked && e.preventDefault()}
          >
            <Icon className={cn(
              "w-5 h-5 flex-shrink-0",
              active && "text-primary",
              item.locked && "text-muted-foreground",
              item.premium && "text-primary"
            )} />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-medium truncate",
                    active && "text-primary",
                    item.locked && "text-muted-foreground"
                  )}>
                    {item.title}
                  </span>
                  {item.locked && (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  )}
                  {item.premium && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-primary/50 text-primary">
                      VIP
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup key={label}>
      {!collapsed && (
        <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(renderNavItem)}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar
      className={cn(
        "border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarContent className="py-4">
        {renderGroup("Main", coreItems)}
        {renderGroup("Lifestyle", lifestyleItems)}
        {renderGroup("Accountability", accountabilityItems)}
        {renderGroup("Growth", growthItems)}
        {premiumItems.length > 0 && renderGroup("Premium", premiumItems)}
        
        {/* Settings at bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/settings")}
                  tooltip={collapsed ? "Settings" : undefined}
                >
                  <Link
                    to="/dashboard/settings"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200",
                      isActive("/dashboard/settings") && "bg-primary/10 text-primary",
                      !isActive("/dashboard/settings") && "hover:bg-muted/50"
                    )}
                  >
                    <Settings className="w-5 h-5" />
                    {!collapsed && <span className="text-sm font-medium">Settings</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default DashboardSidebar;
