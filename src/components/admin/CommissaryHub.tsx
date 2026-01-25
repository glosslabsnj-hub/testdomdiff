import { useState } from "react";
import { Package, ShoppingBag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ProductManager from "@/components/admin/ProductManager";
import OrdersManager from "@/components/admin/OrdersManager";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";

export default function CommissaryHub() {
  const [subTab, setSubTab] = useState("products");
  const { products } = useProducts(false);
  const { orders } = useOrders();

  const activeProducts = products?.filter(p => p.is_active).length || 0;
  const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;

  return (
    <Tabs value={subTab} onValueChange={setSubTab} className="space-y-4">
      <TabsList className="bg-charcoal border border-border h-auto gap-1 p-1">
        <TabsTrigger value="products" className="text-xs sm:text-sm px-3">
          <Package className="h-4 w-4 mr-2" />
          Products
          <Badge variant="secondary" className="ml-2 text-xs">
            {activeProducts}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="orders" className="text-xs sm:text-sm px-3">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Orders
          {pendingOrders > 0 && (
            <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
              {pendingOrders}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="products">
        <ProductManager />
      </TabsContent>

      <TabsContent value="orders">
        <OrdersManager />
      </TabsContent>
    </Tabs>
  );
}
