import { useState } from "react";
import { 
  ClipboardCheck, 
  Users, 
  Package, 
  Dumbbell,
  TrendingUp,
  Bell,
  Camera,
  Loader2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [sendingNotification, setSendingNotification] = useState<string | null>(null);
  const [sentNotifications, setSentNotifications] = useState<Set<string>>(new Set());

  const sendNotification = async (type: "check_in_reminder" | "photo_reminder") => {
    setSendingNotification(type);
    try {
      const { data, error } = await supabase.functions.invoke("send-notifications", {
        body: { type },
      });

      if (error) throw error;

      toast({
        title: "Notifications Sent",
        description: data.message || `${type.replace("_", " ")} notifications sent successfully.`,
      });
      
      setSentNotifications(prev => new Set([...prev, type]));
      
      // Reset the sent status after 5 seconds
      setTimeout(() => {
        setSentNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(type);
          return newSet;
        });
      }, 5000);
    } catch (error: any) {
      console.error("Failed to send notifications:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notifications.",
        variant: "destructive",
      });
    } finally {
      setSendingNotification(null);
    }
  };

  return (
    <Card className="bg-charcoal border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Navigation Actions */}
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

        {/* Notification Triggers */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Manual Notifications
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => sendNotification("check_in_reminder")}
              disabled={sendingNotification !== null}
            >
              {sendingNotification === "check_in_reminder" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : sentNotifications.has("check_in_reminder") ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <ClipboardCheck className="w-4 h-4 mr-2" />
              )}
              Check-In Reminders
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => sendNotification("photo_reminder")}
              disabled={sendingNotification !== null}
            >
              {sendingNotification === "photo_reminder" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : sentNotifications.has("photo_reminder") ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              Photo Reminders
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Automated notifications run weekly. Use these buttons to trigger manually.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
