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
      <TabsList className="bg-charcoal border border-border h-auto gap-1 p-1 w-full sm:w-auto">
        <TabsTrigger value="products" className="text-xs sm:text-sm px-3 sm:px-4 min-h-[44px] flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial">
          <Package className="h-4 w-4 flex-shrink-0" />
          <span>Products</span>
          <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs px-1.5 sm:px-2">
            {activeProducts}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="orders" className="text-xs sm:text-sm px-3 sm:px-4 min-h-[44px] flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial">
          <ShoppingBag className="h-4 w-4 flex-shrink-0" />
          <span>Orders</span>
          {pendingOrders > 0 && (
            <Badge className="ml-1 sm:ml-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] sm:text-xs px-1.5 sm:px-2">
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
