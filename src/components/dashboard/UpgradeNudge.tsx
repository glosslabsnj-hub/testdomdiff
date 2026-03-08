import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const nudgeMessages: Record<string, { headline: string; body: string }> = {
  streak_7: {
    headline: "7 Days Strong",
    body: "7 days of discipline. You're ready for the full program. Upgrade to Gen Pop.",
  },
  workouts_7: {
    headline: "7 Workouts Complete",
    body: "7 workouts done. You've proven the commitment. Unlock The Sentence.",
  },
  checkins_3: {
    headline: "Consistency Proven",
    body: "3 check-ins submitted. You're consistent. Time for structured progression.",
  },
  week_2: {
    headline: "Week 2 Already",
    body: "Week 2 already. Imagine where you'd be with the full 12-week Sentence.",
  },
};

interface UpgradeNudgeProps {
  trigger: string;
  className?: string;
}

export function UpgradeNudge({ trigger, className }: UpgradeNudgeProps) {
  const { isMembership } = useEffectiveSubscription();
  const [dismissed, setDismissed] = useState(false);

  const storageKey = `upgradeNudge_${trigger}_dismissed`;

  useEffect(() => {
    const val = localStorage.getItem(storageKey);
    if (val) {
      setDismissed(true);
    }
  }, [storageKey]);

  if (!isMembership) return null;
  if (dismissed) return null;

  const nudge = nudgeMessages[trigger];
  if (!nudge) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(storageKey, new Date().toISOString());
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative overflow-hidden rounded-lg border p-4",
          "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
          "border-primary/40",
          className
        )}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-primary/50 hover:text-primary transition-colors"
          aria-label="Dismiss nudge"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary mb-0.5">{nudge.headline}</p>
            <p className="text-sm text-muted-foreground mb-3">{nudge.body}</p>
            <Button variant="gold" size="sm" asChild>
              <Link to="/checkout?plan=transformation" className="gap-1.5">
                Upgrade to Gen Pop
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default UpgradeNudge;
