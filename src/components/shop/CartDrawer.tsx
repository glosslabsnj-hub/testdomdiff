import { Link } from "react-router-dom";
import { ShoppingBag, X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";

// Import product images for fallback
import hoodieImage from "@/assets/products/hoodie.jpg";
import teeImage from "@/assets/products/tee.jpg";
import joggersImage from "@/assets/products/joggers.jpg";
import beanieImage from "@/assets/products/beanie.jpg";

const getProductImage = (productName: string, dbImageUrl: string | null): string => {
  if (dbImageUrl) return dbImageUrl;
  const nameLower = productName.toLowerCase();
  if (nameLower.includes("hoodie") || nameLower.includes("sweatshirt")) return hoodieImage;
  if (nameLower.includes("tee") || nameLower.includes("t-shirt")) return teeImage;
  if (nameLower.includes("jogger") || nameLower.includes("sweatpants")) return joggersImage;
  if (nameLower.includes("beanie") || nameLower.includes("hat")) return beanieImage;
  return "";
};

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, itemCount, subtotal, isOpen, setIsOpen } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-lg bg-background border-border flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Your Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">Your cart is empty</p>
            <p className="text-muted-foreground mb-6">Add some gear to get started</p>
            <Button variant="gold" onClick={() => setIsOpen(false)} asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => {
                  const imageUrl = getProductImage(item.product.name, item.product.image_url);
                  return (
                    <div
                      key={`${item.product.id}-${item.size}`}
                      className="flex gap-4 p-4 bg-charcoal rounded-lg border border-border"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                        <p className="text-sm font-semibold text-primary mt-1">
                          ${item.product.price.toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.product.id, item.size, item.quantity - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.product.id, item.size, item.quantity + 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive ml-auto"
                            onClick={() => removeItem(item.product.id, item.size)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="gold" className="w-full" asChild>
                  <Link to="/shop/checkout" onClick={() => setIsOpen(false)}>
                    Proceed to Checkout
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
