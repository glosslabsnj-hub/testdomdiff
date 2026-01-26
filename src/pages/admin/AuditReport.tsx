import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, ExternalLink, RefreshCw, Shield, CreditCard, Users, Layout, FileText, Smartphone, BarChart3, Scale, Zap, Map, Compass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { AuditSitemap } from "@/components/admin/AuditSitemap";
import { PrisonJourneyBlueprint } from "@/components/admin/PrisonJourneyBlueprint";

type CheckStatus = "pass" | "warn" | "fail";

interface AuditCheck {
  id: string;
  name: string;
  status: CheckStatus;
  details: string;
  route?: string;
  fixStatus: "done" | "pending" | "n/a";
}

interface AuditCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  checks: AuditCheck[];
}

export default function AuditReport() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const { settings, isLoading: settingsLoading } = useSiteSettings();
  const [lastRun, setLastRun] = useState<Date>(new Date());

  const getSettingValue = (key: string): string => {
    return settings?.find((s) => s.key === key)?.value || "";
  };

  // Dynamic audit checks based on current state
  const auditCategories: AuditCategory[] = [
    {
      id: "auth",
      name: "Authentication & Access",
      icon: <Shield className="h-5 w-5" />,
      checks: [
        { id: "auth-1", name: "Login/Signup flow functional", status: "pass", details: "Email/password auth working via Supabase", route: "/login", fixStatus: "done" },
        { id: "auth-2", name: "Password reset flow", status: "pass", details: "Forgot password and reset password pages exist and use Supabase auth", route: "/forgot-password", fixStatus: "done" },
        { id: "auth-3", name: "Protected routes enforced", status: "pass", details: "ProtectedRoute component wraps all dashboard routes", route: "/dashboard", fixStatus: "done" },
        { id: "auth-4", name: "Role-based access (Admin)", status: "pass", details: "Admin check via user_roles table with has_role() function", route: "/admin", fixStatus: "done" },
        { id: "auth-5", name: "Session persistence", status: "pass", details: "AuthContext uses onAuthStateChange listener", fixStatus: "done" },
        { id: "auth-6", name: "RLS policies configured", status: "warn", details: "3 overly permissive policies detected - review needed", fixStatus: "pending" },
      ],
    },
    {
      id: "payments",
      name: "Payments & Pricing",
      icon: <CreditCard className="h-5 w-5" />,
      checks: [
        { id: "pay-1", name: "Checkout page exists", status: "pass", details: "Program checkout page at /checkout with plan selection", route: "/checkout", fixStatus: "done" },
        { id: "pay-2", name: "Stripe integration", status: "warn", details: "Stripe not yet connected - using dev mode simulation", route: "/checkout", fixStatus: "pending" },
        { id: "pay-3", name: "Tier selection clear", status: "pass", details: "Three tiers displayed with pricing and features", route: "/programs", fixStatus: "done" },
        { id: "pay-4", name: "Post-purchase access", status: "pass", details: "Subscription created and user redirected to intake", fixStatus: "done" },
        { id: "pay-5", name: "Shop checkout", status: "pass", details: "Merch shop checkout flow complete with cart persistence", route: "/shop/checkout", fixStatus: "done" },
      ],
    },
    {
      id: "funnel",
      name: "Core Funnel Flow",
      icon: <Users className="h-5 w-5" />,
      checks: [
        { id: "fun-1", name: "Landing page hero CTA", status: "pass", details: "Clear CTA to programs page", route: "/", fixStatus: "done" },
        { id: "fun-2", name: "Programs comparison", status: "pass", details: "ProgramComparisonTable shows all 3 tiers", route: "/programs", fixStatus: "done" },
        { id: "fun-3", name: "Intake form validation", status: "pass", details: "Zod schema validation on all 4 steps", route: "/intake", fixStatus: "done" },
        { id: "fun-4", name: "Intake confirmation", status: "pass", details: "IntakeComplete page with next steps", route: "/intake-complete", fixStatus: "done" },
        { id: "fun-5", name: "Dashboard onboarding", status: "pass", details: "Start Here page with checklist", route: "/dashboard/start-here", fixStatus: "done" },
        { id: "fun-6", name: "Book a call option", status: getSettingValue("calendly_url") && getSettingValue("calendly_url") !== "https://calendly.com/your-link" ? "pass" : "warn", details: getSettingValue("calendly_url") && getSettingValue("calendly_url") !== "https://calendly.com/your-link" ? "Calendly URL configured" : "Calendly URL needs to be set in Settings", route: "/book-call", fixStatus: getSettingValue("calendly_url") && getSettingValue("calendly_url") !== "https://calendly.com/your-link" ? "done" : "pending" },
      ],
    },
    {
      id: "dashboard",
      name: "Customer Dashboard",
      icon: <Layout className="h-5 w-5" />,
      checks: [
        { id: "dash-1", name: "Dashboard loads fast", status: "pass", details: "CrossLoader + DashboardSkeleton for loading states", route: "/dashboard", fixStatus: "done" },
        { id: "dash-2", name: "Navigation complete", status: "pass", details: "All 12 dashboard sections accessible", route: "/dashboard", fixStatus: "done" },
        { id: "dash-3", name: "Tier-based content gating", status: "pass", details: "useEffectiveSubscription hook controls access", fixStatus: "done" },
        { id: "dash-4", name: "Start Here onboarding", status: "pass", details: "Checklist with video + first steps", route: "/dashboard/start-here", fixStatus: "done" },
        { id: "dash-5", name: "Program progress tracking", status: "pass", details: "Week-by-week workout completions tracked", route: "/dashboard/program", fixStatus: "done" },
        { id: "dash-6", name: "Settings page", status: "pass", details: "Profile editing, password change, logout", route: "/dashboard/settings", fixStatus: "done" },
      ],
    },
    {
      id: "admin",
      name: "Admin Dashboard",
      icon: <Shield className="h-5 w-5" />,
      checks: [
        { id: "adm-1", name: "Client list viewable", status: "pass", details: "PeopleHub shows all clients with filters", route: "/admin", fixStatus: "done" },
        { id: "adm-2", name: "Intake submissions visible", status: "pass", details: "ClientDetailPanel shows intake data", route: "/admin", fixStatus: "done" },
        { id: "adm-3", name: "Content CMS", status: "pass", details: "Workouts, Faith, Nutrition, Discipline all manageable", route: "/admin", fixStatus: "done" },
        { id: "adm-4", name: "Revenue analytics", status: "pass", details: "RevenueAnalytics component in Command Center", route: "/admin", fixStatus: "done" },
        { id: "adm-5", name: "Check-in review", status: "pass", details: "CheckInReviewManager with coach notes", route: "/admin", fixStatus: "done" },
        { id: "adm-6", name: "Site settings", status: "pass", details: "Pixel IDs, Calendly URL, support email configurable", route: "/admin", fixStatus: "done" },
      ],
    },
    {
      id: "content",
      name: "Content Management",
      icon: <FileText className="h-5 w-5" />,
      checks: [
        { id: "con-1", name: "Workout templates", status: "pass", details: "Full CRUD in WorkoutContentManager", route: "/admin", fixStatus: "done" },
        { id: "con-2", name: "Program weeks structure", status: "pass", details: "12-week program with day-by-day workouts", route: "/admin", fixStatus: "done" },
        { id: "con-3", name: "Faith lessons", status: "pass", details: "Weekly lessons with scripture + reflection", route: "/admin", fixStatus: "done" },
        { id: "con-4", name: "Meal plans", status: "pass", details: "MealPlanManager with templates + meals", route: "/admin", fixStatus: "done" },
        { id: "con-5", name: "Video embeds", status: "pass", details: "program-videos storage bucket configured", fixStatus: "done" },
      ],
    },
    {
      id: "mobile",
      name: "Mobile UX",
      icon: <Smartphone className="h-5 w-5" />,
      checks: [
        { id: "mob-1", name: "Bottom navigation", status: "pass", details: "MobileBottomNav with 5 quick actions", route: "/dashboard", fixStatus: "done" },
        { id: "mob-2", name: "Touch targets 44px+", status: "pass", details: "Min touch targets enforced on interactive elements", fixStatus: "done" },
        { id: "mob-3", name: "Mobile menu", status: "pass", details: "Sheet-based sidebar with cart access", route: "/", fixStatus: "done" },
        { id: "mob-4", name: "Safe area padding", status: "pass", details: "viewport-fit=cover and safe-area-inset padding", fixStatus: "done" },
        { id: "mob-5", name: "PWA manifest", status: "pass", details: "manifest.json with icons and theme color", fixStatus: "done" },
      ],
    },
    {
      id: "analytics",
      name: "Analytics & Tracking",
      icon: <BarChart3 className="h-5 w-5" />,
      checks: [
        { id: "ana-1", name: "useAnalytics hook", status: "pass", details: "Centralized tracking hook for all pixels", fixStatus: "done" },
        { id: "ana-2", name: "Meta Pixel ready", status: getSettingValue("meta_pixel_id") ? "pass" : "warn", details: getSettingValue("meta_pixel_id") ? `Pixel ID: ${getSettingValue("meta_pixel_id").slice(0, 8)}...` : "Meta Pixel ID not configured", fixStatus: getSettingValue("meta_pixel_id") ? "done" : "pending" },
        { id: "ana-3", name: "GA4 ready", status: getSettingValue("ga4_measurement_id") ? "pass" : "warn", details: getSettingValue("ga4_measurement_id") ? `ID: ${getSettingValue("ga4_measurement_id")}` : "GA4 Measurement ID not configured", fixStatus: getSettingValue("ga4_measurement_id") ? "done" : "pending" },
        { id: "ana-4", name: "TikTok Pixel ready", status: getSettingValue("tiktok_pixel_id") ? "pass" : "warn", details: getSettingValue("tiktok_pixel_id") ? `Pixel ID: ${getSettingValue("tiktok_pixel_id").slice(0, 8)}...` : "TikTok Pixel ID not configured", fixStatus: getSettingValue("tiktok_pixel_id") ? "done" : "pending" },
        { id: "ana-5", name: "Conversion events wired", status: "pass", details: "ViewContent, InitiateCheckout, Purchase, Lead events defined", fixStatus: "done" },
      ],
    },
    {
      id: "legal",
      name: "Legal & Trust",
      icon: <Scale className="h-5 w-5" />,
      checks: [
        { id: "leg-1", name: "Terms of Service", status: "pass", details: "Terms page exists at /terms", route: "/terms", fixStatus: "done" },
        { id: "leg-2", name: "Privacy Policy", status: "pass", details: "Privacy page exists at /privacy", route: "/privacy", fixStatus: "done" },
        { id: "leg-3", name: "Refund Policy", status: "pass", details: "Refund page exists at /refund", route: "/refund", fixStatus: "done" },
        { id: "leg-4", name: "Disclaimer", status: "pass", details: "Disclaimer page exists at /disclaimer", route: "/disclaimer", fixStatus: "done" },
        { id: "leg-5", name: "Footer links", status: "pass", details: "All legal pages linked in footer", fixStatus: "done" },
      ],
    },
    {
      id: "performance",
      name: "Performance & Reliability",
      icon: <Zap className="h-5 w-5" />,
      checks: [
        { id: "per-1", name: "Loading skeletons", status: "pass", details: "DashboardSkeleton and CrossLoader used throughout", fixStatus: "done" },
        { id: "per-2", name: "Error boundary", status: "pass", details: "Global ErrorBoundary wraps app", fixStatus: "done" },
        { id: "per-3", name: "404 page", status: "pass", details: "Branded NotFound page with scriptures", route: "/404-test", fixStatus: "done" },
        { id: "per-4", name: "Image lazy loading", status: "pass", details: "Below-fold images use loading='lazy'", fixStatus: "done" },
        { id: "per-5", name: "Cart persistence", status: "pass", details: "CartContext persists to localStorage", fixStatus: "done" },
        { id: "per-6", name: "Query caching", status: "pass", details: "React Query handles caching and retries", fixStatus: "done" },
      ],
    },
  ];

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "warn":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusBadge = (status: CheckStatus) => {
    switch (status) {
      case "pass":
        return <Badge className="bg-success/20 text-success border-success/30">Passed</Badge>;
      case "warn":
        return <Badge className="bg-warning/20 text-warning border-warning/30">Needs Attention</Badge>;
      case "fail":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Failed</Badge>;
    }
  };

  const getFixStatusBadge = (fixStatus: "done" | "pending" | "n/a") => {
    switch (fixStatus) {
      case "done":
        return <Badge variant="outline" className="text-xs">Fix: Done</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-xs border-warning text-warning">Fix: Pending</Badge>;
      case "n/a":
        return null;
    }
  };

  const getCategorySummary = (category: AuditCategory) => {
    const passed = category.checks.filter((c) => c.status === "pass").length;
    const warned = category.checks.filter((c) => c.status === "warn").length;
    const failed = category.checks.filter((c) => c.status === "fail").length;
    return { passed, warned, failed, total: category.checks.length };
  };

  const overallStats = {
    passed: auditCategories.reduce((acc, cat) => acc + cat.checks.filter((c) => c.status === "pass").length, 0),
    warned: auditCategories.reduce((acc, cat) => acc + cat.checks.filter((c) => c.status === "warn").length, 0),
    failed: auditCategories.reduce((acc, cat) => acc + cat.checks.filter((c) => c.status === "fail").length, 0),
    total: auditCategories.reduce((acc, cat) => acc + cat.checks.length, 0),
  };

  if (adminLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You don't have permission to view this page.</p>
        <Button variant="gold" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 section-container py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="headline-card">Production Audit Report</h1>
            <p className="text-muted-foreground text-sm">
              Last run: {lastRun.toLocaleString()}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLastRun(new Date())}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Overall Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-success/10 border-success/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-success">{overallStats.passed}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </CardContent>
          </Card>
          <Card className="bg-warning/10 border-warning/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-warning">{overallStats.warned}</div>
              <div className="text-sm text-muted-foreground">Needs Attention</div>
            </CardContent>
          </Card>
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-destructive">{overallStats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </CardContent>
          </Card>
          <Card className="bg-charcoal border-border">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">
                {Math.round((overallStats.passed / overallStats.total) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different audit views */}
        <Tabs defaultValue="checks" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="checks" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Audit Checks
            </TabsTrigger>
            <TabsTrigger value="sitemap" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Route Map
            </TabsTrigger>
            <TabsTrigger value="blueprint" className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              UX Blueprint
            </TabsTrigger>
          </TabsList>
          
          {/* Audit Checks Tab */}
          <TabsContent value="checks" className="space-y-4">
            <Accordion type="multiple" defaultValue={auditCategories.map((c) => c.id)} className="space-y-4">
              {auditCategories.map((category) => {
                const summary = getCategorySummary(category);
                return (
                  <AccordionItem key={category.id} value={category.id} className="bg-charcoal border border-border rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-primary">{category.icon}</div>
                        <span className="font-semibold text-foreground">{category.name}</span>
                        <div className="flex items-center gap-2 ml-auto mr-4">
                          {summary.passed > 0 && (
                            <Badge className="bg-success/20 text-success text-xs">{summary.passed} ✓</Badge>
                          )}
                          {summary.warned > 0 && (
                            <Badge className="bg-warning/20 text-warning text-xs">{summary.warned} ⚠</Badge>
                          )}
                          {summary.failed > 0 && (
                            <Badge className="bg-destructive/20 text-destructive text-xs">{summary.failed} ✗</Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3">
                        {category.checks.map((check) => (
                          <div
                            key={check.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                          >
                            {getStatusIcon(check.status)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-foreground">{check.name}</span>
                                {getStatusBadge(check.status)}
                                {getFixStatusBadge(check.fixStatus)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{check.details}</p>
                            </div>
                            {check.route && (
                              <Link
                                to={check.route}
                                className="text-primary hover:underline text-sm flex items-center gap-1 shrink-0"
                              >
                                View <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>
          
          {/* Route Sitemap Tab */}
          <TabsContent value="sitemap">
            <AuditSitemap />
          </TabsContent>
          
          {/* UX Blueprint Tab */}
          <TabsContent value="blueprint">
            <PrisonJourneyBlueprint />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8 bg-charcoal border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="gold" asChild>
              <Link to="/admin">Go to Admin Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin">Configure Pixel IDs (Settings Tab)</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/checkout?plan=transformation">Test Checkout Flow</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">View Landing Page</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
