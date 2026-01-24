import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ScrollToTop from "@/components/ScrollToTop";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { WardenChat } from "@/components/warden";
import CartDrawer from "@/components/shop/CartDrawer";
import AnimatedRoutes from "@/components/AnimatedRoutes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Vignette overlay for cell block atmosphere */}
      <div className="vignette-overlay" aria-hidden="true" />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop behavior="smooth" />
        <AuthProvider>
          <CartProvider>
            <AnimatedRoutes />
            <CartDrawer />
            {/* ChatWidget for public visitors, WardenChat for logged-in users */}
            <ChatWidget />
            <WardenChat />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
