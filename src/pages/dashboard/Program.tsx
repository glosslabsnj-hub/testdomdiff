import { useState, useEffect, useMemo } from "react";
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
  Check,
  Play,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProgramWeeks, type ProgramWeek } from "@/hooks/useWorkoutContent";
import { useProgramTracks } from "@/hooks/useProgramTracks";
import { useWorkoutCompletions } from "@/hooks/useWorkoutCompletions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import UpgradePrompt from "@/components/UpgradePrompt";
import { calculateCurrentWeek } from "@/lib/weekCalculator";

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
}

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const Program = () => {
  const { tracks, loading: tracksLoading, getTrackByGoal } = useProgramTracks();
  const { subscription, profile } = useAuth();
  
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
  const [demoExercise, setDemoExercise] = useState<ProgramDayExercise | null>(null);
  
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
  
  // Completion tracking
  const { 
    isExerciseCompleted, 
    toggleExerciseCompletion, 
    getWorkoutProgress,
    loading: completionsLoading 
  } = useWorkoutCompletions(currentWeek);

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
  if (subscription?.plan_type === "membership") {
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Helper to get workouts for a specific week
  const getWorkoutsForWeek = (weekId: string) => {
    return dayWorkouts
      .filter(w => w.week_id === weekId)
      .sort((a, b) => DAYS_ORDER.indexOf(a.day_of_week) - DAYS_ORDER.indexOf(b.day_of_week));
  };

  const ExerciseRow = ({ 
    exercise, 
    isMain = false, 
    dayOfWeek, 
    weekNumber 
  }: { 
    exercise: ProgramDayExercise; 
    isMain?: boolean; 
    dayOfWeek: string;
    weekNumber: number;
  }) => {
    const completed = isExerciseCompleted(exercise.id);
    const [toggling, setToggling] = useState(false);

    const handleToggle = async () => {
      setToggling(true);
      await toggleExerciseCompletion(exercise.id, dayOfWeek, weekNumber);
      setToggling(false);
    };

    return (
      <div className={`flex items-start gap-3 p-3 rounded transition-all ${
        completed 
          ? 'bg-green-500/10 border border-green-500/30' 
          : isMain ? 'bg-charcoal' : 'bg-charcoal/50'
      }`}>
        {/* Completion Checkbox */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            completed 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-muted-foreground/50 hover:border-primary'
          }`}
        >
          {toggling ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : completed ? (
            <Check className="w-3 h-3" />
          ) : null}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`font-medium ${completed ? 'text-green-400 line-through' : isMain ? 'text-foreground' : 'text-muted-foreground'}`}>
              {exercise.exercise_name}
            </p>
            {exercise.demo_url && (
              <button 
                onClick={() => setDemoExercise(exercise)}
                className="p-1 rounded hover:bg-primary/20 text-primary"
                title="Watch demo"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
          </div>
          {exercise.notes && (
            <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>
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
    const exercises = exercisesByDay[workout.id] || [];
    const [isOpen, setIsOpen] = useState(false);

    const dayLabel = workout.day_of_week.charAt(0).toUpperCase() + workout.day_of_week.slice(1);

    const mainExercises = exercises.filter(e => e.section_type === "main");
    const warmupExercises = exercises.filter(e => e.section_type === "warmup");
    const finisherExercises = exercises.filter(e => e.section_type === "finisher");
    const cooldownExercises = exercises.filter(e => e.section_type === "cooldown");
    
    // Calculate workout completion progress
    const exerciseIds = exercises.map(e => e.id);
    const progress = getWorkoutProgress(workout.id, exerciseIds);
    const isWorkoutComplete = progress === 100;

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
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className={`flex items-center justify-between p-4 rounded-lg border transition-all group ${
            isWorkoutComplete 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-charcoal border-border hover:border-primary/50'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isWorkoutComplete ? 'bg-green-500/20' : 'bg-primary/10'
              }`}>
                {isWorkoutComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <Dumbbell className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="text-left">
                <p className="text-xs text-primary uppercase tracking-wider font-medium">{dayLabel}</p>
                <h4 className="font-display text-lg">{workout.workout_name}</h4>
                {workout.workout_description && (
                  <p className="text-sm text-muted-foreground">{workout.workout_description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {progress > 0 && progress < 100 && (
                <div className="hidden sm:flex items-center gap-2">
                  <Progress value={progress} className="w-16 h-2" />
                  <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
              )}
              <Badge variant="outline" className="text-xs">
                {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
              </Badge>
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
            {warmupExercises.length > 0 && (
              <div>
                <h5 className="text-xs uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Warm-Up
                </h5>
                <div className="space-y-2">
                  {warmupExercises.map((ex) => (
                    <ExerciseRow key={ex.id} exercise={ex} dayOfWeek={workout.day_of_week} weekNumber={weekNumber} />
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
                    <ExerciseRow key={ex.id} exercise={ex} isMain dayOfWeek={workout.day_of_week} weekNumber={weekNumber} />
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
                    <ExerciseRow key={ex.id} exercise={ex} dayOfWeek={workout.day_of_week} weekNumber={weekNumber} />
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
                    <ExerciseRow key={ex.id} exercise={ex} dayOfWeek={workout.day_of_week} weekNumber={weekNumber} />
                  ))}
                </div>
              </div>
            )}

            {exercises.length === 0 && (
              <p className="text-sm text-muted-foreground italic text-center py-4">
                Exercises to be added by your coach
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const WeekCard = ({ week }: { week: ProgramWeek }) => {
    const phaseInfo = getPhaseInfo(week.phase);
    const isExpanded = expandedWeek === week.week_number;
    const isCurrentWeek = currentWeek === week.week_number;
    const isCompleted = week.week_number < currentWeek;

    const weekWorkouts = getWorkoutsForWeek(week.id);
    const workoutCount = weekWorkouts.filter(w => !w.is_rest_day).length;

    return (
      <div className={`rounded-xl border transition-all ${
        isCurrentWeek 
          ? 'border-primary shadow-[0_0_30px_-10px_hsl(43_74%_49%_/_0.3)] bg-charcoal' 
          : isCompleted 
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-border bg-card hover:border-primary/30'
      }`}>
        {/* Week Header */}
        <button
          onClick={() => setExpandedWeek(isExpanded ? null : week.week_number)}
          className="w-full p-6 text-left"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Week Number Circle */}
              <div className={`relative w-14 h-14 rounded-full flex items-center justify-center font-display text-xl ${
                isCurrentWeek 
                  ? 'bg-primary text-primary-foreground' 
                  : isCompleted
                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                    : `${phaseInfo.bgColor} ${phaseInfo.textColor} border-2 ${phaseInfo.borderColor}`
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  week.week_number
                )}
                {isCurrentWeek && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
                )}
              </div>

              {/* Week Info */}
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className={`${phaseInfo.bgColor} ${phaseInfo.textColor} ${phaseInfo.borderColor} border text-xs`}>
                    {phaseInfo.name}
                  </Badge>
                  {isCurrentWeek && (
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      Current Week
                    </Badge>
                  )}
                  {week.video_url && (
                    <Badge variant="outline" className="text-xs">
                      <PlayCircle className="w-3 h-3 mr-1" /> Video
                    </Badge>
                  )}
                </div>
                <h3 className="font-display text-xl">
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
                className={`p-5 rounded-xl border transition-all text-left ${
                  isActive 
                    ? `${phase.bgColor} ${phase.borderColor} border-2` 
                    : isComplete
                      ? 'bg-green-500/5 border-green-500/30'
                      : 'bg-charcoal border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <phase.icon className={`w-6 h-6 ${isComplete ? 'text-green-400' : phase.textColor}`} />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Weeks {phase.weeks}
                    </p>
                    <h3 className={`font-display text-lg ${isActive ? phase.textColor : ''}`}>
                      {phase.name} Phase
                    </h3>
                  </div>
                  {isComplete && <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto" />}
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

      {/* Exercise Demo Modal */}
      <Dialog open={!!demoExercise} onOpenChange={(open) => !open && setDemoExercise(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              {demoExercise?.exercise_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {demoExercise?.demo_url ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-charcoal">
                <video
                  src={demoExercise.demo_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-charcoal flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Demo video coming soon</p>
                </div>
              </div>
            )}
            {demoExercise?.notes && (
              <div className="p-4 rounded-lg bg-muted/20 border border-border">
                <h4 className="font-medium mb-2 text-sm">Instructions</h4>
                <p className="text-sm text-muted-foreground">{demoExercise.notes}</p>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {demoExercise?.sets && (
                <Badge variant="secondary">{demoExercise.sets} sets</Badge>
              )}
              {demoExercise?.reps_or_time && (
                <Badge variant="outline">{demoExercise.reps_or_time}</Badge>
              )}
              {demoExercise?.rest && (
                <Badge variant="outline">Rest: {demoExercise.rest}</Badge>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Program;
