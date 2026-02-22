import { useState } from "react";
import {
  Flame,
  LayoutDashboard,
  CalendarDays,
  Globe,
  Sparkles,
  Library,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useSocialCommand } from "@/hooks/useSocialCommand";
import ContentStrategyOnboarding from "./ContentStrategyOnboarding";
import SocialCommandDashboard from "./SocialCommandDashboard";
import ContentCalendar from "./ContentCalendar";
import PlatformDashboard from "./PlatformDashboard";
import EnhancedGenerator from "./EnhancedGenerator";
import ContentLibrary from "./ContentLibrary";

const TABS = [
  { value: "dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { value: "calendar", label: "Calendar", shortLabel: "Cal", icon: CalendarDays },
  { value: "platforms", label: "Platforms", shortLabel: "Plat", icon: Globe },
  { value: "generator", label: "Generator", shortLabel: "Gen", icon: Sparkles },
  { value: "library", label: "Library", shortLabel: "Lib", icon: Library },
];

export default function SocialCommandCenter() {
  const { isLoading, onboardingCompleted, config } = useSocialCommand();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    );
  }

  // Show onboarding if not completed
  if (!onboardingCompleted && !showOnboarding && !config) {
    setShowOnboarding(true);
  }

  if (showOnboarding && !onboardingCompleted) {
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-400" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Social Command Center</h2>
          <p className="text-xs text-muted-foreground">Strategy-driven content that grows the brand.</p>
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

        <TabsContent value="calendar" className="mt-4">
          <ContentCalendar />
        </TabsContent>

        <TabsContent value="platforms" className="mt-4">
          <PlatformDashboard />
        </TabsContent>

        <TabsContent value="generator" className="mt-4">
          <EnhancedGenerator />
        </TabsContent>

        <TabsContent value="library" className="mt-4">
          <ContentLibrary onNavigateToGenerator={() => setActiveTab("generator")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
