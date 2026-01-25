import { RefreshCw, Dumbbell, BookOpen, Utensils, Heart, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWardenTips } from "@/hooks/useWardenTips";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface RotatingWardenTipProps {
  planType?: string;
}

const categoryIcons = {
  discipline: Timer,
  workout: Dumbbell,
  scripture: BookOpen,
  nutrition: Utensils,
  faith: Heart,
};

const categoryColors = {
  discipline: "text-gold",
  workout: "text-crimson",
  scripture: "text-blue-400",
  nutrition: "text-green-400",
  faith: "text-purple-400",
};

const categoryBgColors = {
  discipline: "bg-gold/10",
  workout: "bg-crimson/10",
  scripture: "bg-blue-400/10",
  nutrition: "bg-green-400/10",
  faith: "bg-purple-400/10",
};

export function RotatingWardenTip({ planType = "membership" }: RotatingWardenTipProps) {
  const { currentTip, refreshTip } = useWardenTips(planType);

  if (!currentTip) return null;

  const Icon = categoryIcons[currentTip.category];
  const colorClass = categoryColors[currentTip.category];
  const bgClass = categoryBgColors[currentTip.category];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTip.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="bg-charcoal/50 border border-border/50 rounded-lg p-3 flex items-start gap-3"
      >
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0", bgClass)}>
          <Icon className={cn("h-4 w-4", colorClass)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentTip.text}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={refreshTip}
          className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
          title="New tip"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}

export default RotatingWardenTip;
