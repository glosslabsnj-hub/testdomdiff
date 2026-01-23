import { Link } from "react-router-dom";
import { ArrowLeft, Dumbbell, Target, BookOpen, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProgramWeeks, useWorkoutTemplates } from "@/hooks/useWorkoutContent";

const Program = () => {
  const { weeks, loading: weeksLoading } = useProgramWeeks();
  const { templates, loading: templatesLoading } = useWorkoutTemplates();

  const loading = weeksLoading || templatesLoading;

  const getTemplateById = (id: string | null) => {
    if (!id) return null;
    return templates.find((t) => t.id === id);
  };

  const phases = [
    { phase: "foundation", name: "Foundation", weeks: "1-4", color: "border-l-blue-500", badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { phase: "build", name: "Build", weeks: "5-8", color: "border-l-yellow-500", badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    { phase: "peak", name: "Peak", weeks: "9-12", color: "border-l-green-500", badgeClass: "bg-green-500/20 text-green-400 border-green-500/30" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="headline-section mb-2">
            12-Week Program <span className="text-primary">Framework</span>
          </h1>
          <p className="text-muted-foreground">
            Complete structure with weekly breakdown. Follow the progression through Foundation, Build, and Peak phases.
          </p>
        </div>

        {/* Phase Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {phases.map((phase, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg bg-card border-l-4 ${phase.color} border border-border`}
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Weeks {phase.weeks}
              </p>
              <h3 className="headline-card text-primary">{phase.name}</h3>
            </div>
          ))}
        </div>

        {/* Week Grid */}
        <div className="space-y-4">
          {weeks.map((week) => {
            const phaseInfo = phases.find((p) => p.phase === week.phase);
            const workoutDays = [
              { day: "Mon", id: week.workout_monday },
              { day: "Tue", id: week.workout_tuesday },
              { day: "Wed", id: week.workout_wednesday },
              { day: "Thu", id: week.workout_thursday },
              { day: "Fri", id: week.workout_friday },
              { day: "Sat", id: week.workout_saturday },
            ].filter((d) => d.id);

            return (
              <div
                key={week.id}
                className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-display text-xl">
                      {week.week_number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Week {week.week_number}
                        </p>
                        <Badge className={phaseInfo?.badgeClass}>{phaseInfo?.name}</Badge>
                      </div>
                      <h3 className="headline-card">{week.title || `Week ${week.week_number}`}</h3>
                      {week.focus_description && (
                        <p className="text-sm text-muted-foreground mt-1">{week.focus_description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex-grow md:ml-4">
                    {workoutDays.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {workoutDays.map(({ day, id }) => {
                          const template = getTemplateById(id);
                          return template ? (
                            <Link
                              key={day}
                              to={`/dashboard/workouts/${template.template_slug}`}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-charcoal border border-border text-sm hover:border-primary/50 transition-colors"
                            >
                              <span className="text-primary font-medium">{day}:</span>
                              <span className="text-muted-foreground">{template.name}</span>
                            </Link>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic mb-3">Schedule to be assigned</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {week.conditioning_notes && (
                        <div className="p-2 rounded bg-charcoal border border-border">
                          <div className="flex items-center gap-1 mb-1">
                            <Target className="w-3 h-3 text-primary" />
                            <p className="text-xs text-primary">Conditioning</p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{week.conditioning_notes}</p>
                        </div>
                      )}
                      {week.recovery_notes && (
                        <div className="p-2 rounded bg-charcoal border border-border">
                          <div className="flex items-center gap-1 mb-1">
                            <Heart className="w-3 h-3 text-primary" />
                            <p className="text-xs text-primary">Recovery</p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{week.recovery_notes}</p>
                        </div>
                      )}
                      {week.scripture_reference && (
                        <div className="p-2 rounded bg-charcoal border border-border">
                          <div className="flex items-center gap-1 mb-1">
                            <BookOpen className="w-3 h-3 text-primary" />
                            <p className="text-xs text-primary">Scripture</p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{week.scripture_reference}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex gap-4">
          <Button variant="gold" asChild>
            <Link to="/dashboard/workouts">View Workout Templates</Link>
          </Button>
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Program;
