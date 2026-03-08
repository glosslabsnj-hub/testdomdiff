import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  navGroups,
  bottomNavItems,
  type AdminSection,
  type BadgeCounts,
} from "./adminNavConfig";

interface AdminBottomNavProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  badges: BadgeCounts;
}

export default function AdminBottomNav({
  activeSection,
  onSectionChange,
  badges,
}: AdminBottomNavProps) {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  // Resolve the nav items from the shared config
  const allItems = navGroups.flatMap((g) => g.items);
  const items = bottomNavItems.map((id) => allItems.find((i) => i.id === id)!);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-charcoal-dark/95 backdrop-blur-sm border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className="flex flex-col items-center justify-center flex-1 py-2 relative active:scale-95 transition-transform"
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-3 h-3 bg-destructive rounded-full ring-2 ring-charcoal-dark" />
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] mt-0.5 transition-colors",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
