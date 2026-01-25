import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface FeatureRow {
  feature: string;
  solitary: boolean | string;
  genPop: boolean | string;
  freeWorld: boolean | string;
  category?: string;
}

const features: FeatureRow[] = [
  // Workouts
  { feature: "Bodyweight Workout Templates (4)", solitary: true, genPop: true, freeWorld: true, category: "Workouts" },
  { feature: "Full Progressive Workout Library", solitary: false, genPop: true, freeWorld: true },
  { feature: "Goal-Based 12-Week Schedule", solitary: false, genPop: true, freeWorld: true },
  { feature: "Weekly Video Coaching", solitary: false, genPop: true, freeWorld: true },
  { feature: "Elite Tailored Programming", solitary: false, genPop: false, freeWorld: true },
  
  // Nutrition
  { feature: "Basic Nutrition Template (1 fixed plan)", solitary: true, genPop: true, freeWorld: true, category: "Nutrition" },
  { feature: "Full Meal Plan Library", solitary: false, genPop: true, freeWorld: true },
  { feature: "TDEE-Matched Meal Planning", solitary: false, genPop: true, freeWorld: true },
  { feature: "Meal Swaps", solitary: false, genPop: true, freeWorld: true },
  { feature: "Custom Nutrition Coaching", solitary: false, genPop: false, freeWorld: true },
  
  // Skill-Building
  { feature: "Skill-Building Lessons", solitary: false, genPop: true, freeWorld: true, category: "Skill-Building" },
  { feature: "Advanced Hustle Training", solitary: false, genPop: false, freeWorld: true },
  
  // Faith & Mindset
  { feature: "Faith + Mindset Lessons", solitary: false, genPop: true, freeWorld: true, category: "Faith & Mindset" },
  { feature: "Weekly Scripture Focus", solitary: false, genPop: true, freeWorld: true },
  
  // Discipline & Accountability
  { feature: "Daily Discipline Routines", solitary: true, genPop: true, freeWorld: true, category: "Discipline & Accountability" },
  { feature: "Weekly Check-In System", solitary: true, genPop: true, freeWorld: true },
  { feature: "Progress Tracking", solitary: true, genPop: true, freeWorld: true },
  
  // Support & Community
  { feature: "Community Access (The Yard)", solitary: false, genPop: true, freeWorld: true, category: "Support & Community" },
  { feature: "Goal-Based Program Assignment", solitary: false, genPop: true, freeWorld: true },
  { feature: "Direct Messaging to Dom", solitary: false, genPop: false, freeWorld: true },
  { feature: "Weekly 1:1 Video Calls", solitary: false, genPop: false, freeWorld: true },
  { feature: "Priority Support", solitary: false, genPop: false, freeWorld: true },
];

const ValueCell = ({ value }: { value: boolean | string }) => {
  if (value === true) {
    return <Check className="w-5 h-5 text-primary mx-auto" />;
  }
  if (value === false) {
    return <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />;
  }
  return <span className="text-sm text-muted-foreground">{value}</span>;
};

export default function ProgramComparisonTable() {
  let currentCategory = "";

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-4 font-medium text-muted-foreground">Feature</th>
            <th className="text-center py-4 px-4 min-w-[120px]">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm text-muted-foreground uppercase tracking-wider">Solitary</span>
                <span className="text-primary font-display text-lg">$49.99</span>
                <span className="text-xs text-muted-foreground">/month</span>
              </div>
            </th>
            <th className="text-center py-4 px-4 min-w-[120px] bg-primary/5 border-x border-primary/20">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-primary uppercase tracking-wider font-bold">Most Popular</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider">Gen Pop</span>
                <span className="text-primary font-display text-lg">$379.99</span>
                <span className="text-xs text-muted-foreground">one-time</span>
              </div>
            </th>
            <th className="text-center py-4 px-4 min-w-[120px]">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-accent uppercase tracking-wider font-bold">10 Spots Only</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider">Free World</span>
                <span className="text-primary font-display text-lg">$999.99</span>
                <span className="text-xs text-muted-foreground">/month</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((row, index) => {
            const showCategory = row.category && row.category !== currentCategory;
            if (row.category) currentCategory = row.category;
            
            return (
              <React.Fragment key={index}>
                {showCategory && (
                  <tr className="bg-charcoal">
                    <td colSpan={4} className="py-3 px-4 text-sm font-bold text-primary uppercase tracking-wider">
                      {row.category}
                    </td>
                  </tr>
                )}
                <tr className={cn(
                  "border-b border-border/50 hover:bg-charcoal/50 transition-colors",
                  index % 2 === 0 ? "bg-background" : "bg-charcoal/30"
                )}>
                  <td className="py-3 px-4 text-sm">{row.feature}</td>
                  <td className="py-3 px-4 text-center">
                    <ValueCell value={row.solitary} />
                  </td>
                  <td className="py-3 px-4 text-center bg-primary/5 border-x border-primary/10">
                    <ValueCell value={row.genPop} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <ValueCell value={row.freeWorld} />
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
