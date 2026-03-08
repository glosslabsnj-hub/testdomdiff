import { useState } from "react";
import {
  Calendar,
  Dumbbell,
  Cross,
  Utensils,
  ChefHat,
  Clock,
  Briefcase,
  Video,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Library,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ContentSection {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  group: "training" | "lifestyle" | "growth";
}

const CONTENT_SECTIONS: ContentSection[] = [
  { id: "program", label: "12-Week Program", shortLabel: "Program", icon: Calendar, group: "training" },
  { id: "workouts", label: "Workout Templates", shortLabel: "Workouts", icon: Dumbbell, group: "training" },
  { id: "freeworld-templates", label: "Free World Templates", shortLabel: "FW Templates", icon: Library, group: "training" },
  { id: "faith", label: "Faith Lessons", shortLabel: "Faith", icon: Cross, group: "growth" },
  { id: "nutrition", label: "Nutrition Content", shortLabel: "Nutrition", icon: Utensils, group: "lifestyle" },
  { id: "mealplans", label: "Meal Plans", shortLabel: "Meals", icon: ChefHat, group: "lifestyle" },
  { id: "meal-analytics", label: "Meal Analytics", shortLabel: "Analytics", icon: BarChart3, group: "lifestyle" },
  { id: "discipline", label: "Discipline Routines", shortLabel: "Discipline", icon: Clock, group: "lifestyle" },
  { id: "skills", label: "Skill Lessons", shortLabel: "Skills", icon: Briefcase, group: "growth" },
  { id: "welcome-videos", label: "Welcome Videos", shortLabel: "Videos", icon: Video, group: "growth" },
  { id: "tier-onboarding", label: "Tier Walkthroughs", shortLabel: "Onboarding", icon: Video, group: "growth" },
];

const GROUP_LABELS: Record<string, { label: string; color: string }> = {
  training: { label: "Training", color: "text-primary" },
  lifestyle: { label: "Lifestyle", color: "text-blue-400" },
  growth: { label: "Growth", color: "text-purple-400" },
};

interface ContentNavigationProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
}

export default function ContentNavigation({ activeSection, onSelectSection }: ContentNavigationProps) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentSection = CONTENT_SECTIONS.find((s) => s.id === activeSection);
  const CurrentIcon = currentSection?.icon || Dumbbell;

  // Mobile: dropdown + 3-column grid
  if (isMobile) {
    return (
      <div className="w-full">
        {/* Current section button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-charcoal border border-border text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className="w-4 h-4 text-primary" />
            <span>{currentSection?.label || "Select"}</span>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              mobileOpen && "rotate-180"
            )}
          />
        </button>

        {/* Expandable grid */}
        {mobileOpen && (
          <div className="mt-2 p-3 rounded-lg bg-charcoal border border-border">
            <div className="grid grid-cols-3 gap-2">
              {CONTENT_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      onSelectSection(section.id);
                      setMobileOpen(false);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-lg text-[11px] sm:text-xs transition-colors min-h-[60px] sm:min-h-[68px]",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-center leading-tight">{section.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop: sidebar
  const groups = ["training", "lifestyle", "growth"];
  return (
    <div className="w-56 flex-shrink-0 bg-charcoal border-r border-border">
      <div className="p-3 space-y-4">
        {groups.map((group) => (
          <div key={group}>
            <h3
              className={cn(
                "text-xs font-semibold uppercase tracking-wider mb-2 px-2",
                GROUP_LABELS[group].color
              )}
            >
              {GROUP_LABELS[group].label}
            </h3>
            <div className="space-y-1">
              {CONTENT_SECTIONS.filter((s) => s.group === group).map((section) => (
                <button
                  key={section.id}
                  onClick={() => onSelectSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left",
                    activeSection === section.id
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <section.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{section.label}</span>
                  {activeSection === section.id && (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { CONTENT_SECTIONS };
