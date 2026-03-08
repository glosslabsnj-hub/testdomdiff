import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, Pause, SkipForward, CheckCircle2, X, Timer,
  Dumbbell, ChevronRight, Volume2, VolumeX, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface TimerExercise {
  id: string;
  exercise_name: string;
  sets: string | null;
  reps_or_time: string | null;
  rest: string | null;
  notes: string | null;
  demo_url: string | null;
  section_type: string;
  form_tips?: string | null;
}

interface WorkoutTimerProps {
  exercises: TimerExercise[];
  workoutName: string;
  onComplete: () => void;
  onClose: () => void;
}

function parseRest(rest: string | null): number {
  if (!rest) return 60;
  const match = rest.match(/(\d+)/);
  if (!match) return 60;
  const num = parseInt(match[1]);
  // If it says "min" or "minute", multiply by 60
  if (rest.toLowerCase().includes("min")) return num * 60;
  return num;
}

function parseSets(sets: string | null): number {
  if (!sets) return 3;
  const match = sets.match(/(\d+)/);
  return match ? parseInt(match[1]) : 3;
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1000;
      gain2.gain.value = 0.3;
      osc2.start();
      osc2.stop(ctx.currentTime + 0.2);
    }, 200);
  } catch (e) {
    // Audio not available
  }
}

function playFinishSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [0, 150, 300].forEach((delay, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 600 + (i * 200);
        gain.gain.value = 0.2;
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }, delay);
    });
  } catch (e) {}
}

