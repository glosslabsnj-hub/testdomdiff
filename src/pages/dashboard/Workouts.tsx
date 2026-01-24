import { Link } from "react-router-dom";
import { ArrowLeft, Dumbbell, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWorkoutTemplates } from "@/hooks/useWorkoutContent";
import { WardenTip } from "@/components/warden";

const Workouts = () => {
  const { templates, loading } = useWorkoutTemplates();

  // Only show active bodyweight templates for all users
  const visibleTemplates = templates.filter(t => t.is_active && t.is_bodyweight);

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cell Block
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="headline-section mb-2">
              <span className="text-primary">Yard Time</span> — Training Templates
            </h1>
            <p className="text-muted-foreground">
              Bodyweight workouts. No equipment, no excuses. Prison-style training.
            </p>
          </div>
        </div>

        {/* Warden Tip */}
        <WardenTip 
          tip="Bodyweight builds real strength. No equipment, no excuses. Pick a template and get after it."
          className="mb-8"
        />

        <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
          <p className="text-sm text-primary uppercase tracking-wider mb-2">How to Use These Templates</p>
          <p className="text-muted-foreground">
            Each template provides a complete workout with warm-up, main work, finisher, and cool-down sections.
            Follow the exercises, sets, and reps as prescribed.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : visibleTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No workout templates available yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {visibleTemplates.map((template) => (
                <Link
                  key={template.id}
                  to={`/dashboard/workouts/${template.template_slug}`}
                  className="p-6 rounded-lg bg-charcoal border border-border hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Dumbbell className="w-8 h-8 text-primary" />
                    {template.is_bodyweight && (
                      <Badge variant="outline" className="text-xs">Bodyweight</Badge>
                    )}
                  </div>
                  <h3 className="headline-card mb-1 group-hover:text-primary transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-primary mb-2">{template.focus}</p>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Week Builder Section */}
        <div className="bg-card p-8 rounded-lg border border-border">
          <h2 className="headline-card mb-4">Your Weekly Schedule</h2>
          <p className="text-muted-foreground mb-6">
            Build your own weekly workout schedule using the templates above.
          </p>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-4 rounded-lg bg-charcoal border border-border text-center"
              >
                <p className="text-sm font-bold mb-2">{day}</p>
                <div className="h-16 border-2 border-dashed border-border rounded flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Assign workouts to each day of the week. Rest on Sundays.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Workouts;
