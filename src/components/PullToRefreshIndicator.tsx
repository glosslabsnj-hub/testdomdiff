import { Loader2, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  progress: number;
  isRefreshing: boolean;
  threshold?: number;
}

export function PullToRefreshIndicator({
  pullDistance,
  progress,
  isRefreshing,
  threshold = 80,
}: PullToRefreshIndicatorProps) {
  const isVisible = pullDistance > 10 || isRefreshing;
  const isReady = progress >= 1;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: 1, 
            y: Math.min(pullDistance - 20, threshold - 20),
          }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
        >
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-full 
            bg-charcoal border border-border shadow-lg
            ${isReady || isRefreshing ? 'border-primary' : ''}
          `}>
            {isRefreshing ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <motion.div
                animate={{ rotate: isReady ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowDown className={`w-5 h-5 ${isReady ? 'text-primary' : 'text-muted-foreground'}`} />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
