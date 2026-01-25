import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminPreviewProvider } from "@/contexts/AdminPreviewContext";
import { CartProvider } from "@/contexts/CartContext";
import ScrollToTop from "@/components/ScrollToTop";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { FloatingActionStack } from "@/components/FloatingActionStack";
import CartDrawer from "@/components/shop/CartDrawer";
import AnimatedRoutes from "@/components/AnimatedRoutes";
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Vignette overlay for cell block atmosphere */}
        <div className="vignette-overlay" aria-hidden="true" />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop behavior="smooth" />
          <AuthProvider>
            <AdminPreviewProvider>
              <CartProvider>
                <AnimatedRoutes />
                <CartDrawer />
                {/* ChatWidget for public visitors, FloatingActionStack for logged-in users */}
                <ChatWidget />
                <FloatingActionStack />
              </CartProvider>
            </AdminPreviewProvider>
            </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
