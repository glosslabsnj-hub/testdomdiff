import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Map, 
  Globe, 
  Lock, 
  Shield, 
  ShoppingCart, 
  Scale,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface RouteInfo {
  path: string;
  name: string;
  protection: "public" | "auth" | "admin";
  tier?: "all" | "membership" | "transformation" | "coaching";
  status: "active" | "placeholder" | "deprecated";
}

interface RouteCategory {
  name: string;
  icon: React.ElementType;
  routes: RouteInfo[];
}

// Complete route inventory matching AnimatedRoutes.tsx
const routeCategories: RouteCategory[] = [
  {
    name: "Public Pages",
    icon: Globe,
    routes: [
      { path: "/", name: "Landing Page", protection: "public", status: "active" },
      { path: "/about", name: "About / Story", protection: "public", status: "active" },
      { path: "/programs", name: "Programs Overview", protection: "public", status: "active" },
      { path: "/programs/membership", name: "Solitary Confinement", protection: "public", status: "active" },
      { path: "/programs/transformation", name: "General Population", protection: "public", status: "active" },
      { path: "/programs/coaching", name: "Free World", protection: "public", status: "active" },
      { path: "/checkout", name: "Checkout", protection: "public", status: "active" },
      { path: "/book-call", name: "Book a Call", protection: "public", status: "active" },
      { path: "/login", name: "Login", protection: "public", status: "active" },
      { path: "/forgot-password", name: "Forgot Password", protection: "public", status: "active" },
      { path: "/reset-password", name: "Reset Password", protection: "public", status: "active" },
      { path: "/access-expired", name: "Access Expired", protection: "public", status: "active" },
    ],
  },
  {
    name: "Onboarding Flow",
    icon: Lock,
    routes: [
      { path: "/intake", name: "Intake Form", protection: "auth", status: "active" },
      { path: "/intake-complete", name: "Intake Confirmation", protection: "auth", status: "active" },
    ],
  },
  {
    name: "Member Dashboard",
    icon: Lock,
    routes: [
      { path: "/dashboard", name: "Cell Block (Main)", protection: "auth", tier: "all", status: "active" },
      { path: "/dashboard/start-here", name: "Intake Processing / Start Here", protection: "auth", tier: "all", status: "active" },
      { path: "/dashboard/program", name: "The Sentence (12-Week)", protection: "auth", tier: "transformation", status: "active" },
      { path: "/dashboard/workouts", name: "Yard Time (Workouts)", protection: "auth", tier: "all", status: "active" },
      { path: "/dashboard/workouts/:templateId", name: "Workout Template Detail", protection: "auth", tier: "all", status: "active" },
      { path: "/dashboard/discipline", name: "Lights On/Out (Discipline)", protection: "auth", tier: "all", status: "active" },
      { path: "/dashboard/nutrition", name: "Chow Hall (Nutrition)", protection: "auth", tier: "all", status: "active" },
      { path: "/dashboard/faith", name: "Chapel (Faith Lessons)", protection: "auth", tier: "transformation", status: "active" },
      { path: "/dashboard/check-in", name: "Roll Call (Check-In)", protection: "auth", tier: "all", status: "active" },
      { path: "/dashboard/progress", name: "Time Served (Progress)", protection: "auth", tier: "all", status: "active" },
      { path: "/dashboard/photos", name: "Mugshots (Photo Gallery)", protection: "auth", tier: "all", status: "active" },
      { path: "/dashboard/community", name: "The Yard (Community)", protection: "auth", tier: "transformation", status: "active" },
      { path: "/dashboard/skills", name: "Work Release (Skills)", protection: "auth", tier: "transformation", status: "active" },
      { path: "/dashboard/advanced-skills", name: "Entrepreneur Track", protection: "auth", tier: "coaching", status: "active" },
      { path: "/dashboard/messages", name: "Direct Line (Messages)", protection: "auth", tier: "coaching", status: "active" },
      { path: "/dashboard/coaching", name: "Coaching Portal", protection: "auth", tier: "coaching", status: "active" },
      { path: "/dashboard/book-po-checkin", name: "Book P.O. Check-In", protection: "auth", tier: "coaching", status: "active" },
      { path: "/dashboard/settings", name: "Settings", protection: "auth", tier: "all", status: "active" },
      { path: "/dashboard/help", name: "CO Desk (Help/Support)", protection: "auth", tier: "all", status: "active" },
    ],
  },
  {
    name: "Shop",
    icon: ShoppingCart,
    routes: [
      { path: "/shop", name: "Shop Home", protection: "public", status: "active" },
      { path: "/shop/:productId", name: "Product Detail", protection: "public", status: "active" },
      { path: "/shop/checkout", name: "Shop Checkout", protection: "public", status: "active" },
      { path: "/shop/confirmation", name: "Order Confirmation", protection: "public", status: "active" },
    ],
  },
  {
    name: "Admin",
    icon: Shield,
    routes: [
      { path: "/admin", name: "Admin Dashboard", protection: "admin", status: "active" },
      { path: "/admin/audit", name: "Production Audit Report", protection: "admin", status: "active" },
    ],
  },
  {
    name: "Legal",
    icon: Scale,
    routes: [
      { path: "/terms", name: "Terms of Service", protection: "public", status: "active" },
      { path: "/privacy", name: "Privacy Policy", protection: "public", status: "active" },
      { path: "/refund", name: "Refund Policy", protection: "public", status: "active" },
      { path: "/disclaimer", name: "Disclaimer", protection: "public", status: "active" },
    ],
  },
];

