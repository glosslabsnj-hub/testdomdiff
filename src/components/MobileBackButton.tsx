import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

export function MobileBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Only show on detail pages (not the main dashboard)
  const isDashboardHome = location.pathname === "/dashboard";
  const isDetailPage = location.pathname.startsWith("/dashboard/") && !isDashboardHome;

  if (!isMobile || !isDetailPage) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: -20 }}
        transition={{ duration: 0.2 }}
        onClick={() => navigate("/dashboard")}
        className={cn(
          "fixed z-50 flex items-center justify-center",
          "w-11 h-11 rounded-full",
          "bg-charcoal/95 backdrop-blur-sm border border-border/50",
          "text-muted-foreground hover:text-foreground shadow-lg",
          "active:scale-95 transition-all",
          "left-3 bottom-[calc(5rem+env(safe-area-inset-bottom))]"
        )}
        aria-label="Back to Dashboard"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>
    </AnimatePresence>
  );
}

export default MobileBackButton;
