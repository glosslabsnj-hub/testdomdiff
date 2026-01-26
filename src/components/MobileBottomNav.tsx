import { Link, useLocation } from "react-router-dom";
import { Home, Dumbbell, Clock, TrendingUp, Shield, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

export function MobileBottomNav() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { subscription } = useAuth();
  
  const planType = subscription?.plan_type;
  const isCoaching = planType === "coaching";
  const isTransformation = planType === "transformation";
  const isMembership = planType === "membership";

  if (!isMobile) return null;

  // Tier-aware workout destination
  const getWorkoutDestination = () => {
    if (isMembership) {
      // Solitary: bodyweight templates only
      return { href: "/dashboard/workouts", label: "Iron Pile", icon: Dumbbell };
    } else if (isTransformation) {
      // Gen Pop: 12-week program is primary
      return { href: "/dashboard/program", label: "The Sentence", icon: Calendar };
    } else if (isCoaching) {
      // Coaching: personalized program
      return { href: "/dashboard/program", label: "Training", icon: Calendar };
    }
    // Default fallback
    return { href: "/dashboard/workouts", label: "Workouts", icon: Dumbbell };
  };

  const workoutNav = getWorkoutDestination();

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: workoutNav.icon, label: workoutNav.label, href: workoutNav.href },
    { icon: Clock, label: isCoaching ? "Structure" : "Discipline", href: "/dashboard/discipline" },
    { icon: TrendingUp, label: "Progress", href: "/dashboard/progress" },
    { icon: Shield, label: "Warden", href: "#warden", isAction: true },
  ];

  const handleWardenClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-warden-chat'));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-charcoal-dark/95 backdrop-blur-sm border-t border-border pb-[env(safe-area-inset-bottom)]">
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
