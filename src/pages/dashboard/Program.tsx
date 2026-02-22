import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Dumbbell, 
  Target, 
  BookOpen, 
  Heart, 
  Loader2, 
  PlayCircle,
  ChevronDown,
  ChevronRight,
  Calendar,
  Flame,
  Trophy,
  Clock,
  CheckCircle2,
  Moon,
  Lock,
  Info,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useProgramWeeks, type ProgramWeek } from "@/hooks/useWorkoutContent";
import { useProgramTracks } from "@/hooks/useProgramTracks";
import { useDayCompletions } from "@/hooks/useDayCompletions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";
import { calculateCurrentWeek } from "@/lib/weekCalculator";
import ExerciseDetailDialog from "@/components/workout/ExerciseDetailDialog";
import ServedStamp from "@/components/ServedStamp";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import jailSounds from "@/lib/sounds";
import { fireVictoryConfetti, fireTaskConfetti } from "@/lib/confetti";
import { usePersonalizedWorkout, type PersonalizedExercise } from "@/hooks/usePersonalizedWorkout";

interface ProgramDayWorkout {
  id: string;
  week_id: string;
  day_of_week: string;
  workout_name: string;
  workout_description: string | null;
  is_rest_day: boolean;
  display_order: number;
}

interface ProgramDayExercise {
  id: string;
  day_workout_id: string;
  section_type: string;
  exercise_name: string;
  sets: string | null;
  reps_or_time: string | null;
  rest: string | null;
  notes: string | null;
  demo_url: string | null;
  display_order: number;
  scaling_options?: string | null;
  instructions?: string | null;
  form_tips?: string | null;
  muscles_targeted?: string | null;
}

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const Program = () => {
  const { tracks, loading: tracksLoading, getTrackByGoal } = useProgramTracks();
  const { subscription, isMembership } = useEffectiveSubscription();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Get user's track based on their goal
  const userTrack = useMemo(() => {
    if (tracksLoading || tracks.length === 0) return null;
    return getTrackByGoal(profile?.goal || null);
  }, [tracks, tracksLoading, profile?.goal, getTrackByGoal]);

  const { weeks, loading: weeksLoading } = useProgramWeeks(userTrack?.id);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [dayWorkouts, setDayWorkouts] = useState<ProgramDayWorkout[]>([]);
  const [exercisesByDay, setExercisesByDay] = useState<Record<string, ProgramDayExercise[]>>({});
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<ProgramDayExercise | null>(null);
  // Track expanded workout cards separately to prevent collapse on exercise toggle
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  
  // Calculate current week from subscription start date
  const currentWeek = useMemo(() => {
    return calculateCurrentWeek(subscription?.started_at);
  }, [subscription?.started_at]);
  
  // Auto-expand current week on first load
  useEffect(() => {
    if (!expandedWeek && currentWeek) {
      setExpandedWeek(currentWeek);
    }
  }, [currentWeek, expandedWeek]);
  
  // Day-level completion tracking
  const { 
    isDayCompleted, 
    toggleDayCompletion, 
    getWeekProgress,
    loading: completionsLoading 
  } = useDayCompletions(currentWeek);

  // Fetch all day workouts and exercises
  useEffect(() => {
    const fetchWorkoutsAndExercises = async () => {
      if (weeks.length === 0) return;
      
      setLoadingWorkouts(true);
      const weekIds = weeks.map(w => w.id);

      try {
        // Fetch day workouts
        const { data: workoutsData, error: workoutsError } = await supabase
          .from("program_day_workouts")
          .select("*")
          .in("week_id", weekIds)
          .order("display_order");

        if (workoutsError) throw workoutsError;
        setDayWorkouts((workoutsData || []) as ProgramDayWorkout[]);

        // Fetch exercises for all day workouts
        const dayIds = (workoutsData || []).map((d: any) => d.id);
        if (dayIds.length > 0) {
          const { data: exercisesData, error: exercisesError } = await supabase
            .from("program_day_exercises")
            .select("*")
            .in("day_workout_id", dayIds)
            .order("display_order");

          if (exercisesError) throw exercisesError;

          const grouped: Record<string, ProgramDayExercise[]> = {};
          (exercisesData || []).forEach((ex: any) => {
            if (!grouped[ex.day_workout_id]) grouped[ex.day_workout_id] = [];
            grouped[ex.day_workout_id].push(ex);
          });
          setExercisesByDay(grouped);
        }
      } catch (e) {
        console.error("Error fetching program data:", e);
      } finally {
        setLoadingWorkouts(false);
      }
    };

    fetchWorkoutsAndExercises();
  }, [weeks]);

  // Only transformation and coaching users can access
  if (isMembership) {
    return <UpgradePrompt feature="12-Week Program" upgradeTo="transformation" />;
  }

  const phases = [
    { phase: "foundation", name: "Foundation", weeks: "1-4", icon: Target, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30", textColor: "text-blue-400" },
    { phase: "build", name: "Build", weeks: "5-8", icon: Flame, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30", textColor: "text-amber-400" },
    { phase: "peak", name: "Peak", weeks: "9-12", icon: Trophy, color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10", borderColor: "border-green-500/30", textColor: "text-green-400" },
  ];

  const getPhaseInfo = (phase: string) => phases.find(p => p.phase === phase) || phases[0];

  // Calculate overall progress
  const completedWeeks = Math.min(currentWeek - 1, 12);
  const progressPercent = (completedWeeks / 12) * 100;

  const loading = weeksLoading || loadingWorkouts || tracksLoading || completionsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="section-container py-12">
          {/* Skeleton for header */}
          <div className="mb-8">
            <div className="h-4 w-32 bg-muted rounded animate-pulse mb-4" />
            <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-96 max-w-full bg-muted rounded animate-pulse" />
          </div>
          {/* Skeleton for progress bar */}
          <div className="h-24 bg-charcoal rounded-lg border border-border animate-pulse mb-8" />
          {/* Skeleton for week cards */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-charcoal rounded-lg border border-border animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Helper to get workouts for a specific week
  const getWorkoutsForWeek = (weekId: string) => {
    return dayWorkouts
      .filter(w => w.week_id === weekId)
      .sort((a, b) => DAYS_ORDER.indexOf(a.day_of_week) - DAYS_ORDER.indexOf(b.day_of_week));
  };

  // View-only exercise row (no checkbox)
  const ExerciseRow = ({ 
    exercise, 
    isMain = false
  }: { 
    exercise: ProgramDayExercise; 
    isMain?: boolean; 
  }) => {
    return (
      <div 
        className={cn(
          "flex items-start gap-3 p-3 rounded transition-all cursor-pointer group",
          isMain ? "bg-charcoal hover:bg-charcoal/80" : "bg-charcoal/50 hover:bg-charcoal/70"
        )}
        onClick={() => setSelectedExercise(exercise)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              "font-medium",
              isMain ? "text-foreground" : "text-muted-foreground"
            )}>
              {exercise.exercise_name}
            </p>
            <Info className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {exercise.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{exercise.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm flex-wrap justify-end flex-shrink-0">
          {exercise.sets && (
            <Badge variant="secondary" className="text-xs">
              {exercise.sets} sets
            </Badge>
          )}
          {exercise.reps_or_time && (
            <Badge variant="outline" className="text-xs">
              {exercise.reps_or_time}
            </Badge>
          )}
          {exercise.rest && (
            <span className="text-xs text-muted-foreground hidden sm:inline">Rest: {exercise.rest}</span>
          )}
        </div>
      </div>
    );
  };

  const WorkoutCard = ({ workout, weekNumber }: { workout: ProgramDayWorkout; weekNumber: number }) => {
    const baseExercises = exercisesByDay[workout.id] || [];
    const isOpen = expandedWorkouts.has(workout.id);
    const isCompleted = isDayCompleted(workout.id);
    const [completing, setCompleting] = useState(false);
    const [showStamp, setShowStamp] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // AI Personalization (only fetches when card is expanded, only for non-membership users)
    const shouldPersonalize = isOpen && !isMembership;
    const {
      isPersonalized,
      personalizedExercises,
      modificationNotes,
      loading: personalizationLoading,
    } = usePersonalizedWorkout(
      shouldPersonalize ? weekNumber : 0,
      shouldPersonalize ? workout.day_of_week : ""
    );

    // Build effective exercises: use personalized if available, else base
    const exercises = useMemo(() => {
      if (!isPersonalized || !personalizedExercises) return baseExercises;
      // Map personalized exercises back to ProgramDayExercise shape for the UI
      return personalizedExercises.map((pe: PersonalizedExercise, idx: number) => ({
        id: `personalized-${workout.id}-${idx}`,
        day_workout_id: workout.id,
        section_type: pe.section_type,
        exercise_name: pe.exercise_name,
        sets: pe.sets || null,
        reps_or_time: pe.reps_or_time || null,
        rest: pe.rest || null,
        notes: pe.modification_reason
          ? `${pe.notes || ""} [Modified: ${pe.modification_reason}]`.trim()
          : pe.notes || null,
        demo_url: null,
        display_order: pe.display_order,
        scaling_options: null,
        instructions: null,
        form_tips: null,
        muscles_targeted: null,
      })) as ProgramDayExercise[];
    }, [isPersonalized, personalizedExercises, baseExercises, workout.id]);
    
    const setIsOpen = (open: boolean) => {
      // Capture scroll position before state change
      const scrollY = window.scrollY;
      
      setExpandedWorkouts(prev => {
        const next = new Set(prev);
        if (open) {
          next.add(workout.id);
        } else {
          next.delete(workout.id);
        }
        return next;
      });
      
      // Restore scroll position after render
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      });
    };

    const handleMarkComplete = async () => {
      setCompleting(true);
      const success = await toggleDayCompletion(workout.id, weekNumber);
      if (success) {
        if (!isCompleted) {
          // Show stamp animation and play sounds
          setShowStamp(true);
          jailSounds.stampSlam({ enabled: true });
          jailSounds.haptic('medium');
          
          // Fire confetti from the card
          setTimeout(() => {
            fireTaskConfetti(cardRef.current || undefined);
          }, 200);
          
          toast({
            title: "Day Served",
            description: `${workout.workout_name} locked in.`,
          });
        }
      }
      setCompleting(false);
    };

    const dayLabel = workout.day_of_week.charAt(0).toUpperCase() + workout.day_of_week.slice(1);

    const mainExercises = exercises.filter(e => e.section_type === "main");
    const warmupExercises = exercises.filter(e => e.section_type === "warmup");
    const finisherExercises = exercises.filter(e => e.section_type === "finisher");
    const cooldownExercises = exercises.filter(e => e.section_type === "cooldown");

    if (workout.is_rest_day) {
      return (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-charcoal/50 border border-border">
          <div className="w-12 h-12 rounded-lg bg-muted/20 flex items-center justify-center">
            <Moon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{dayLabel}</p>
            <h4 className="font-medium text-muted-foreground">{workout.workout_name}</h4>
            {workout.workout_description && (
              <p className="text-sm text-muted-foreground/70">{workout.workout_description}</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div ref={cardRef} className="relative">
        {/* Stamp animation overlay */}
        <ServedStamp show={showStamp} />
        
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full">
            <div className={cn(
              "flex items-center justify-between p-4 rounded-lg border transition-all group",
              isCompleted 
                ? "bg-destructive/10 border-destructive/30" 
                : "bg-charcoal border-border hover:border-primary/50"
            )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                isCompleted ? "bg-destructive/20" : "bg-primary/10"
              )}>
                {isCompleted ? (
                  <Lock className="w-6 h-6 text-destructive" />
                ) : (
                  <Dumbbell className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="text-left">
                <p className={cn(
                  "text-xs uppercase tracking-wider font-medium",
                  isCompleted ? "text-destructive" : "text-primary"
                )}>{dayLabel}</p>
                <h4 className={cn(
                  "font-display text-lg",
                  isCompleted && "line-through text-muted-foreground"
                )}>{workout.workout_name}</h4>
                {workout.workout_description && (
                  <p className={cn(
                    "text-sm",
                    isCompleted ? "text-muted-foreground/50" : "text-muted-foreground"
                  )}>{workout.workout_description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {isCompleted && (
                <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                  SERVED
                </Badge>
              )}
              <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
              </Badge>
              {/* Quick-complete button on collapsed card */}
              <Button
                variant={isCompleted ? "outline" : "gold"}
                size="sm"
                className={cn(
                  "shrink-0 gap-1.5 px-3",
                  isCompleted && "border-destructive/50 text-destructive hover:bg-destructive/10"
                )}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent expand toggle
                  handleMarkComplete();
                }}
                disabled={completing}
              >
                {completing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isCompleted ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{isCompleted ? "Undo" : "Complete"}</span>
              </Button>
              {isOpen ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 p-4 rounded-lg bg-background border border-border space-y-4">
            {/* AI Personalization indicator */}
            {isPersonalized && modificationNotes && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-primary">Personalized for you</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{modificationNotes}</p>
                </div>
              </div>
            )}
            {personalizationLoading && shouldPersonalize && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Personalizing workout...</p>
              </div>
            )}
            {warmupExercises.length > 0 && (
              <div>
                <h5 className="text-xs uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Warm-Up
                </h5>
                <div className="space-y-2">
                  {warmupExercises.map((ex) => (
                    <ExerciseRow key={ex.id} exercise={ex} />
                  ))}
                </div>
              </div>
            )}

            {mainExercises.length > 0 && (
              <div>
                <h5 className="text-xs uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
                  <Dumbbell className="w-3 h-3" /> Main Workout
                </h5>
                <div className="space-y-2">
                  {mainExercises.map((ex) => (
                    <ExerciseRow key={ex.id} exercise={ex} isMain />
                  ))}
                </div>
              </div>
            )}

            {finisherExercises.length > 0 && (
              <div>
                <h5 className="text-xs uppercase tracking-wider text-destructive mb-2 flex items-center gap-2">
                  <Flame className="w-3 h-3" /> Finisher
                </h5>
                <div className="space-y-2">
                  {finisherExercises.map((ex) => (
                    <ExerciseRow key={ex.id} exercise={ex} />
                  ))}
                </div>
              </div>
            )}

            {cooldownExercises.length > 0 && (
              <div>
                <h5 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                  <Heart className="w-3 h-3" /> Cool-Down
                </h5>
                <div className="space-y-2">
                  {cooldownExercises.map((ex) => (
                    <ExerciseRow key={ex.id} exercise={ex} />
                  ))}
                </div>
              </div>
            )}

            {exercises.length === 0 && (
              <p className="text-sm text-muted-foreground italic text-center py-4">
                Exercises to be added by your coach
              </p>
            )}

            {/* Day Completion Button */}
            <div className="pt-4 border-t border-border">
              <Button
                onClick={handleMarkComplete}
                disabled={completing}
                variant={isCompleted ? "outline" : "gold"}
                className={cn(
                  "w-full gap-2",
                  isCompleted && "border-destructive/30 text-destructive hover:bg-destructive/10"
                )}
              >
                {completing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCompleted ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {isCompleted ? "UNDO COMPLETION" : "MARK DAY COMPLETE"}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      </div>
    );
  };

  const WeekCard = ({ week }: { week: ProgramWeek }) => {
    const phaseInfo = getPhaseInfo(week.phase);
    const isExpanded = expandedWeek === week.week_number;
    const isCurrentWeek = currentWeek === week.week_number;
    const weekWorkouts = getWorkoutsForWeek(week.id);
    const workoutCount = weekWorkouts.filter(w => !w.is_rest_day).length;
    
    // Calculate day completion progress for this week
    const completedDays = weekWorkouts.filter(w => !w.is_rest_day && isDayCompleted(w.id)).length;
    const weekProgress = workoutCount > 0 ? Math.round((completedDays / workoutCount) * 100) : 0;
    
    // Week is "served" if all workout days are complete OR if the week has passed
    const isWeekFullyCompleted = workoutCount > 0 && completedDays === workoutCount;
    const isWeekServed = isWeekFullyCompleted || week.week_number < currentWeek;

    return (
      <div className={cn(
        "rounded-xl border transition-all",
        isCurrentWeek && !isWeekFullyCompleted
          ? "border-primary shadow-[0_0_30px_-10px_hsl(43_74%_49%_/_0.3)] bg-charcoal" 
          : isWeekServed 
            ? "border-destructive/30 bg-destructive/5"
            : "border-border bg-card hover:border-primary/30"
      )}>
        {/* Week Header */}
        <button
          onClick={() => setExpandedWeek(isExpanded ? null : week.week_number)}
          className="w-full p-6 text-left"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Week Number Circle */}
              <div className={cn(
                "relative w-14 h-14 rounded-full flex items-center justify-center font-display text-xl",
                isCurrentWeek && !isWeekFullyCompleted
                  ? "bg-primary text-primary-foreground" 
                  : isWeekServed
                    ? "bg-destructive/20 text-destructive border-2 border-destructive"
                    : `${phaseInfo.bgColor} ${phaseInfo.textColor} border-2 ${phaseInfo.borderColor}`
              )}>
                {isWeekServed ? (
                  <Lock className="w-6 h-6" />
                ) : (
                  week.week_number
                )}
                {isCurrentWeek && !isWeekFullyCompleted && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
                )}
              </div>

              {/* Week Info */}
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className={`${phaseInfo.bgColor} ${phaseInfo.textColor} ${phaseInfo.borderColor} border text-xs`}>
                    {phaseInfo.name}
                  </Badge>
                  {isCurrentWeek && !isWeekFullyCompleted && (
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      Current Week
                    </Badge>
                  )}
                  {isWeekServed && (
                    <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">
                      Served
                    </Badge>
                  )}
                  {week.video_url && (
                    <Badge variant="outline" className="text-xs">
                      <PlayCircle className="w-3 h-3 mr-1" /> Video
                    </Badge>
                  )}
                </div>
                <h3 className={cn(
                  "font-display text-xl",
                  isWeekServed && "text-muted-foreground"
                )}>
                  Week {week.week_number}: {week.title || `${phaseInfo.name} Training`}
                </h3>
                {week.focus_description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {week.focus_description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-muted-foreground">{workoutCount} workout{workoutCount !== 1 ? 's' : ''}</p>
                {isCurrentWeek && weekProgress > 0 && (
                  <p className="text-xs text-primary">{completedDays}/{workoutCount} days</p>
                )}
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-primary" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-6 pb-6 space-y-6">
            {/* Weekly Video */}
            {week.video_url && (
              <div className="p-4 rounded-lg bg-background border border-primary/30">
                <div className="flex items-center gap-2 mb-3">
                  <PlayCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium text-primary">
                    {week.video_title || "Week Overview Video"}
                  </span>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden bg-charcoal">
                  <video
                    src={week.video_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
                {week.video_description && (
                  <p className="text-sm text-muted-foreground mt-3">{week.video_description}</p>
                )}
              </div>
            )}

            {/* Workout Schedule */}
            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Weekly Workout Schedule
              </h4>
              {weekWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {weekWorkouts.map((workout) => (
                    <WorkoutCard key={workout.id} workout={workout} weekNumber={week.week_number} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic p-4 rounded bg-charcoal text-center">
                  Workouts to be configured by your coach
                </p>
              )}
            </div>

            {/* Additional Notes */}
            {(week.conditioning_notes || week.recovery_notes || week.scripture_reference) && (
              <div className="grid sm:grid-cols-3 gap-4">
                {week.conditioning_notes && (
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <p className="text-xs uppercase tracking-wider text-primary font-medium">Conditioning</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{week.conditioning_notes}</p>
                  </div>
                )}
                {week.recovery_notes && (
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-green-400" />
                      <p className="text-xs uppercase tracking-wider text-green-400 font-medium">Recovery</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{week.recovery_notes}</p>
                  </div>
                )}
                {week.scripture_reference && (
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <p className="text-xs uppercase tracking-wider text-amber-400 font-medium">Scripture</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{week.scripture_reference}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cell Block
        </Link>

        {/* Hero Section */}
        <div className="relative p-8 rounded-xl bg-gradient-to-br from-charcoal via-charcoal to-primary/10 border border-border mb-8 overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Your Sentence
              </Badge>
              {userTrack && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {userTrack.name} Block
                </Badge>
              )}
            </div>
            <h1 className="font-display text-4xl md:text-5xl mb-3">
              The <span className="text-primary">Sentence</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mb-6">
              {userTrack?.description || "12 weeks of structured transformation through three strategic phases. Each week builds on the last. Complete your sentence and emerge different."}
            </p>

            {/* Progress Bar */}
            <div className="max-w-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-medium text-primary">Week {currentWeek} of 12</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>
          </div>

          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        </div>

        {/* Phase Progress Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {phases.map((phase, index) => {
            const phaseWeeks = weeks.filter(w => w.phase === phase.phase);
            const firstWeek = phaseWeeks[0]?.week_number || (index * 4 + 1);
            const lastWeek = phaseWeeks[phaseWeeks.length - 1]?.week_number || (index * 4 + 4);
            const isActive = currentWeek >= firstWeek && currentWeek <= lastWeek;
            const isComplete = currentWeek > lastWeek;

            return (
              <button
                key={phase.phase}
                onClick={() => {
                  const firstWeekOfPhase = phaseWeeks[0];
                  if (firstWeekOfPhase) setExpandedWeek(firstWeekOfPhase.week_number);
                }}
                className={cn(
                  "p-5 rounded-xl border transition-all text-left",
                  isActive 
                    ? `${phase.bgColor} ${phase.borderColor} border-2` 
                    : isComplete
                      ? "bg-destructive/5 border-destructive/30"
                      : "bg-charcoal border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <phase.icon className={cn(
                    "w-6 h-6",
                    isComplete ? "text-destructive" : phase.textColor
                  )} />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Weeks {phase.weeks}
                    </p>
                    <h3 className={cn(
                      "font-display text-lg",
                      isActive ? phase.textColor : ""
                    )}>
                      {phase.name} Phase
                    </h3>
                  </div>
                  {isComplete && <Lock className="w-5 h-5 text-destructive ml-auto" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Week Cards */}
        <div className="space-y-4">
          {weeks.map((week) => (
            <WeekCard key={week.id} week={week} />
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button variant="gold" asChild>
            <Link to="/dashboard/workouts">View All Workouts</Link>
          </Button>
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard/check-in">Submit Weekly Check-In</Link>
          </Button>
          <Button variant="dark" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Exercise Detail Dialog */}
      <ExerciseDetailDialog 
        exercise={selectedExercise}
        open={!!selectedExercise}
        onOpenChange={(open) => !open && setSelectedExercise(null)}
      />
    </div>
  );
};

export default Program;
