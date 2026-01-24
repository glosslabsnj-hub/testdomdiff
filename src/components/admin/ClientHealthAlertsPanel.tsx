import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Scale,
  Dumbbell,
  Clock,
  CalendarX,
  User,
  Loader2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClientHealthAlerts, type ClientAlert } from "@/hooks/useClientHealthAlerts";

export default function ClientHealthAlertsPanel() {
  const { alerts, loading, getAlertCounts } = useClientHealthAlerts();
  const counts = getAlertCounts();

  const getAlertIcon = (type: ClientAlert["alert_type"]) => {
    switch (type) {
      case "missed_checkin":
        return <CalendarX className="h-4 w-4" />;
      case "weight_spike":
        return <Scale className="h-4 w-4" />;
      case "low_workouts":
        return <Dumbbell className="h-4 w-4" />;
      case "expiring_soon":
        return <Clock className="h-4 w-4" />;
      case "inactive":
        return <User className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityStyles = (severity: ClientAlert["severity"]) => {
    switch (severity) {
      case "high":
        return {
          badge: "bg-destructive/20 text-destructive border-destructive/30",
          icon: "text-destructive",
          bg: "bg-destructive/5 border-destructive/20",
        };
      case "medium":
        return {
          badge: "bg-warning/20 text-warning border-warning/30",
          icon: "text-warning",
          bg: "bg-warning/5 border-warning/20",
        };
      case "low":
        return {
          badge: "bg-muted text-muted-foreground border-border",
          icon: "text-muted-foreground",
          bg: "bg-muted/30 border-border",
        };
    }
  };

  const getInitials = (alert: ClientAlert) => {
    const first = alert.profile?.first_name?.[0] || "";
    const last = alert.profile?.last_name?.[0] || "";
    return (first + last).toUpperCase() || "??";
  };

  if (loading) {
    return (
      <Card className="bg-charcoal border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Client Health Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-charcoal border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Client Health Alerts
          </CardTitle>
          <div className="flex gap-2">
            {counts.high > 0 && (
              <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                {counts.high} Critical
              </Badge>
            )}
            {counts.medium > 0 && (
              <Badge className="bg-warning/20 text-warning border-warning/30">
                {counts.medium} Warning
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-10 w-10 mx-auto text-success mb-3" />
            <p className="text-muted-foreground">All clients are on track!</p>
            <p className="text-xs text-muted-foreground mt-1">No health alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {alerts.slice(0, 10).map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${styles.bg} transition-colors hover:bg-muted/40`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={alert.profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {getInitials(alert)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={styles.icon}>{getAlertIcon(alert.alert_type)}</span>
                        <p className="font-medium text-sm truncate">{alert.title}</p>
                        <Badge className={`${styles.badge} text-[10px] px-1.5 py-0`}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                    <Link
                      to={`/dashboard/messages?client=${alert.user_id}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
            {alerts.length > 10 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{alerts.length - 10} more alerts
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
