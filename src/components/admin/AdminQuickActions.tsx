import { useState } from "react";
import { 
  Plus, 
  ClipboardCheck, 
  Users, 
  Package, 
  Dumbbell,
  BookOpen,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  tabValue: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Review Check-Ins",
    description: "New submissions waiting",
    icon: ClipboardCheck,
    tabValue: "checkins",
    color: "text-green-400",
  },
  {
    label: "View Clients",
    description: "Manage member roster",
    icon: Users,
    tabValue: "clients",
    color: "text-blue-400",
  },
  {
    label: "Add Product",
    description: "Add to commissary",
    icon: Package,
    tabValue: "products",
    color: "text-primary",
  },
  {
    label: "Edit Workouts",
    description: "Update training content",
    icon: Dumbbell,
    tabValue: "content",
    color: "text-purple-400",
  },
];

interface AdminQuickActionsProps {
  onNavigate: (tabValue: string) => void;
  pendingCheckIns?: number;
}

export default function AdminQuickActions({ onNavigate, pendingCheckIns = 0 }: AdminQuickActionsProps) {
  return (
    <Card className="bg-charcoal border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.tabValue}
              onClick={() => onNavigate(action.tabValue)}
              className="flex flex-col items-center p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              <action.icon className={`w-6 h-6 ${action.color} mb-2 group-hover:scale-110 transition-transform`} />
              <span className="text-sm font-medium text-center">{action.label}</span>
              <span className="text-xs text-muted-foreground text-center mt-0.5">
                {action.tabValue === "checkins" && pendingCheckIns > 0
                  ? `${pendingCheckIns} pending`
                  : action.description}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
