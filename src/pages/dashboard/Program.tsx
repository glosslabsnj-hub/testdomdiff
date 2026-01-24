import { useState, useEffect } from "react";
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
  Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useProgramWeeks, useWorkoutTemplates, ProgramWeek, WorkoutTemplate } from "@/hooks/useWorkoutContent";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import UpgradePrompt from "@/components/UpgradePrompt";

interface WorkoutExercise {
  id: string;
  exercise_name: string;
  section_type: string;
  sets: string | null;
  reps_or_time: string | null;
  rest: string | null;
  notes: string | null;
  display_order: number;
}

const Program = () => {
  const { weeks, loading: weeksLoading } = useProgramWeeks();
  const { templates, loading: templatesLoading } = useWorkoutTemplates();
  const { subscription } = useAuth();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [exercisesByTemplate, setExercisesByTemplate] = useState<Record<string, WorkoutExercise[]>>({});
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1); // TODO: Calculate from subscription start date

  const loading = weeksLoading || templatesLoading;

  // Fetch exercises for all templates used in program weeks
  useEffect(() => {
    const fetchAllExercises = async () => {
      if (weeks.length === 0 || templates.length === 0) return;
      
      setLoadingExercises(true);
      const templateIds = new Set<string>();
      
      weeks.forEach(week => {
        [week.workout_monday, week.workout_tuesday, week.workout_wednesday, 
         week.workout_thursday, week.workout_friday, week.workout_saturday]
          .filter(Boolean)
          .forEach(id => templateIds.add(id as string));
      });

      try {
        const { data, error } = await supabase
          .from("workout_exercises")
          .select("*")
          .in("template_id", Array.from(templateIds))
          .order("display_order");

        if (error) throw error;

        const grouped: Record<string, WorkoutExercise[]> = {};
        (data || []).forEach((ex: any) => {
          if (!grouped[ex.template_id]) grouped[ex.template_id] = [];
          grouped[ex.template_id].push(ex);
        });
        setExercisesByTemplate(grouped);
      } catch (e) {
        console.error("Error fetching exercises:", e);
      } finally {
        setLoadingExercises(false);
      }
    };

    fetchAllExercises();
  }, [weeks, templates]);

  // Only transformation and coaching users can access
  if (subscription?.plan_type === "membership") {
    return <UpgradePrompt feature="12-Week Program" upgradeTo="transformation" />;
  }

  const getTemplateById = (id: string | null): WorkoutTemplate | null => {
    if (!id) return null;
    return templates.find((t) => t.id === id) || null;
  };

  const phases = [
    { phase: "foundation", name: "Foundation", weeks: "1-4", icon: Target, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30", textColor: "text-blue-400" },
    { phase: "build", name: "Build", weeks: "5-8", icon: Flame, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30", textColor: "text-amber-400" },
    { phase: "peak", name: "Peak", weeks: "9-12", icon: Trophy, color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10", borderColor: "border-green-500/30", textColor: "text-green-400" },
  ];

  const getPhaseInfo = (phase: string) => phases.find(p => p.phase === phase) || phases[0];

  // Calculate overall progress
  const completedWeeks = Math.min(currentWeek - 1, 12);
  const progressPercent = (completedWeeks / 12) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const WorkoutCard = ({ templateId, day }: { templateId: string; day: string }) => {
    const template = getTemplateById(templateId);
    const exercises = exercisesByTemplate[templateId] || [];
    const [isOpen, setIsOpen] = useState(false);

    if (!template) return null;

    const mainExercises = exercises.filter(e => e.section_type === "main");
    const warmupExercises = exercises.filter(e => e.section_type === "warmup");
    const finisherExercises = exercises.filter(e => e.section_type === "finisher");
    const cooldownExercises = exercises.filter(e => e.section_type === "cooldown");

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal border border-border hover:border-primary/50 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-primary uppercase tracking-wider font-medium">{day}</p>
                <h4 className="font-display text-lg">{template.name}</h4>
                <p className="text-sm text-muted-foreground">{template.focus}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                {mainExercises.length} exercises
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
            {template.description && (
              <p className="text-sm text-muted-foreground italic border-l-2 border-primary pl-3">
                {template.description}
              </p>
            )}

            {warmupExercises.length > 0 && (
              <div>
                <h5 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
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
                <h5 className="text-xs uppercase tracking-wider text-orange-400 mb-2 flex items-center gap-2">
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
                <h5 className="text-xs uppercase tracking-wider text-green-400 mb-2 flex items-center gap-2">
                  <Heart className="w-3 h-3" /> Cool-Down
                </h5>
                <div className="space-y-2">
                  {cooldownExercises.map((ex) => (
                    <ExerciseRow key={ex.id} exercise={ex} />
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border">
              <Button variant="gold" size="sm" asChild>
                <Link to={`/dashboard/workouts/${template.template_slug}`}>
                  Open Full Workout
                </Link>
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const ExerciseRow = ({ exercise, isMain = false }: { exercise: WorkoutExercise; isMain?: boolean }) => (
    <div className={`flex items-start gap-3 p-3 rounded ${isMain ? 'bg-charcoal' : 'bg-charcoal/50'}`}>
      <div className="flex-1">
        <p className={`font-medium ${isMain ? 'text-foreground' : 'text-muted-foreground'}`}>
          {exercise.exercise_name}
        </p>
        {exercise.notes && (
          <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
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
          <span className="text-xs text-muted-foreground">Rest: {exercise.rest}</span>
        )}
      </div>
    </div>
  );

  const WeekCard = ({ week }: { week: ProgramWeek }) => {
    const phaseInfo = getPhaseInfo(week.phase);
    const isExpanded = expandedWeek === week.week_number;
    const isCurrentWeek = currentWeek === week.week_number;
    const isCompleted = week.week_number < currentWeek;
    const isFuture = week.week_number > currentWeek;

    const workoutDays = [
      { day: "Monday", id: week.workout_monday },
      { day: "Tuesday", id: week.workout_tuesday },
      { day: "Wednesday", id: week.workout_wednesday },
      { day: "Thursday", id: week.workout_thursday },
      { day: "Friday", id: week.workout_friday },
      { day: "Saturday", id: week.workout_saturday },
    ].filter((d) => d.id);

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
                <div className="flex items-center gap-2 mb-1">
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
                <p className="text-sm text-muted-foreground">{workoutDays.length} workouts</p>
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
              {workoutDays.length > 0 ? (
                <div className="space-y-3">
                  {workoutDays.map(({ day, id }) => (
                    <WorkoutCard key={day} templateId={id as string} day={day} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic p-4 rounded bg-charcoal text-center">
                  Workouts to be assigned by your coach
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
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Hero Section */}
        <div className="relative p-8 rounded-xl bg-gradient-to-br from-charcoal via-charcoal to-primary/10 border border-border mb-8 overflow-hidden">
          <div className="relative z-10">
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
              Your Transformation Journey
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl mb-3">
              12-Week <span className="text-primary">Program</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mb-6">
              Complete body and mind transformation through three strategic phases. 
              Each week builds on the last to maximize your results.
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
    </div>
  );
};

export default Program;
