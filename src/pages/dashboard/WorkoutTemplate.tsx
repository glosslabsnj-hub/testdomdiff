import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Dumbbell, Flame, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";

const WorkoutTemplate = () => {
  const { templateId } = useParams();

  const templateNames: Record<string, string> = {
    "cell-block-push": "Cell Block Push",
    "yard-legs": "Yard Legs",
    "lockdown-pull": "Lockdown Pull",
    "full-body-circuit": "Full Body Circuit",
  };

  const templateName = templateNames[templateId || ""] || "Workout Template";

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
          <p className="text-sm text-primary uppercase tracking-wider mb-2">Workout Template</p>
          <h1 className="headline-section mb-2">{templateName}</h1>
          <p className="text-muted-foreground">
            Template framework — fill in with your programmed exercises.
          </p>
        </div>

        <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
          <p className="text-sm text-primary uppercase tracking-wider mb-2">Template Notice</p>
          <p className="text-muted-foreground">
            This is a blank workout template. Dom will fill in specific exercises, 
            sets, reps, and notes based on your program phase and goals.
          </p>
        </div>

        <div className="space-y-8">
          {/* Warmup Section */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Wind className="w-6 h-6 text-primary" />
              <h2 className="headline-card">Warmup (Template)</h2>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded bg-charcoal border border-dashed border-border"
                >
                  <p className="text-sm text-muted-foreground">Warmup exercise {i} — to be filled</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Work Section */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Dumbbell className="w-6 h-6 text-primary" />
              <h2 className="headline-card">Main Work (Template)</h2>
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
                    <th className="text-left p-3 text-sm font-semibold">Scaling</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="p-3">
                        <div className="h-8 bg-charcoal border border-dashed border-border rounded" />
                      </td>
                      <td className="p-3 text-center">
                        <div className="h-8 w-12 mx-auto bg-charcoal border border-dashed border-border rounded" />
                      </td>
                      <td className="p-3 text-center">
                        <div className="h-8 w-16 mx-auto bg-charcoal border border-dashed border-border rounded" />
                      </td>
                      <td className="p-3 text-center">
                        <div className="h-8 w-12 mx-auto bg-charcoal border border-dashed border-border rounded" />
                      </td>
                      <td className="p-3">
                        <div className="h-8 bg-charcoal border border-dashed border-border rounded" />
                      </td>
                      <td className="p-3">
                        <div className="h-8 bg-charcoal border border-dashed border-border rounded" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Finisher Section */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-6 h-6 text-primary" />
              <h2 className="headline-card">Finisher (Template)</h2>
            </div>
            <div className="p-4 rounded bg-charcoal border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                High-intensity finisher circuit — to be filled based on training phase
              </p>
            </div>
          </div>

          {/* Cooldown Section */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="headline-card">Cooldown (Template)</h2>
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded bg-charcoal border border-dashed border-border"
                >
                  <p className="text-sm text-muted-foreground">Cooldown/stretch {i} — to be filled</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <Button variant="gold" asChild>
            <Link to="/dashboard/workouts">Back to All Templates</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTemplate;
