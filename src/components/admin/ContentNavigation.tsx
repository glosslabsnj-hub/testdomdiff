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
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentSection {
  id: string;
  label: string;
  icon: React.ElementType;
  group: "training" | "lifestyle" | "growth";
}

const CONTENT_SECTIONS: ContentSection[] = [
  { id: "program", label: "12-Week Program", icon: Calendar, group: "training" },
  { id: "workouts", label: "Workout Templates", icon: Dumbbell, group: "training" },
  { id: "faith", label: "Faith Lessons", icon: Cross, group: "growth" },
  { id: "nutrition", label: "Nutrition Content", icon: Utensils, group: "lifestyle" },
  { id: "mealplans", label: "Meal Plans", icon: ChefHat, group: "lifestyle" },
  { id: "meal-analytics", label: "Meal Analytics", icon: BarChart3, group: "lifestyle" },
  { id: "discipline", label: "Discipline Routines", icon: Clock, group: "lifestyle" },
  { id: "skills", label: "Skill Lessons", icon: Briefcase, group: "growth" },
  { id: "welcome-videos", label: "Welcome Videos", icon: Video, group: "growth" },
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
  const groups = ["training", "lifestyle", "growth"];

  return (
    <div className="w-full md:w-56 flex-shrink-0 bg-charcoal border-r border-border">
      <div className="p-3 space-y-4">
        {groups.map((group) => (
          <div key={group}>
            <h3 className={cn("text-xs font-semibold uppercase tracking-wider mb-2 px-2", GROUP_LABELS[group].color)}>
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
