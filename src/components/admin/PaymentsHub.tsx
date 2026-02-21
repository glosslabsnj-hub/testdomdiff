import { useState } from "react";
import { format } from "date-fns";
import { 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  RefreshCw,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useClientAnalytics } from "@/hooks/useClientAnalytics";
import { useOrders } from "@/hooks/useOrders";

const TIER_PRICES = {
  membership: 49.99,
  transformation: 379.99,
  coaching: 999.99,
};

export default function PaymentsHub() {
  const [revenueExpanded, setRevenueExpanded] = useState(false);
  const { analytics, loading: clientsLoading } = useClientAnalytics({});
  const { orders, loading: ordersLoading } = useOrders();

  // Calculate revenue metrics
  const membershipCount = analytics?.clientsByPlan.membership || 0;
  const transformationCount = analytics?.clientsByPlan.transformation || 0;
  const coachingCount = analytics?.clientsByPlan.coaching || 0;

  // Recurring revenue (membership + coaching are monthly)
  const membershipMRR = membershipCount * TIER_PRICES.membership;
  const coachingMRR = coachingCount * TIER_PRICES.coaching;
  const totalMRR = membershipMRR + coachingMRR;

  // One-time revenue from transformation (not recurring — counted separately)
  const transformationTotal = transformationCount * TIER_PRICES.transformation;

  // Recent orders as transactions
  const recentOrders = orders?.slice(0, 10) || [];
  const failedOrders = recentOrders.filter(o => o.status === "failed");

  // Calculate 30-day one-time revenue (approximation from orders)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentPaidOrders = orders?.filter(
    o => o.status === "paid" && new Date(o.created_at) >= thirtyDaysAgo
  ) || [];
  const oneTimeRevenue30Days = recentPaidOrders.reduce((sum, o) => sum + o.total, 0);

  const handleExportCSV = () => {
    // Generate CSV from orders
    const csvContent = [
      ["Date", "User", "Amount", "Type", "Status"].join(","),
      ...(orders || []).map(o => [
        format(new Date(o.created_at), "yyyy-MM-dd"),
        o.email,
        `$${o.total.toFixed(2)}`,
        "Order",
        o.status,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Payments & Revenue</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track monthly recurring revenue, payment history, and billing status.
        </p>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Collapsible open={revenueExpanded} onOpenChange={setRevenueExpanded}>
          <CollapsibleTrigger asChild>
            <Card className="bg-charcoal border-border cursor-pointer hover:bg-muted/20 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Est. Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {clientsLoading ? "..." : `$${totalMRR.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Click to expand</p>
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <Card className="bg-muted/30 border-border">
              <CardContent className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-400">Solitary ({membershipCount})</span>
                  <span className="font-medium">${membershipMRR.toFixed(2)}/mo</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary">Gen Pop ({transformationCount})</span>
                  <span className="font-medium">${transformationTotal.toFixed(0)} total (one-time)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-400">Free World ({coachingCount})</span>
                  <span className="font-medium">${coachingMRR.toFixed(2)}/mo</span>
                </div>
                <div className="border-t border-border pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Recurring MRR</span>
                    <span className="text-green-400">${totalMRR.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Annual Projection (recurring)</span>
                    <span className="text-green-400">${(totalMRR * 12).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              One-Time (30 day)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {ordersLoading ? "..." : `$${oneTimeRevenue30Days.toFixed(0)}`}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refunds (30 day)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">$0</div>
            <p className="text-xs text-muted-foreground mt-1">No refunds</p>
          </CardContent>
        </Card>

        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Failed Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {failedOrders.length}
            </div>
            {failedOrders.length > 0 && (
              <p className="text-xs text-destructive mt-1">Requires attention</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals */}
      <Card className="bg-charcoal border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Renewals (next 7 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Renewal tracking requires Stripe webhook integration. Active subscription counts shown above.
          </p>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-charcoal border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <CardDescription>Latest orders and payments</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No transactions yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order.id} className="border-border">
                      <TableCell className="text-sm">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.first_name || order.email.split("@")[0]}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        ${order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          Order
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.status === "paid" ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Paid
                          </Badge>
                        ) : order.status === "failed" ? (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{order.status}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
