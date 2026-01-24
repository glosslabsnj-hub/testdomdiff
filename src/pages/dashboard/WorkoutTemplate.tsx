import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Dumbbell, Flame, Wind, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkoutTemplates, useWorkoutExercises } from "@/hooks/useWorkoutContent";

const WorkoutTemplate = () => {
  const { templateId } = useParams();
  const { templates, loading: templatesLoading } = useWorkoutTemplates();
  
  // Find the template by slug
  const template = templates.find(t => t.template_slug === templateId);
  
  // Fetch exercises for this template
  const { exercises, loading: exercisesLoading } = useWorkoutExercises(template?.id || null);

  const loading = templatesLoading || exercisesLoading;

  // Group exercises by section
  const groupedExercises = {
    warmup: exercises.filter(e => e.section_type === "warmup"),
    main: exercises.filter(e => e.section_type === "main"),
    finisher: exercises.filter(e => e.section_type === "finisher"),
    cooldown: exercises.filter(e => e.section_type === "cooldown"),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background">
        <div className="section-container py-12">
          <Link
            to="/dashboard/workouts"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Workouts
          </Link>
          <div className="text-center py-12">
            <h1 className="headline-section mb-4">Workout Not Found</h1>
            <p className="text-muted-foreground">This workout template doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const renderExerciseSection = (
    title: string,
    icon: React.ReactNode,
    sectionExercises: typeof exercises
  ) => {
    if (sectionExercises.length === 0) {
      return (
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            {icon}
            <h2 className="headline-card">{title}</h2>
          </div>
          <p className="text-sm text-muted-foreground italic">
            No exercises added to this section yet.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center gap-3 mb-4">
          {icon}
          <h2 className="headline-card">{title}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-semibold">Exercise</th>
                <th className="text-center p-3 text-sm font-semibold">Sets</th>
                <th className="text-center p-3 text-sm font-semibold">Reps/Time</th>
                <th className="text-center p-3 text-sm font-semibold">Rest</th>
                <th className="text-left p-3 text-sm font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sectionExercises.map((exercise) => (
                <tr key={exercise.id} className="border-b border-border/50">
                  <td className="p-3">
                    <span className="font-medium">{exercise.exercise_name}</span>
                  </td>
                  <td className="p-3 text-center text-primary font-semibold">
                    {exercise.sets || "-"}
                  </td>
                  <td className="p-3 text-center">
                    {exercise.reps_or_time || "-"}
                  </td>
                  <td className="p-3 text-center text-muted-foreground">
                    {exercise.rest || "-"}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {exercise.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link
          to="/dashboard/workouts"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workouts
        </Link>

        <div className="mb-8">
          <p className="text-sm text-primary uppercase tracking-wider mb-2">
            {template.focus || "Workout Template"}
          </p>
          <h1 className="headline-section mb-2">{template.name}</h1>
          <p className="text-muted-foreground">
            {template.description || "Complete this workout with focus and intensity."}
          </p>
        </div>

        {exercises.length === 0 ? (
          <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
            <p className="text-sm text-primary uppercase tracking-wider mb-2">Coming Soon</p>
            <p className="text-muted-foreground">
              Exercises for this workout template are being added. Check back soon or 
              contact your coach for a custom workout plan.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {renderExerciseSection(
              "Warmup",
              <Wind className="w-6 h-6 text-primary" />,
              groupedExercises.warmup
            )}

            {renderExerciseSection(
              "Main Work",
              <Dumbbell className="w-6 h-6 text-primary" />,
              groupedExercises.main
            )}

            {renderExerciseSection(
              "Finisher",
              <Flame className="w-6 h-6 text-primary" />,
              groupedExercises.finisher
            )}

            {renderExerciseSection(
              "Cooldown",
              <Clock className="w-6 h-6 text-primary" />,
              groupedExercises.cooldown
            )}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Button variant="gold" asChild>
            <Link to="/dashboard/workouts">Back to All Workouts</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTemplate;
