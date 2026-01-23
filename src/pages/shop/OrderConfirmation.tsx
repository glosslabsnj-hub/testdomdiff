import { Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const OrderConfirmation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="section-container py-20">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>

          <h1 className="headline-section mb-4">
            Order <span className="text-primary">Confirmed!</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase. You'll receive a confirmation email shortly with your order details.
          </p>

          <div className="bg-card p-6 rounded-lg border border-border mb-8">
            <div className="flex items-center justify-center gap-3 text-primary mb-4">
              <Package className="w-6 h-6" />
              <span className="font-semibold">What's Next?</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li>• You'll receive an email confirmation within a few minutes</li>
              <li>• Your order will be processed within 1-2 business days</li>
              <li>• Shipping confirmation with tracking will be sent when your order ships</li>
              <li>• Expected delivery: 3-5 business days after shipping</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" asChild>
              <Link to="/shop" className="gap-2">
                Continue Shopping
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="goldOutline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
