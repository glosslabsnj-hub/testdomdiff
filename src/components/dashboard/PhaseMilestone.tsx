import { useState, useEffect } from "react";
import { Trophy, Flame, Star, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { fireVictoryConfetti } from "@/lib/confetti";
import { Link } from "react-router-dom";

interface PhaseConfig {
  key: string;
  title: string;
  subtitle: string;
  weeksCompleted: number;
  icon: typeof Trophy;
  iconColor: string;
  bgAccent: string;
}

const PHASES: PhaseConfig[] = [
  {
    key: "foundation",
    title: "Foundation Phase Complete!",
    subtitle: "You've built the base. The Build Phase awaits.",
    weeksCompleted: 4,
    icon: Star,
    iconColor: "text-yellow-400",
    bgAccent: "bg-yellow-500/20",
  },
  {
    key: "build",
    title: "Build Phase Complete!",
    subtitle: "You've forged strength. Peak Phase begins now.",
    weeksCompleted: 8,
    icon: Flame,
    iconColor: "text-orange-400",
    bgAccent: "bg-orange-500/20",
  },
];

export function PhaseMilestone() {
  const { subscription } = useEffectiveSubscription();
  const { streak } = useDailyDiscipline();
  const [activePhase, setActivePhase] = useState<PhaseConfig | null>(null);
  const [confettiFired, setConfettiFired] = useState(false);

  useEffect(() => {
    if (!subscription?.started_at) return;

    const startDate = new Date(subscription.started_at);
    const now = new Date();
    const weeksElapsed = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );

    // Find the most recent phase milestone that hasn't been dismissed
    // Check in reverse so we show the latest applicable milestone
    for (let i = PHASES.length - 1; i >= 0; i--) {
      const phase = PHASES[i];
      const dismissed = localStorage.getItem(
        `phaseMilestone_${phase.key}_dismissed`
      );
      if (weeksElapsed >= phase.weeksCompleted && !dismissed) {
        setActivePhase(phase);
        return;
      }
    }

    setActivePhase(null);
  }, [subscription]);

  // Fire confetti on first render of an active phase
  useEffect(() => {
    if (activePhase && !confettiFired) {
      fireVictoryConfetti();
      setConfettiFired(true);
    }
  }, [activePhase, confettiFired]);

  const dismiss = () => {
    if (activePhase) {
      localStorage.setItem(
        `phaseMilestone_${activePhase.key}_dismissed`,
        "true"
      );
      setActivePhase(null);
      setConfettiFired(false);
    }
  };

  if (!activePhase) return null;

  const PhaseIcon = activePhase.icon;

  return (
    <Card className="mb-6 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Phase Icon */}
          <div
            className={`w-12 h-12 rounded-full ${activePhase.bgAccent} flex items-center justify-center flex-shrink-0`}
          >
            <PhaseIcon className={`w-6 h-6 ${activePhase.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-sm text-primary">
                {activePhase.title}
              </h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                Phase Complete
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {activePhase.subtitle}
            </p>

            {/* Stats Summary */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium">
                  {activePhase.weeksCompleted} weeks completed
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-medium">
                  {streak} day streak
                </span>
              </div>
            </div>

            {/* Actions */}
            <Link to="/dashboard/program">
              <Button variant="gold" size="sm">
                Continue to Next Phase
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            aria-label="Dismiss milestone"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
