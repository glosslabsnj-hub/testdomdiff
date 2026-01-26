import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StickyMobileFooterProps {
  children: ReactNode;
  className?: string;
  /** Show border on top (default: true) */
  showBorder?: boolean;
}

/**
 * Mobile-sticky CTA wrapper that sticks to bottom on mobile
 * but remains inline on desktop. Respects safe area insets.
 */
export default function StickyMobileFooter({ 
  children, 
  className,
  showBorder = true 
}: StickyMobileFooterProps) {
  return (
    <div
      className={cn(
        // Mobile: fixed bottom, with safe area padding
        "fixed bottom-0 left-0 right-0 z-40",
        "p-4 bg-background/95 backdrop-blur-sm",
        "pb-[calc(1rem+env(safe-area-inset-bottom))]",
        showBorder && "border-t border-border",
        // Desktop: revert to normal flow
        "md:relative md:bottom-auto md:z-auto",
        "md:p-0 md:bg-transparent md:border-0 md:backdrop-blur-none",
        "md:pb-0",
        className
      )}
    >
      {children}
    </div>
  );
}
