import { useState, useEffect } from "react";
import {
  Flame,
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Library,
  Search,
  Loader2,
  Instagram,
  FileText,
  TrendingUp,
  Mic,
  Users,
  MessageCircle,
  Trophy,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocialCommand } from "@/hooks/useSocialCommand";
import ContentStrategyOnboarding from "./ContentStrategyOnboarding";
import SocialCommandDashboard from "./SocialCommandDashboard";
import InstagramInsights from "./InstagramInsights";
import ScriptBuilder from "./ScriptBuilder";
import ContentCalendar from "./ContentCalendar";
import EnhancedGenerator from "./EnhancedGenerator";
import ContentLibrary from "./ContentLibrary";
import TrendScanner from "./TrendScanner";
import CompetitorAnalysis from "./CompetitorAnalysis";
import BrandVoiceManager from "./BrandVoiceManager";
import CollabFinder from "./CollabFinder";
import CommentCoach from "./CommentCoach";
import GrowthPlaybook from "./GrowthPlaybook";

const TABS = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-orange-400", description: "Overview & stats" },
  { value: "scripts", label: "Scripts", icon: FileText, color: "text-orange-400", description: "Film-ready scripts" },
  { value: "calendar", label: "Calendar", icon: CalendarDays, color: "text-blue-400", description: "Content schedule" },
  { value: "comments", label: "Comments", icon: MessageCircle, color: "text-green-400", description: "Reply coach" },
  { value: "collabs", label: "Collabs", icon: Users, color: "text-purple-400", description: "Find partners" },
  { value: "growth", label: "Growth", icon: Trophy, color: "text-amber-400", description: "Daily playbook" },
  { value: "ig-insights", label: "IG Insights", icon: Instagram, color: "text-pink-400", description: "Real IG data" },
  { value: "generator", label: "Generator", icon: Sparkles, color: "text-purple-400", description: "Content ideas" },
  { value: "library", label: "Library", icon: Library, color: "text-cyan-400", description: "Saved content" },
  { value: "trends", label: "Trends", icon: TrendingUp, color: "text-green-400", description: "What's hot now" },
  { value: "competitors", label: "Competitors", icon: Search, color: "text-red-400", description: "Spy on rivals" },
  { value: "brand-voice", label: "Brand Voice", icon: Mic, color: "text-yellow-400", description: "Your tone & style" },
];

export default function SocialCommandCenter() {
  const { isLoading, onboardingCompleted, config } = useSocialCommand();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("scc_active_tab") || "dashboard";
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("scc_active_tab", activeTab);
  }, [activeTab]);

  const shouldShowOnboarding = !isLoading && !onboardingCompleted && !config;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    );
  }

  if (shouldShowOnboarding || (showOnboarding && !onboardingCompleted)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-400" />
          <h2 className="text-xl font-bold">Social Command Center</h2>
        </div>
        <ContentStrategyOnboarding onComplete={() => setShowOnboarding(false)} />
      </div>
    );
  }

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleGenerateScript = (idea: any) => {
    setActiveTab("scripts");
  };

  const activeTabData = TABS.find((t) => t.value === activeTab) || TABS[0];
  const ActiveIcon = activeTabData.icon;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-400" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Social Command Center</h2>
          <p className="text-xs text-muted-foreground">Goal: 1M followers. Let's work.</p>
        </div>
      </div>

      {/* === MOBILE NAV: Dropdown + Grid === */}
      <div className="lg:hidden">
        {/* Current Tab Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between gap-2 p-3 rounded-lg bg-charcoal border border-border"
        >
          <div className="flex items-center gap-2">
            <ActiveIcon className={cn("h-5 w-5", activeTabData.color)} />
            <div className="text-left">
              <p className="text-sm font-bold">{activeTabData.label}</p>
              <p className="text-[10px] text-muted-foreground">{activeTabData.description}</p>
            </div>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", mobileMenuOpen && "rotate-180")} />
        </button>

        {/* Mobile Tab Grid */}
        {mobileMenuOpen && (
          <div className="mt-2 rounded-lg bg-charcoal border border-border p-3 grid grid-cols-3 gap-2 animate-in slide-in-from-top-2 duration-200">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleNavigate(tab.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-center",
                    isActive
                      ? "bg-orange-500/15 border-orange-500/40 ring-1 ring-orange-500/20"
                      : "border-border/50 hover:border-border hover:bg-background/50"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-orange-400" : tab.color)} />
                  <span className={cn("text-[10px] font-medium leading-tight", isActive ? "text-orange-400" : "text-muted-foreground")}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* === DESKTOP NAV: Wrapped grid of tab buttons === */}
      <div className="hidden lg:block">
        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-lg bg-charcoal border border-border">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleNavigate(tab.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all",
                  isActive
                    ? "bg-orange-500/20 text-orange-400 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-orange-400" : tab.color)} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* === TAB CONTENT === */}
      <div className="mt-4">
        {activeTab === "dashboard" && <SocialCommandDashboard onNavigate={handleNavigate} />}
        {activeTab === "ig-insights" && <InstagramInsights />}
        {activeTab === "scripts" && <ScriptBuilder />}
        {activeTab === "calendar" && <ContentCalendar />}
        {activeTab === "generator" && <EnhancedGenerator onGenerateScript={handleGenerateScript} />}
        {activeTab === "library" && <ContentLibrary onNavigateToGenerator={() => handleNavigate("generator")} />}
        {activeTab === "trends" && <TrendScanner platform="instagram" onGenerateFromTrend={() => handleNavigate("generator")} />}
        {activeTab === "comments" && <CommentCoach />}
        {activeTab === "collabs" && <CollabFinder />}
        {activeTab === "growth" && <GrowthPlaybook />}
        {activeTab === "competitors" && <CompetitorAnalysis />}
        {activeTab === "brand-voice" && <BrandVoiceManager />}
      </div>
    </div>
  );
}