const getProtectionBadge = (protection: RouteInfo["protection"]) => {
  switch (protection) {
    case "public":
      return <Badge variant="outline" className="text-xs">Public</Badge>;
    case "auth":
      return <Badge variant="outline" className="text-xs border-primary/50 text-primary">Auth Required</Badge>;
    case "admin":
      return <Badge variant="outline" className="text-xs border-crimson/50 text-crimson">Admin Only</Badge>;
  }
};

const getTierBadge = (tier?: RouteInfo["tier"]) => {
  if (!tier || tier === "all") return null;
  
  const tierLabels = {
    membership: "Solitary",
    transformation: "Gen Pop+",
    coaching: "Free World",
  };
  
  const tierColors = {
    membership: "bg-muted text-muted-foreground",
    transformation: "bg-primary/20 text-primary",
    coaching: "bg-crimson/20 text-crimson",
  };
  
  return (
    <Badge className={cn("text-xs", tierColors[tier])}>
      {tierLabels[tier]}
    </Badge>
  );
};

export function AuditSitemap() {
  const [openCategories, setOpenCategories] = useState<string[]>(routeCategories.map(c => c.name));
  
  const toggleCategory = (name: string) => {
    setOpenCategories(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name) 
        : [...prev, name]
    );
  };
  
  const totalRoutes = routeCategories.reduce((acc, cat) => acc + cat.routes.length, 0);
  const activeRoutes = routeCategories.reduce(
    (acc, cat) => acc + cat.routes.filter(r => r.status === "active").length, 
    0
  );
  
  return (
    <Card className="bg-charcoal border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Route Inventory
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{totalRoutes} routes</Badge>
            <Badge className="bg-success/20 text-success">{activeRoutes} active</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {routeCategories.map((category) => (
          <Collapsible 
            key={category.name}
            open={openCategories.includes(category.name)}
            onOpenChange={() => toggleCategory(category.name)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <category.icon className="w-4 h-4 text-primary" />
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {category.routes.length}
                  </Badge>
                </div>
                {openCategories.includes(category.name) ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 ml-4 space-y-1">
                {category.routes.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path.includes(":") ? "#" : route.path}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-background/30 transition-colors group"
                    onClick={(e) => route.path.includes(":") && e.preventDefault()}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {route.status === "active" ? (
                        <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0" />
                      )}
                      <span className="text-sm truncate">{route.name}</span>
                      {!route.path.includes(":") && (
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getTierBadge(route.tier)}
                      {getProtectionBadge(route.protection)}
                    </div>
                  </Link>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}

export default AuditSitemap;
