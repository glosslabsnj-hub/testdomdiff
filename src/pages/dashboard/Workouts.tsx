import { Link } from "react-router-dom";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWorkoutTemplates } from "@/hooks/useWorkoutContent";
import { useAuth } from "@/contexts/AuthContext";
import { WardenTip } from "@/components/warden";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import EmptyState from "@/components/EmptyState";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import { addMinutes } from "@/lib/calendarUtils";

const Workouts = () => {
  const { templates, loading } = useWorkoutTemplates();
  const { subscription } = useAuth();
  const isCoaching = subscription?.plan_type === "coaching";

  // Only show active bodyweight templates for all users
  const visibleTemplates = templates.filter(t => t.is_active && t.is_bodyweight);

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {isCoaching ? "Dashboard" : "Cell Block"}
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="headline-section mb-2">
              <span className="text-primary">{isCoaching ? "Training" : "Yard Time"}</span> — {isCoaching ? "Workout Library" : "Training Templates"}
            </h1>
            <p className="text-muted-foreground">
              {isCoaching 
                ? "Your complete workout library. Train with purpose."
                : "Bodyweight workouts. No equipment, no excuses. Prison-style training."}
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
          <DashboardSkeleton variant="grid" count={4} />
        ) : visibleTemplates.length === 0 ? (
          <EmptyState
            type="workouts"
            title="No workout templates available"
            description="Your training library is being prepared. Check back soon for bodyweight workouts you can do anywhere."
            actionLabel="View 12-Week Program"
            actionLink="/dashboard/program"
          />
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {visibleTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-6 rounded-lg bg-charcoal border border-border hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Dumbbell className="w-8 h-8 text-primary" />
                    <div className="flex items-center gap-2">
                      {template.is_bodyweight && (
                        <Badge variant="outline" className="text-xs">Bodyweight</Badge>
                      )}
                      <AddToCalendarButton
                        title={`Workout: ${template.name}`}
                        description={`${template.focus}\n\n${template.description || "Complete this workout with intensity and purpose."}`}
                        startTime={(() => {
                          const today = new Date();
                          today.setHours(6, 0, 0, 0); // Default to 6:00 AM
                          return today;
                        })()}
                        endTime={addMinutes((() => {
                          const today = new Date();
                          today.setHours(6, 0, 0, 0);
                          return today;
                        })(), 60)}
                        size="sm"
                        variant="ghost"
                      />
                    </div>
                  </div>
                  <Link
                    to={`/dashboard/workouts/${template.template_slug}`}
                    className="block"
                  >
                    <h3 className="headline-card mb-1 group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-primary mb-2">{template.focus}</p>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </Link>
                </div>
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
