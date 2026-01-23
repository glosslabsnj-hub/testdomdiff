import { Link } from "react-router-dom";
import { ArrowLeft, Sun, Moon, Droplet, BookOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const Discipline = () => {
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
            Daily Discipline <span className="text-primary">Templates</span>
          </h1>
          <p className="text-muted-foreground">
            Morning and evening routines. Build the structure that creates transformation.
          </p>
        </div>

        <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
          <p className="text-sm text-primary uppercase tracking-wider mb-2">Template Notice</p>
          <p className="text-muted-foreground">
            These are editable templates. Dom will customize the specific practices 
            and times based on your schedule and goals.
          </p>
        </div>

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

            <div className="space-y-4">
              {[
                { time: "5:00 AM", action: "Wake up — no snooze (Template)" },
                { time: "5:05 AM", action: "Hydration — water target (Template)" },
                { time: "5:15 AM", action: "Word — Scripture reading (Template)" },
                { time: "5:30 AM", action: "Prayer/meditation (Template)" },
                { time: "5:45 AM", action: "Movement prep (Template)" },
                { time: "6:00 AM", action: "Training session (Template)" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded bg-charcoal border border-dashed border-border"
                >
                  <span className="text-sm font-mono text-primary w-20">{item.time}</span>
                  <span className="text-sm text-muted-foreground">{item.action}</span>
                </div>
              ))}
            </div>
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

            <div className="space-y-4">
              {[
                { time: "8:00 PM", action: "No screens (Template)" },
                { time: "8:30 PM", action: "Evening reflection (Template)" },
                { time: "8:45 PM", action: "Journal — wins/lessons (Template)" },
                { time: "9:00 PM", action: "Prepare for tomorrow (Template)" },
                { time: "9:15 PM", action: "Scripture/prayer (Template)" },
                { time: "9:30 PM", action: "Lights out (Template)" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded bg-charcoal border border-dashed border-border"
                >
                  <span className="text-sm font-mono text-primary w-20">{item.time}</span>
                  <span className="text-sm text-muted-foreground">{item.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Water Tracking Template */}
        <div className="mt-8 bg-card p-8 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-6">
            <Droplet className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs text-primary uppercase tracking-wider">Hydration</p>
              <h2 className="headline-card">Water Target Tracker (Template)</h2>
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-charcoal border-2 border-dashed border-border flex items-center justify-center"
              >
                <Droplet className="w-6 h-6 text-muted-foreground" />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Target: 8 glasses (64oz) minimum — adjust based on body weight and activity
          </p>
        </div>

        {/* Evening Reflection Template */}
        <div className="mt-8 bg-card p-8 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs text-primary uppercase tracking-wider">Journaling</p>
              <h2 className="headline-card">Night Reflection Template</h2>
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
                className="p-4 rounded bg-charcoal border border-dashed border-border"
              >
                <p className="text-sm font-semibold mb-2">{prompt}</p>
                <div className="h-16 border border-dashed border-border/50 rounded" />
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
