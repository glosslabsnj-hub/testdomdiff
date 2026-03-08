import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function NotificationPrompt() {
  const { isSupported, isSubscribed, isLoading, subscribe, permission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("notificationPromptDismissed");
    if (stored) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("notificationPromptDismissed", "true");
  };

  // Don't show if: not supported, already subscribed, already dismissed, or denied
  if (!isSupported || isSubscribed || dismissed || permission === "denied") return null;

  return (
    <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">Never Miss Reveille</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Get morning and evening reminders for your discipline routines, workout days, and weekly check-ins.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="gold"
                onClick={subscribe}
                disabled={isLoading}
                className="gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                Enable Notifications
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-muted-foreground"
              >
                Not Now
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
