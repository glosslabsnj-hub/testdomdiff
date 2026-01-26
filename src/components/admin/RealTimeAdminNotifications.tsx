import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, UserPlus, CreditCard, ClipboardCheck } from "lucide-react";

interface Notification {
  id: string;
  type: "signup" | "subscription" | "checkin";
  message: string;
  timestamp: Date;
}

export function useAdminRealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to new profiles (signups)
    const profilesChannel = supabase
      .channel("admin-profiles")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        (payload) => {
          const profile = payload.new as any;
          const notification: Notification = {
            id: `profile-${profile.id}`,
            type: "signup",
            message: `New signup: ${profile.first_name || profile.email || "New user"}`,
            timestamp: new Date(),
          };
          setNotifications((prev) => [notification, ...prev].slice(0, 20));
          toast({
            title: "New Signup!",
            description: notification.message,
          });
        }
      )
      .subscribe();

    // Subscribe to new subscriptions
    const subscriptionsChannel = supabase
      .channel("admin-subscriptions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "subscriptions" },
        (payload) => {
          const sub = payload.new as any;
          const planName = sub.plan_type === "coaching" ? "Free World" :
            sub.plan_type === "transformation" ? "Gen Pop" : "Solitary";
          const notification: Notification = {
            id: `sub-${sub.id}`,
            type: "subscription",
            message: `New ${planName} subscription`,
            timestamp: new Date(),
          };
          setNotifications((prev) => [notification, ...prev].slice(0, 20));
          toast({
            title: "New Subscription! 💰",
            description: notification.message,
          });
        }
      )
      .subscribe();

    // Subscribe to new check-ins
    const checkInsChannel = supabase
      .channel("admin-checkins")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "check_ins" },
        (payload) => {
          const checkIn = payload.new as any;
          const notification: Notification = {
            id: `checkin-${checkIn.id}`,
            type: "checkin",
            message: `Week ${checkIn.week_number} check-in submitted`,
            timestamp: new Date(),
          };
          setNotifications((prev) => [notification, ...prev].slice(0, 20));
          toast({
            title: "New Check-In",
            description: notification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(subscriptionsChannel);
      supabase.removeChannel(checkInsChannel);
    };
  }, [toast]);

  const clearNotifications = () => setNotifications([]);

  return { notifications, clearNotifications };
}

// Icon component for notification types
export function NotificationIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "signup":
      return <UserPlus className="h-4 w-4 text-primary" />;
    case "subscription":
      return <CreditCard className="h-4 w-4 text-green-400" />;
    case "checkin":
      return <ClipboardCheck className="h-4 w-4 text-blue-400" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}
