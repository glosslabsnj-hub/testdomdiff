import { useState } from "react";
import { format } from "date-fns";
import { Package, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useOrders, Order } from "@/hooks/useOrders";

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "shipped", label: "Shipped", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "delivered", label: "Delivered", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

export default function OrdersManager() {
  const { orders, loading, updateOrderStatus } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUSES.find((s) => s.value === status);
    return (
      <Badge className={statusConfig?.color || "bg-muted text-muted-foreground"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="headline-card">Orders</h2>
          <p className="text-muted-foreground text-sm">
            {orders.length} total order{orders.length !== 1 && "s"}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="bg-charcoal border-border">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-charcoal rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-border">
                  <TableCell className="font-mono text-sm">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {order.first_name || order.last_name
                          ? `${order.first_name || ""} ${order.last_name || ""}`.trim()
                          : "Guest"}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.items.length} item{order.items.length !== 1 && "s"}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-[130px] h-8 bg-background border-border">
                        <SelectValue>{getStatusBadge(order.status)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(order.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDetail(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              Order #{selectedOrder?.id.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal">
                <span className="font-medium">Status</span>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => {
                    updateOrderStatus(selectedOrder.id, value);
                    setSelectedOrder({ ...selectedOrder, status: value });
                  }}
                >
                  <SelectTrigger className="w-[150px] bg-background border-border">
                    <SelectValue>{getStatusBadge(selectedOrder.status)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-primary uppercase tracking-wider">
                  Customer
                </h3>
                <div className="p-4 rounded-lg bg-charcoal space-y-1">
                  <p className="font-medium">
                    {selectedOrder.first_name || selectedOrder.last_name
                      ? `${selectedOrder.first_name || ""} ${selectedOrder.last_name || ""}`.trim()
                      : "Guest"}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-primary uppercase tracking-wider">
                  Shipping Address
                </h3>
                <div className="p-4 rounded-lg bg-charcoal">
                  <p>{selectedOrder.shipping_address.street || "—"}</p>
                  <p>
                    {[
                      selectedOrder.shipping_address.city,
                      selectedOrder.shipping_address.state,
                      selectedOrder.shipping_address.zip,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                  <p>{selectedOrder.shipping_address.country || ""}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-primary uppercase tracking-wider">
                  Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-charcoal"
                    >
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        {item.size && (
                          <p className="text-sm text-muted-foreground">
                            Size: {item.size}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.total_price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-primary uppercase tracking-wider">
                  Summary
                </h3>
                <div className="p-4 rounded-lg bg-charcoal space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${selectedOrder.shipping_cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-primary uppercase tracking-wider">
                    Notes
                  </h3>
                  <div className="p-4 rounded-lg bg-charcoal">
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                <p>
                  Created: {format(new Date(selectedOrder.created_at), "PPpp")}
                </p>
                <p>
                  Updated: {format(new Date(selectedOrder.updated_at), "PPpp")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
