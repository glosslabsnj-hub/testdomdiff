import { useState } from "react";
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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  { value: "dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { value: "scripts", label: "Scripts", shortLabel: "Script", icon: FileText },
  { value: "calendar", label: "Calendar", shortLabel: "Cal", icon: CalendarDays },
  { value: "comments", label: "Comments", shortLabel: "Reply", icon: MessageCircle },
  { value: "collabs", label: "Collabs", shortLabel: "Collab", icon: Users },
  { value: "growth", label: "Growth", shortLabel: "Grow", icon: Trophy },
  { value: "ig-insights", label: "IG Insights", shortLabel: "IG", icon: Instagram },
  { value: "generator", label: "Generator", shortLabel: "Gen", icon: Sparkles },
  { value: "library", label: "Library", shortLabel: "Lib", icon: Library },
  { value: "trends", label: "Trends", shortLabel: "Trend", icon: TrendingUp },
  { value: "competitors", label: "Competitors", shortLabel: "Comp", icon: Search },
  { value: "brand-voice", label: "Brand Voice", shortLabel: "Voice", icon: Mic },
];

export default function SocialCommandCenter() {
  const { isLoading, onboardingCompleted, config } = useSocialCommand();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  const handleGenerateScript = (idea: any) => {
    // Navigate to scripts tab — the script builder will handle generation
    setActiveTab("scripts");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-400" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Social Command Center</h2>
          <p className="text-xs text-muted-foreground">Strategy-driven content that grows the brand. Goal: 1M followers.</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-charcoal border border-border inline-flex h-auto gap-1 p-1 min-w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs h-9 px-3 gap-1.5 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="mt-4">
          <SocialCommandDashboard onNavigate={setActiveTab} />
        </TabsContent>

        <TabsContent value="ig-insights" className="mt-4">
          <InstagramInsights />
        </TabsContent>

        <TabsContent value="scripts" className="mt-4">
          <ScriptBuilder />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <ContentCalendar />
        </TabsContent>

        <TabsContent value="generator" className="mt-4">
          <EnhancedGenerator onGenerateScript={handleGenerateScript} />
        </TabsContent>

        <TabsContent value="library" className="mt-4">
          <ContentLibrary onNavigateToGenerator={() => setActiveTab("generator")} />
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <TrendScanner platform="instagram" onGenerateFromTrend={(idea) => setActiveTab("generator")} />
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <CommentCoach />
        </TabsContent>

        <TabsContent value="collabs" className="mt-4">
          <CollabFinder />
        </TabsContent>

        <TabsContent value="growth" className="mt-4">
          <GrowthPlaybook />
        </TabsContent>

        <TabsContent value="competitors" className="mt-4">
          <CompetitorAnalysis />
        </TabsContent>

        <TabsContent value="brand-voice" className="mt-4">
          <BrandVoiceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
