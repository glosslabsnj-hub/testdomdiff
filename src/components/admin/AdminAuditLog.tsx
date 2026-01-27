import { useState } from "react";
import { format } from "date-fns";
import { 
  ScrollText, 
  Download, 
  Filter, 
  RefreshCw,
  User,
  Settings,
  Package,
  CreditCard,
  ClipboardCheck,
  FileText,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminAuditLog } from "@/hooks/useAdminAuditLog";

const ACTION_ICONS: Record<string, React.ElementType> = {
  user: User,
  subscription: CreditCard,
  content: FileText,
  product: Package,
  setting: Settings,
  check_in: ClipboardCheck,
  order: Package,
  intake: FileText,
};

const ACTION_COLORS: Record<string, string> = {
  user_upgrade: "text-green-400",
  user_downgrade: "text-yellow-400",
  user_deactivate: "text-red-400",
  user_reactivate: "text-green-400",
  subscription_cancel: "text-red-400",
  subscription_create: "text-green-400",
  subscription_modify: "text-blue-400",
  content_create: "text-green-400",
  content_update: "text-blue-400",
  content_delete: "text-red-400",
  product_create: "text-green-400",
  product_update: "text-blue-400",
  product_delete: "text-red-400",
  order_update: "text-blue-400",
  check_in_review: "text-green-400",
  settings_update: "text-blue-400",
  intake_review: "text-green-400",
};

export default function AdminAuditLog() {
  const [actionFilter, setActionFilter] = useState("all");
  const { logs, isLoading, error, refetch, getActionDescription } = useAdminAuditLog();

  const filteredLogs = logs?.filter(log => {
    if (actionFilter === "all") return true;
    return log.action_type.startsWith(actionFilter);
  }) || [];

  const handleExportLog = () => {
    const csvContent = [
      ["Timestamp", "Action", "Target Type", "Details"].join(","),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
        log.action_type,
        log.target_type || "",
        JSON.stringify(log.details || {}),
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Logs & Safety</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track admin actions and manage safety controls. All changes are logged.
        </p>
      </div>

      {/* Safety Notice */}
      <Card className="bg-yellow-500/10 border-yellow-500/30">
        <CardContent className="flex items-start gap-3 pt-4">
          <Shield className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-400">Safety Controls Active</h4>
            <p className="text-sm text-muted-foreground mt-1">
              All destructive actions (subscription cancellations, user deactivations, content deletions) 
              require explicit confirmation and are logged to this audit trail.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card className="bg-charcoal border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ScrollText className="h-4 w-4" />
              Admin Action Log
            </CardTitle>
            <CardDescription>
              Recent administrative actions and changes
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[140px] bg-background border-border">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="user">User Actions</SelectItem>
                <SelectItem value="subscription">Subscriptions</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportLog}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-destructive">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>Failed to load audit log</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No admin actions recorded yet</p>
                <p className="text-sm">Actions will appear here as you manage the platform.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log) => {
                  const Icon = ACTION_ICONS[log.target_type || "user"] || User;
                  const colorClass = ACTION_COLORS[log.action_type] || "text-muted-foreground";
                  
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`mt-0.5 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {getActionDescription(log)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {log.action_type.split("_")[0]}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Confirmation Modal Settings */}
      <Card className="bg-charcoal border-border">
        <CardHeader>
          <CardTitle className="text-base">Destructive Action Safeguards</CardTitle>
          <CardDescription>
            The following actions require explicit confirmation before execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { action: "Cancel Subscription", description: "Immediately revokes user access" },
              { action: "Deactivate User", description: "Disables user account" },
              { action: "Reset Progress", description: "Clears all user workout/nutrition data" },
              { action: "Delete Content", description: "Permanently removes content" },
              { action: "Delete Product", description: "Removes product from shop" },
              { action: "Change Tier Access", description: "Affects all users in that tier" },
            ].map((item) => (
              <div key={item.action} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
