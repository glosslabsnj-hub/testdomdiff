import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ServedStampProps {
  show: boolean;
  onComplete?: () => void;
  className?: string;
}

/**
 * "SERVED" stamp animation that slams onto completed workout cards.
 * Reinforces the prison document theme.
 */
export function ServedStamp({ show, onComplete, className }: ServedStampProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && !isVisible) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Animation completes after 600ms
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [show, isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "relative transform",
          isAnimating 
            ? "animate-stamp-slam" 
            : "rotate-[-12deg] scale-100 opacity-90"
        )}
      >
        {/* Stamp container */}
        <div className="relative">
          {/* Outer border - rougher edge */}
          <div 
            className={cn(
              "px-6 py-3 border-4 border-destructive rounded-sm",
              "bg-destructive/10",
              // Slightly irregular edges for authenticity
              "[clip-path:polygon(2%_0%,98%_1%,100%_3%,99%_97%,97%_100%,3%_99%,0%_96%,1%_3%)]"
            )}
          >
            {/* Inner text */}
            <span 
              className={cn(
                "font-display text-3xl md:text-4xl font-bold text-destructive tracking-[0.2em] uppercase",
                // Slightly distressed text effect
                "[text-shadow:1px_1px_0px_rgba(220,38,38,0.3),-1px_-1px_0px_rgba(220,38,38,0.2)]"
              )}
            >
              SERVED
            </span>
          </div>
          
          {/* Ink splatter effect */}
          {isAnimating && (
            <div className="absolute inset-0 animate-ink-splatter">
              <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/20 blur-xl" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServedStamp;
