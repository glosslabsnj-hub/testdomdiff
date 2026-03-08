import { useState, useEffect } from "react";
import { KeyRound, Award, Share2, Download, X, Star, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { useDayCompletions } from "@/hooks/useDayCompletions";
import { useGamification } from "@/hooks/useGamification";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export function ReleaseCeremony() {
  const { profile } = useAuth();
  const { subscription } = useEffectiveSubscription();
  const { earnedCount, totalCount, longestStreak } = useGamification();
  const [showCeremony, setShowCeremony] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Check if user completed week 12
  // We check by seeing if they've been on the program 12+ weeks
  useEffect(() => {
    if (!subscription?.started_at) return;
    const startDate = new Date(subscription.started_at);
    const now = new Date();
    const weeksElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

    // Check if ceremony was already dismissed
    const dismissed = localStorage.getItem("releaseCeremonyDismissed");

    if (weeksElapsed >= 12 && !dismissed) {
      setHasCompleted(true);
    }
  }, [subscription]);

  const triggerCeremony = () => {
    setShowCeremony(true);
    // Big celebration confetti
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#C9A54D", "#FFD700", "#FF6B35", "#FFFFFF"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const dismissCeremony = () => {
    setShowCeremony(false);
    setHasCompleted(false);
    localStorage.setItem("releaseCeremonyDismissed", "true");
  };

  const startDate = subscription?.started_at ? new Date(subscription.started_at) : new Date();
  const releaseDate = new Date();
  const totalDays = Math.floor((releaseDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (!hasCompleted) return null;

  return (
    <>
      {/* Release Banner */}
      <Card className="mb-6 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-primary/10 to-yellow-500/10 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-yellow-400">RELEASE DAY</h4>
              <p className="text-xs text-muted-foreground">
                You've served your sentence. 12 weeks of discipline, faith, and transformation.
              </p>
            </div>
            <Button variant="gold" size="sm" onClick={triggerCeremony}>
              <Award className="w-4 h-4 mr-1.5" />
              View Release
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Ceremony Modal */}
      <Dialog open={showCeremony} onOpenChange={setShowCeremony}>
        <DialogContent className="max-w-md border-primary/30 bg-background">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              <span className="text-primary">RELEASE</span> DAY
            </DialogTitle>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            {/* Release Badge */}
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-yellow-500/30 flex items-center justify-center border-2 border-primary/50">
              <KeyRound className="w-12 h-12 text-primary" />
            </div>

            <div>
              <h3 className="text-lg font-bold mb-1">
                {profile?.first_name || "Soldier"}, You're Free.
              </h3>
              <p className="text-sm text-muted-foreground">
                You've completed your 12-week sentence. What started in a cell became something unbreakable.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="text-xl font-bold">{totalDays}</p>
                <p className="text-[10px] text-muted-foreground">Days Served</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-xl font-bold">{longestStreak}</p>
                <p className="text-[10px] text-muted-foreground">Best Streak</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{earnedCount}</p>
                <p className="text-[10px] text-muted-foreground">Badges Earned</p>
              </div>
            </div>

            {/* Certificate */}
            <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
              <p className="text-xs uppercase tracking-wider text-primary mb-2">Certificate of Completion</p>
              <p className="text-sm font-medium">
                This certifies that <span className="text-primary">{profile?.first_name} {profile?.last_name}</span> has
                successfully completed the Redeemed Strength 12-Week Transformation Program.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {startDate.toLocaleDateString()} - {releaseDate.toLocaleDateString()}
              </p>
            </div>

            <p className="text-xs text-muted-foreground italic">
              "I can do all things through Christ who strengthens me." - Philippians 4:13
            </p>

            <div className="flex gap-2">
              <Button variant="gold" className="flex-1" onClick={dismissCeremony}>
                Accept Release
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
