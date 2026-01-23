import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sun, Moon, Droplet, BookOpen, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDisciplineRoutines } from "@/hooks/useDisciplineRoutines";

const Discipline = () => {
  const { routines, loading } = useDisciplineRoutines();
  const [waterCount, setWaterCount] = useState(0);

  const morningRoutines = routines.filter((r) => r.routine_type === "morning" && r.is_active);
  const eveningRoutines = routines.filter((r) => r.routine_type === "evening" && r.is_active);

  const handleWaterClick = (index: number) => {
    if (index === waterCount) {
      setWaterCount(waterCount + 1);
    } else if (index === waterCount - 1) {
      setWaterCount(waterCount - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasRoutines = morningRoutines.length > 0 || eveningRoutines.length > 0;

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
            Daily Discipline <span className="text-primary">Routines</span>
          </h1>
          <p className="text-muted-foreground">
            Morning and evening routines. Build the structure that creates transformation.
          </p>
        </div>

        {!hasRoutines ? (
          <div className="bg-charcoal p-8 rounded-lg border border-border text-center mb-8">
            <Sun className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="headline-card mb-2">Routines Coming Soon</h3>
            <p className="text-muted-foreground">Your daily discipline routines are being prepared.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Morning Routine */}
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-6">
                <Sun className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-xs text-primary uppercase tracking-wider">Morning</p>
                  <h2 className="headline-card">Wake → Word → Work</h2>
                </div>
              </div>

              {morningRoutines.length === 0 ? (
                <p className="text-muted-foreground text-sm">No morning routine set</p>
              ) : (
                <div className="space-y-4">
                  {morningRoutines.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded bg-charcoal border border-border"
                    >
                      <span className="text-sm font-mono text-primary w-20">{item.time_slot}</span>
                      <span className="text-sm text-muted-foreground">{item.action_text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Evening Routine */}
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-6">
                <Moon className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-xs text-primary uppercase tracking-wider">Evening</p>
                  <h2 className="headline-card">Wind Down → Reflect → Rest</h2>
                </div>
              </div>

              {eveningRoutines.length === 0 ? (
                <p className="text-muted-foreground text-sm">No evening routine set</p>
              ) : (
                <div className="space-y-4">
                  {eveningRoutines.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded bg-charcoal border border-border"
                    >
                      <span className="text-sm font-mono text-primary w-20">{item.time_slot}</span>
                      <span className="text-sm text-muted-foreground">{item.action_text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Water Tracking */}
        <div className="mt-8 bg-card p-8 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-6">
            <Droplet className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs text-primary uppercase tracking-wider">Hydration</p>
              <h2 className="headline-card">Water Target Tracker</h2>
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleWaterClick(i)}
                className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${
                  i < waterCount
                    ? "bg-primary border-primary"
                    : "bg-charcoal border-dashed border-border hover:border-primary/50"
                }`}
              >
                {i < waterCount ? (
                  <Check className="w-6 h-6 text-primary-foreground" />
                ) : (
                  <Droplet className="w-6 h-6 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Target: 8 glasses (64oz) minimum — {waterCount}/8 completed today
          </p>
        </div>

        {/* Evening Reflection Template */}
        <div className="mt-8 bg-card p-8 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs text-primary uppercase tracking-wider">Journaling</p>
              <h2 className="headline-card">Night Reflection</h2>
            </div>
          </div>

          <div className="space-y-4">
            {[
              "What were my 3 wins today?",
              "What did I learn or struggle with?",
              "What am I grateful for?",
              "What will I do better tomorrow?",
              "How did I honor God today?",
            ].map((prompt, index) => (
              <div
                key={index}
                className="p-4 rounded bg-charcoal border border-border"
              >
                <p className="text-sm font-semibold mb-2">{prompt}</p>
                <textarea
                  className="w-full h-16 bg-background border border-border rounded p-2 text-sm resize-none focus:outline-none focus:border-primary/50"
                  placeholder="Write your reflection..."
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <Button variant="gold" asChild>
            <Link to="/dashboard/check-in">Go to Weekly Check-In</Link>
          </Button>
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Discipline;
