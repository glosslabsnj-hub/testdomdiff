import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playYardBell, getSoundEnabled, triggerHaptic } from "@/lib/sounds";
import { useTTS } from "@/hooks/useTTS";

interface RestTimerProps {
  defaultDuration?: number; // in seconds
  presets?: number[];
  onComplete?: () => void;
  className?: string;
}

export function RestTimer({
  defaultDuration = 60,
  presets = [30, 45, 60, 90, 120],
  onComplete,
  className,
}: RestTimerProps) {
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(getSoundEnabled());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasPlayedAlert = useRef(false);
  
  const { speak, isLoading: ttsLoading } = useTTS();

  // Calculate progress percentage
  const progress = ((duration - timeLeft) / duration) * 100;
  
  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle timer completion
  const handleComplete = useCallback(() => {
    setIsRunning(false);
    
    if (soundEnabled) {
      playYardBell({ volume: 0.5 });
      triggerHaptic("heavy");
      
      // TTS announcement
      speak("Time to work. Get back on the iron.");
    }
    
    onComplete?.();
  }, [soundEnabled, onComplete, speak]);

  // Timer tick
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (!hasPlayedAlert.current) {
              hasPlayedAlert.current = true;
              handleComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleComplete]);

  // Start/pause toggle
  const toggleTimer = () => {
    if (timeLeft === 0) {
      // Reset if completed
      setTimeLeft(duration);
      hasPlayedAlert.current = false;
    }
    setIsRunning(!isRunning);
    
    if (!isRunning && soundEnabled) {
      triggerHaptic("light");
    }
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    hasPlayedAlert.current = false;
  };

  // Change preset duration
  const selectPreset = (seconds: number) => {
    setDuration(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
    hasPlayedAlert.current = false;
  };

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Determine ring color based on time left
  const getRingColor = () => {
    if (timeLeft === 0) return "text-success";
    if (timeLeft <= 5) return "text-crimson animate-pulse";
    if (timeLeft <= 10) return "text-primary";
    return "text-steel-light";
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Timer Ring */}
      <div className="relative w-40 h-40 mb-4">
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/20"
          />
          {/* Progress ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${progress * 2.827} 282.7`}
            className={cn("transition-all duration-300", getRingColor())}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "text-4xl font-bold tabular-nums transition-colors",
            timeLeft === 0 ? "text-success" : "text-foreground"
          )}>
            {formatTime(timeLeft)}
          </span>
          {timeLeft === 0 && (
            <span className="text-xs text-success font-medium mt-1">REST OVER</span>
          )}
        </div>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {presets.map((seconds) => (
          <button
            key={seconds}
            onClick={() => selectPreset(seconds)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              duration === seconds && !isRunning
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {seconds >= 60 ? `${seconds / 60}m` : `${seconds}s`}
          </button>
        ))}
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSound}
          className="text-muted-foreground"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </Button>

        <Button
          variant={isRunning ? "steel" : "gold"}
          size="lg"
          onClick={toggleTimer}
          disabled={ttsLoading}
          className="w-24"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 mr-1" />
              Pause
            </>
          ) : timeLeft === 0 ? (
            <>
              <RotateCcw className="w-5 h-5 mr-1" />
              Again
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-1" />
              Start
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={resetTimer}
          className="text-muted-foreground"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground mt-3 text-center">
        {isRunning ? "Rest up. You've earned it." : "Select duration and hit start."}
      </p>
    </div>
  );
}
