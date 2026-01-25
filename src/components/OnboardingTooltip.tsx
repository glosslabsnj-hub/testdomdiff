import { useEffect, useState } from "react";
import { X, Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingTooltips, ONBOARDING_TOOLTIPS } from "@/hooks/useOnboardingTooltips";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingTooltipProps {
  tooltipId: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  children?: React.ReactNode;
}

export function OnboardingTooltip({ 
  tooltipId, 
  position = "bottom",
  className,
  children 
}: OnboardingTooltipProps) {
  const { isTooltipDismissed, dismissTooltip, dismissAllTooltips } = useOnboardingTooltips();
  const [isVisible, setIsVisible] = useState(false);
  
  const tooltip = ONBOARDING_TOOLTIPS[tooltipId];
  
  useEffect(() => {
    // Show tooltip after a short delay if not dismissed
    if (!isTooltipDismissed(tooltipId)) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tooltipId, isTooltipDismissed]);
  
  if (!tooltip || isTooltipDismissed(tooltipId)) {
    return <>{children}</>;
  }
  
  const handleDismiss = () => {
    setIsVisible(false);
    dismissTooltip(tooltipId);
  };
  
  const handleDismissAll = () => {
    setIsVisible(false);
    dismissAllTooltips();
  };
  
  const positionClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };
  
  const arrowClasses = {
    top: "bottom-[-6px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-primary",
    bottom: "top-[-6px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-primary",
    left: "right-[-6px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-primary",
    right: "left-[-6px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-primary",
  };
  
  return (
    <div className={cn("relative inline-block", className)}>
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute z-50 w-72 p-4 rounded-lg shadow-xl",
              "bg-primary text-primary-foreground border border-primary",
              positionClasses[position]
            )}
          >
            {/* Arrow */}
            <div 
              className={cn(
                "absolute w-0 h-0 border-[6px]",
                arrowClasses[position]
              )} 
            />
            
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
              aria-label="Dismiss tooltip"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Content */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="flex-1 pr-4">
                <h4 className="font-semibold text-sm mb-1">{tooltip.title}</h4>
                <p className="text-xs opacity-90 leading-relaxed">{tooltip.description}</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-primary-foreground/20">
              <button
                onClick={handleDismissAll}
                className="text-xs opacity-70 hover:opacity-100 transition-opacity"
              >
                Don't show tips
              </button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDismiss}
                className="h-7 text-xs gap-1"
              >
                Got it
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OnboardingTooltip;