export default function WorkoutTimer({ exercises, workoutName, onComplete, onClose }: WorkoutTimerProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [totalRestTime, setTotalRestTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [completedSets, setCompletedSets] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentExercise = exercises[currentExerciseIndex];
  const totalSets = currentExercise ? parseSets(currentExercise.sets) : 3;
  const restDuration = currentExercise ? parseRest(currentExercise.rest) : 60;

  const overallProgress = exercises.length > 0
    ? Math.round(((currentExerciseIndex + (currentSet - 1) / totalSets) / exercises.length) * 100)
    : 0;

  // Rest timer
  useEffect(() => {
    if (isResting && !isPaused && restTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            if (soundEnabled) playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isResting, isPaused, restTimeLeft, soundEnabled]);

  const completeSet = useCallback(() => {
    setCompletedSets(prev => prev + 1);

    if (currentSet >= totalSets) {
      // Exercise complete
      setCompletedExercises(prev => prev + 1);

      if (currentExerciseIndex >= exercises.length - 1) {
        // Workout complete!
        setIsFinished(true);
        if (soundEnabled) playFinishSound();
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#C9A54D", "#FFD700", "#FF6B35"],
        });
        onComplete();
        return;
      }

      // Move to next exercise
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(true);
      setRestTimeLeft(restDuration);
      setTotalRestTime(restDuration);
    } else {
      // Next set
      setCurrentSet(prev => prev + 1);
      setIsResting(true);
      setRestTimeLeft(restDuration);
      setTotalRestTime(restDuration);
    }
  }, [currentSet, totalSets, currentExerciseIndex, exercises.length, restDuration, soundEnabled, onComplete]);

  const skipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const skipExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Workout Complete!</h2>
          <p className="text-muted-foreground mb-6">{workoutName}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-lg sm:text-2xl font-bold text-primary">{formatTime(elapsedTime)}</p>
              <p className="text-xs text-muted-foreground">Total Time</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-lg sm:text-2xl font-bold text-primary">{completedExercises}</p>
              <p className="text-xs text-muted-foreground">Exercises</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-lg sm:text-2xl font-bold text-primary">{completedSets}</p>
              <p className="text-xs text-muted-foreground">Sets</p>
            </div>
          </div>

          <Button onClick={onClose} variant="gold" size="lg" className="w-full">
            Done
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium truncate max-w-[140px] sm:max-w-[200px]">{workoutName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatTime(elapsedTime)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="min-w-[44px] min-h-[44px]"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px]" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-1">
          <span>Exercise {currentExerciseIndex + 1} of {exercises.length}</span>
          <span>{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-1.5" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {isResting ? (
            // Rest Timer
            <motion.div
              key="rest"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center w-full max-w-sm"
            >
              <p className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Rest</p>

              {/* Circular timer */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/30"
                  />
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-primary"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - (totalRestTime > 0 ? restTimeLeft / totalRestTime : 0))}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-bold">{formatTime(restTimeLeft)}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {isPaused ? "Paused" : "remaining"}
                  </span>
                </div>
              </div>

              {/* Up Next */}
              {currentSet < totalSets ? (
                <p className="text-sm text-muted-foreground mb-4">
                  Next: Set {currentSet + 1} of {totalSets}
                </p>
              ) : currentExerciseIndex < exercises.length - 1 && (
                <p className="text-sm text-muted-foreground mb-4">
                  Next: {exercises[currentExerciseIndex + 1].exercise_name}
                </p>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-h-[44px]"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button variant="gold" size="lg" className="min-h-[44px]" onClick={skipRest}>
                  <SkipForward className="w-5 h-5 mr-2" />
                  Skip Rest
                </Button>
              </div>
            </motion.div>
          ) : (
            // Exercise View
            <motion.div
              key={`exercise-${currentExerciseIndex}-${currentSet}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center w-full max-w-sm"
            >
              <div className="mb-2">
                <span className={cn(
                  "text-xs uppercase tracking-wider px-2 py-0.5 rounded-full",
                  currentExercise?.section_type === "warmup" ? "bg-yellow-500/20 text-yellow-400" :
                  currentExercise?.section_type === "finisher" ? "bg-red-500/20 text-red-400" :
                  currentExercise?.section_type === "cooldown" ? "bg-blue-500/20 text-blue-400" :
                  "bg-primary/20 text-primary"
                )}>
                  {currentExercise?.section_type || "main"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold mb-2">{currentExercise?.exercise_name}</h2>

              {/* Sets/Reps Info */}
              <div className="flex items-center justify-center gap-6 mb-6">
                {currentExercise?.sets && (
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      {currentSet}/{totalSets}
                    </p>
                    <p className="text-xs text-muted-foreground">Sets</p>
                  </div>
                )}
                {currentExercise?.reps_or_time && (
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold">{currentExercise.reps_or_time}</p>
                    <p className="text-xs text-muted-foreground">Reps/Time</p>
                  </div>
                )}
              </div>

              {/* Form Tips */}
              {currentExercise?.form_tips && (
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 px-4 italic">
                  {currentExercise.form_tips}
                </p>
              )}

              {currentExercise?.notes && (
                <p className="text-xs text-muted-foreground mb-4 px-4">
                  {currentExercise.notes}
                </p>
              )}

              {/* Demo Video Link */}
              {currentExercise?.demo_url && (
                <a
                  href={currentExercise.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mb-6"
                >
                  <Play className="w-3 h-3" /> Watch Demo
                </a>
              )}

              {/* Complete Set Button */}
              <Button
                variant="gold"
                size="lg"
                className="w-full h-16 text-lg font-bold active:scale-[0.97] transition-transform"
                onClick={completeSet}
              >
                <CheckCircle2 className="w-6 h-6 mr-2" />
                {currentSet >= totalSets ? "Complete Exercise" : "Set Done"}
              </Button>

              {/* Skip Exercise */}
              {currentExerciseIndex < exercises.length - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-muted-foreground"
                  onClick={skipExercise}
                >
                  <SkipForward className="w-4 h-4 mr-1" /> Skip Exercise
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exercise Queue */}
      <div className="border-t border-border/30 p-4">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Coming Up</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scroll-fade-right">
          {exercises.slice(currentExerciseIndex + 1, currentExerciseIndex + 4).map((ex, i) => (
            <div
              key={ex.id}
              className="flex-shrink-0 min-w-[100px] px-3 py-1.5 rounded-md bg-muted/30 border border-border/20"
            >
              <span className="text-xs font-medium">{ex.exercise_name}</span>
              {ex.sets && <span className="text-[10px] text-muted-foreground ml-2">{ex.sets} sets</span>}
            </div>
          ))}
          {currentExerciseIndex >= exercises.length - 1 && (
            <div className="flex-shrink-0 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
              <span className="text-xs font-medium text-primary">Finish!</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Button to launch the timer
export function WorkoutTimerButton({
  exercises,
  workoutName,
  onComplete,
}: {
  exercises: TimerExercise[];
  workoutName: string;
  onComplete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (exercises.length === 0) return null;

  return (
    <>
      <Button
        variant="gold"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Play className="w-4 h-4" />
        Start Workout
      </Button>

      {isOpen && (
        <WorkoutTimer
          exercises={exercises}
          workoutName={workoutName}
          onComplete={() => {
            onComplete();
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
