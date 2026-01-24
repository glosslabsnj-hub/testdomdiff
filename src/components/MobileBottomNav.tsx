import { Link, useLocation } from "react-router-dom";
import { Home, Dumbbell, Clock, TrendingUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Dumbbell, label: "Workouts", href: "/dashboard/workouts" },
  { icon: Clock, label: "Discipline", href: "/dashboard/discipline" },
  { icon: TrendingUp, label: "Progress", href: "/dashboard/progress" },
  { icon: Shield, label: "Warden", href: "#warden", isAction: true },
];

export function MobileBottomNav() {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const handleWardenClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-warden-chat'));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-charcoal-dark border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard" 
            ? location.pathname === "/dashboard"
            : location.pathname.startsWith(item.href) && item.href !== "/dashboard";
          
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.label}
                onClick={handleWardenClick}
                className="flex flex-col items-center justify-center flex-1 py-2 group"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  "bg-gold text-charcoal-dark shadow-lg"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href}
              className="flex flex-col items-center justify-center flex-1 py-2 group"
            >
              <Icon className={cn(
                "w-6 h-6 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <span className={cn(
                "text-xs mt-1 transition-colors",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
