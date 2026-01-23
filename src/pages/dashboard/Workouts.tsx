import { Link } from "react-router-dom";
import { ArrowLeft, Dumbbell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Workouts = () => {
  const templates = [
    {
      id: "cell-block-push",
      name: "Cell Block Push (Template)",
      focus: "Chest, Shoulders, Triceps",
      description: "Prison-style push workout. Minimal equipment, maximum intensity.",
    },
    {
      id: "yard-legs",
      name: "Yard Legs (Template)",
      focus: "Quads, Hamstrings, Glutes",
      description: "Lower body work that builds power and endurance.",
    },
    {
      id: "lockdown-pull",
      name: "Lockdown Pull (Template)",
      focus: "Back, Biceps, Rear Delts",
      description: "Pull movements for a strong, defined back.",
    },
    {
      id: "full-body-circuit",
      name: "Full Body Circuit (Template)",
      focus: "Total Body Conditioning",
      description: "High-intensity circuit for conditioning and fat loss.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="headline-section mb-2">
              Workout <span className="text-primary">Templates</span>
            </h1>
            <p className="text-muted-foreground">
              Prison-style frameworks. You fill in the work.
            </p>
          </div>
        </div>

        <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
          <p className="text-sm text-primary uppercase tracking-wider mb-2">How to Use These Templates</p>
          <p className="text-muted-foreground">
            Each template provides a structure with blank sections. Dom will fill in 
            specific exercises, sets, and reps based on your program phase.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {templates.map((template) => (
            <Link
              key={template.id}
              to={`/dashboard/workouts/${template.id}`}
              className="p-6 rounded-lg bg-charcoal border border-border hover:border-primary/50 transition-all group"
            >
              <Dumbbell className="w-8 h-8 text-primary mb-4" />
              <h3 className="headline-card mb-1 group-hover:text-primary transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-primary mb-2">{template.focus}</p>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </Link>
          ))}
        </div>

        {/* Week Builder Section */}
        <div className="bg-card p-8 rounded-lg border border-border">
          <h2 className="headline-card mb-4">Week Builder (Template)</h2>
          <p className="text-muted-foreground mb-6">
            Assign workout templates to each day of the week. Build your personalized schedule.
          </p>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-4 rounded-lg bg-charcoal border border-border text-center"
              >
                <p className="text-sm font-bold mb-2">{day}</p>
                <div className="h-16 border-2 border-dashed border-border rounded flex items-center justify-center">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Click on a day to assign a workout template. This will be fully functional 
            once Dom populates the workout content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Workouts;
