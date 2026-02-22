import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, CreditCard, Truck, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Import product images for cart display
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

const ShopCheckout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  const shippingCost = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shippingCost;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const requiredFields = ["email", "firstName", "lastName", "address", "city", "state", "zipCode"];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Build cart items for Stripe checkout
      const cartItems = items.map((item) => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        image_url: item.product.image_url,
      }));

      const { data, error } = await supabase.functions.invoke("stripe-create-merch-checkout", {
        body: {
          items: cartItems,
          email: formData.email,
          shipping: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
        },
      });

      if (error) throw new Error(error.message || "Failed to create checkout session");
      if (data?.error) throw new Error(data.error);

      // Redirect to Stripe-hosted checkout
      if (data?.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast({
        title: "Payment failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-20 text-center">
          <h1 className="headline-section mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Add some gear before checking out.</p>
          <Button variant="gold" asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="section-container py-12">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <h1 className="headline-section mb-8">
          <span className="text-primary">Checkout</span>
        </h1>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <h2 className="headline-card mb-4">Contact</h2>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  className="bg-charcoal"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <h2 className="headline-card mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      className="bg-charcoal"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      className="bg-charcoal"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    className="bg-charcoal"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      className="bg-charcoal"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      className="bg-charcoal"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>ZIP Code</Label>
                    <Input
                      className="bg-charcoal"
                      value={formData.zipCode}
                      onChange={(e) => handleChange("zipCode", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Secure Payment Notice */}
            <div className="bg-card p-6 rounded-lg border border-primary/30">
              <h2 className="headline-card mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment
              </h2>
              <div className="bg-charcoal p-4 rounded border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  You'll be redirected to Stripe's secure checkout to complete payment.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Redirecting to Stripe...
                </>
              ) : (
                `Complete Order - $${total.toFixed(2)}`
              )}
            </Button>
          </form>

          {/* Order Summary */}
          <div>
            <div className="bg-card p-6 rounded-lg border border-border sticky top-8">
              <h2 className="headline-card mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => {
                  const imageUrl = getProductImage(item.product.name, item.product.image_url);
                  return (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-4">
                      <div className="w-16 h-16 bg-charcoal rounded overflow-hidden flex-shrink-0">
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: {item.size} | Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-primary">
                    Free shipping on orders over $100
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Ships within 3-5 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ShopCheckout;
