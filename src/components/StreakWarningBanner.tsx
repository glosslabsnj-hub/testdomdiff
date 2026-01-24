import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, X, Flame, ChevronRight } from "lucide-react";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { cn } from "@/lib/utils";

export function StreakWarningBanner() {
  const { streak, getTodayCompliance, loading } = useDailyDiscipline();
  const [dismissed, setDismissed] = useState(false);
  const [isAfternoon, setIsAfternoon] = useState(false);
  
  // Check if it's after 6pm
  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsAfternoon(hour >= 18); // 6pm or later
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);
  
  // Reset dismissed state at midnight
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      setDismissed(false);
    }, msUntilMidnight);
    
    return () => clearTimeout(timeout);
  }, []);
  
  if (loading || dismissed) return null;
  
  const compliance = getTodayCompliance();
  const isAtRisk = isAfternoon && compliance.percent < 100 && streak > 0;
  
  if (!isAtRisk) return null;
  
  const remainingTasks = compliance.total - compliance.completed;
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border p-4 mb-6",
      "bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5",
      "border-amber-500/40",
      "animate-fade-in"
    )}>
      {/* Animated fire glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent animate-pulse-subtle pointer-events-none" />
      
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-amber-400/60 hover:text-amber-400 transition-colors"
        aria-label="Dismiss warning"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-4 pr-8">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <Flame className="w-5 h-5 text-amber-400 animate-flame" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-amber-300">
              Your {streak} Day Streak is at Risk!
            </h3>
          </div>
          <p className="text-sm text-amber-200/80 mb-3">
            {remainingTasks === 1 
              ? "You have 1 task left to complete today. Don't break the chain!"
              : `You have ${remainingTasks} tasks left to complete today. Lock in before lights out.`
            }
          </p>
          <Link
            to="/dashboard/discipline"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-300 hover:text-amber-200 transition-colors group"
          >
            Complete Your Routines
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StreakWarningBanner;
