import { useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { GlobalQuickAction } from "@/components/GlobalQuickAction";
import { WardenChat } from "@/components/warden/WardenChat";

/**
 * FloatingActionStack manages the positioning of multiple FABs
 * (Quick Actions + Warden) to prevent overlap, especially on mobile.
 * 
 * Desktop: Stacked vertically (Quick Actions above Warden)
 * Mobile: Side by side when collapsed, single visible when expanded
 */
export function FloatingActionStack() {
  const { user, subscription } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [quickActionExpanded, setQuickActionExpanded] = useState(false);

  // Don't show FABs on admin pages (they obstruct admin controls)
  const isAdminPage = location.pathname.startsWith("/admin");
  if (isAdminPage) {
    return null;
  }

  // Don't show Quick Actions on the discipline page (it has its own FAB)
  const isDisciplinePage = location.pathname.startsWith("/dashboard/discipline");

  // Only show for authenticated users with subscription
  if (!user || !subscription) {
    return <WardenChat />;
  }

  // Mobile layout: Stack Quick Actions ABOVE Warden (no overlap)
  if (isMobile) {
    return (
      <>
        {/* Quick Action - positioned ABOVE Warden on mobile (hidden on discipline page) */}
        {!isDisciplinePage && (
          <div
            className={cn(
              "fixed z-40 transition-all duration-300",
              quickActionExpanded
                ? "bottom-36 right-4 left-4" // Expanded: full width, above Warden
                : "bottom-36 right-4"        // Collapsed: small pill, above Warden
            )}
          >
            <GlobalQuickAction
              compact={!quickActionExpanded}
              onExpandChange={setQuickActionExpanded}
              className={quickActionExpanded ? "w-full" : ""}
            />
          </div>
        )}

        {/* Warden - bottom right (default position, never moves) */}
        <WardenChat />
      </>
    );
  }

  // Desktop layout: vertical stacking
  return (
    <>
      {/* Quick Actions - positioned above Warden (hidden on discipline page) */}
      {!isDisciplinePage && (
        <div
          className={cn(
            "fixed z-50 transition-all duration-300",
            "bottom-20 right-6"
          )}
        >
          <GlobalQuickAction
            compact={false}
            onExpandChange={setQuickActionExpanded}
          />
        </div>
      )}

      {/* Warden - bottom right */}
      <WardenChat />
    </>
  );
}

export default FloatingActionStack;
