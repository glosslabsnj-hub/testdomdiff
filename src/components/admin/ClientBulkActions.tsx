import { useState } from "react";
import { 
  Download, 
  CheckSquare, 
  Square, 
  Loader2,
  UserX,
  UserCheck,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";

interface ClientBulkActionsProps {
  clients: ClientWithSubscription[];
  selectedIds: Set<string>;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRefresh: () => void;
}

export default function ClientBulkActions({
  clients,
  selectedIds,
  onSelectAll,
  onDeselectAll,
  onRefresh,
}: ClientBulkActionsProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedCount = selectedIds.size;
  const allSelected = selectedCount === clients.length && clients.length > 0;

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const selectedClients = clients.filter((c) => selectedIds.has(c.id));
      const dataToExport = selectedCount > 0 ? selectedClients : clients;

      // Create CSV content
      const headers = [
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Plan",
        "Status",
        "Started",
        "Days Remaining",
        "Goal",
        "Intake Completed",
      ];

      const rows = dataToExport.map((client) => [
        client.first_name || "",
        client.last_name || "",
        client.email || "",
        client.phone || "",
        client.activeSubscription?.plan_type || "None",
        client.activeSubscription?.status || "None",
        client.activeSubscription?.started_at 
          ? new Date(client.activeSubscription.started_at).toLocaleDateString() 
          : "",
        client.daysRemaining?.toString() || "",
        client.goal || "",
        client.intake_completed_at ? "Yes" : "No",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `clients_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Complete",
        description: `Exported ${dataToExport.length} clients to CSV.`,
      });
    } catch (e: any) {
      toast({
        title: "Export Failed",
        description: e.message || "Failed to export clients.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const updateSubscriptionStatus = async (newStatus: "active" | "cancelled" | "expired") => {
    if (selectedCount === 0) return;
    
    setIsUpdating(true);
    try {
      const selectedClients = clients.filter((c) => selectedIds.has(c.id));
      const subscriptionIds = selectedClients
        .map((c) => c.activeSubscription?.id)
        .filter(Boolean) as string[];

      if (subscriptionIds.length === 0) {
        toast({
          title: "No Subscriptions",
          description: "Selected clients don't have active subscriptions.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("subscriptions")
        .update({ status: newStatus })
        .in("id", subscriptionIds);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Updated ${subscriptionIds.length} subscriptions to ${newStatus}.`,
      });

      onRefresh();
      onDeselectAll();
    } catch (e: any) {
      toast({
        title: "Update Failed",
        description: e.message || "Failed to update subscriptions.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Select All Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={allSelected ? onDeselectAll : onSelectAll}
        className="text-xs"
      >
        {allSelected ? (
          <CheckSquare className="w-4 h-4 mr-2" />
        ) : (
          <Square className="w-4 h-4 mr-2" />
        )}
        {allSelected ? "Deselect All" : "Select All"}
      </Button>

      {/* Selection count badge */}
      {selectedCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {selectedCount} selected
        </Badge>
      )}

      {/* Export Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        disabled={isExporting}
        className="text-xs"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        Export CSV {selectedCount > 0 ? `(${selectedCount})` : "(All)"}
      </Button>

      {/* Bulk Actions Dropdown */}
      {selectedCount > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              className="text-xs"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => updateSubscriptionStatus("active")}>
              <UserCheck className="w-4 h-4 mr-2 text-green-500" />
              Set as Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateSubscriptionStatus("cancelled")}>
              <UserX className="w-4 h-4 mr-2 text-yellow-500" />
              Set as Cancelled
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => updateSubscriptionStatus("expired")}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Set as Expired
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
