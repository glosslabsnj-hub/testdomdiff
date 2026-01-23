import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Target, BookOpen, Dumbbell, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Program = () => {
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

  const phases = [
    { phase: "Foundation", weeks: "1-4", color: "border-l-blue-500" },
    { phase: "Build", weeks: "5-8", color: "border-l-yellow-500" },
    { phase: "Peak", weeks: "9-12", color: "border-l-green-500" },
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

        <div className="mb-8">
          <h1 className="headline-section mb-2">
            12-Week Program <span className="text-primary">Framework</span>
          </h1>
          <p className="text-muted-foreground">
            Complete structure with weekly breakdown. Templates only — Dom fills in the specifics.
          </p>
        </div>

        <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
          <p className="text-sm text-primary uppercase tracking-wider mb-2">Template Framework</p>
          <p className="text-muted-foreground">
            This 12-week structure provides the framework. Each week will be populated 
            with specific workouts, focus areas, and mindset lessons by Dom.
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
              <h3 className="headline-card text-primary">{phase.phase}</h3>
            </div>
          ))}
        </div>

        {/* Week Grid */}
        <div className="space-y-4">
          {weeks.map((week) => {
            const phase = week <= 4 ? "Foundation" : week <= 8 ? "Build" : "Peak";
            const phaseColor = week <= 4 ? "blue" : week <= 8 ? "yellow" : "green";
            
            return (
              <div
                key={week}
                className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-display text-xl">
                      {week}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Week {week} • {phase} Phase
                      </p>
                      <h3 className="headline-card">Weekly Focus (Template)</h3>
                    </div>
                  </div>
                  
                  <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded bg-charcoal border border-dashed border-border text-center">
                      <Dumbbell className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Workouts</p>
                    </div>
                    <div className="p-3 rounded bg-charcoal border border-dashed border-border text-center">
                      <Target className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Conditioning</p>
                    </div>
                    <div className="p-3 rounded bg-charcoal border border-dashed border-border text-center">
                      <Heart className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Recovery</p>
                    </div>
                    <div className="p-3 rounded bg-charcoal border border-dashed border-border text-center">
                      <BookOpen className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Scripture</p>
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
