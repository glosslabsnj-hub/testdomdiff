import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureRow {
  feature: string;
  membership: boolean | "partial" | string;
  transformation: boolean | "partial" | string;
  coaching: boolean | "partial" | string;
  category?: string;
}

const features: FeatureRow[] = [
  // Workouts
  { feature: "Bodyweight Workout Templates", membership: true, transformation: true, coaching: true, category: "Workouts" },
  { feature: "Full Progressive Workout Library", membership: false, transformation: true, coaching: true },
  { feature: "12-Week Assigned Schedule", membership: false, transformation: true, coaching: true },
  { feature: "Weekly Video Coaching", membership: false, transformation: true, coaching: true },
  { feature: "Custom-Built Programming", membership: false, transformation: false, coaching: true },
  
  // Nutrition
  { feature: "Basic Nutrition Guidelines", membership: true, transformation: true, coaching: true, category: "Nutrition" },
  { feature: "Complete Nutrition Templates", membership: false, transformation: true, coaching: true },
  { feature: "Meal Planning Guides", membership: false, transformation: true, coaching: true },
  { feature: "Custom Nutrition Coaching", membership: false, transformation: false, coaching: true },
  
  // Skill-Building
  { feature: "Skill-Building Lessons", membership: false, transformation: true, coaching: true, category: "Skill-Building" },
  { feature: "Advanced Hustle Training", membership: false, transformation: false, coaching: true },
  
  // Faith & Mindset
  { feature: "Faith + Mindset Lessons", membership: true, transformation: true, coaching: true, category: "Faith & Mindset" },
  { feature: "Weekly Scripture Focus", membership: true, transformation: true, coaching: true },
  { feature: "Daily Discipline Routines", membership: true, transformation: true, coaching: true },
  
  // Support & Access
  { feature: "Community Access", membership: true, transformation: true, coaching: true, category: "Support & Access" },
  { feature: "Weekly Check-In System", membership: true, transformation: true, coaching: true },
  { feature: "Progress Tracking", membership: true, transformation: true, coaching: true },
  { feature: "Direct Messaging to Dom", membership: false, transformation: false, coaching: true },
  { feature: "Weekly 1:1 Video Calls", membership: false, transformation: false, coaching: true },
  { feature: "Priority Support", membership: false, transformation: false, coaching: true },
];

const ValueCell = ({ value }: { value: boolean | "partial" | string }) => {
  if (value === true) {
    return <Check className="w-5 h-5 text-primary mx-auto" />;
  }
  if (value === false) {
    return <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />;
  }
  if (value === "partial") {
    return <Minus className="w-5 h-5 text-muted-foreground mx-auto" />;
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
                <span className="text-sm text-muted-foreground uppercase tracking-wider">Membership</span>
                <span className="text-primary font-display text-lg">$79.99</span>
                <span className="text-xs text-muted-foreground">/month</span>
              </div>
            </th>
            <th className="text-center py-4 px-4 min-w-[120px] bg-primary/5 border-x border-primary/20">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-primary uppercase tracking-wider font-bold">Most Popular</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider">Transformation</span>
                <span className="text-primary font-display text-lg">$749.99</span>
                <span className="text-xs text-muted-foreground">one-time</span>
              </div>
            </th>
            <th className="text-center py-4 px-4 min-w-[120px]">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm text-muted-foreground uppercase tracking-wider">Coaching</span>
                <span className="text-primary font-display text-lg">$1,250</span>
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
              <>
                {showCategory && (
                  <tr key={`cat-${row.category}`} className="bg-charcoal">
                    <td colSpan={4} className="py-3 px-4 text-sm font-bold text-primary uppercase tracking-wider">
                      {row.category}
                    </td>
                  </tr>
                )}
                <tr 
                  key={index}
                  className={cn(
                    "border-b border-border/50 hover:bg-charcoal/50 transition-colors",
                    index % 2 === 0 ? "bg-background" : "bg-charcoal/30"
                  )}
                >
                  <td className="py-3 px-4 text-sm">{row.feature}</td>
                  <td className="py-3 px-4 text-center">
                    <ValueCell value={row.membership} />
                  </td>
                  <td className="py-3 px-4 text-center bg-primary/5 border-x border-primary/10">
                    <ValueCell value={row.transformation} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <ValueCell value={row.coaching} />
                  </td>
                </tr>
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
