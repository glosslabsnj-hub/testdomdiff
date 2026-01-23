import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Progress = () => {
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="headline-section mb-2">Progress <span className="text-primary">Trackers</span></h1>
        <p className="text-muted-foreground mb-8">Track your habits and progress over 12 weeks.</p>

        <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
          <p className="text-sm text-primary uppercase tracking-wider mb-2">Template Notice</p>
          <p className="text-muted-foreground">These are blank tracker templates for you to fill in.</p>
        </div>

        {/* 12-Week Progress Grid */}
        <div className="bg-card p-8 rounded-lg border border-border mb-8">
          <h2 className="headline-card mb-6">12-Week Progress Grid (Template)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2">Week</th>
                  <th className="text-center p-2">Weight</th>
                  <th className="text-center p-2">Waist</th>
                  <th className="text-center p-2">Workouts</th>
                  <th className="text-center p-2">Steps Avg</th>
                  <th className="text-center p-2">Compliance</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((week) => (
                  <tr key={week} className="border-b border-border/50">
                    <td className="p-2 font-semibold text-primary">Week {week}</td>
                    {[1,2,3,4,5].map((i) => (
                      <td key={i} className="p-2"><div className="h-6 bg-charcoal border border-dashed border-border rounded" /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Habit Tracker */}
        <div className="bg-card p-8 rounded-lg border border-border">
          <h2 className="headline-card mb-6">Habit Compliance Tracker (Template)</h2>
          <div className="grid grid-cols-8 gap-2 text-xs text-center mb-4">
            <div className="font-semibold">Habit</div>
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <div key={d} className="text-muted-foreground">{d}</div>)}
          </div>
          {["Morning Routine","Workout","Water","Nutrition","Evening Routine","Scripture"].map((habit, i) => (
            <div key={i} className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-sm text-muted-foreground">{habit}</div>
              {[1,2,3,4,5,6,7].map(d => <div key={d} className="aspect-square bg-charcoal border border-dashed border-border rounded" />)}
            </div>
          ))}
        </div>

        <div className="mt-8"><Button variant="goldOutline" asChild><Link to="/dashboard">Back to Dashboard</Link></Button></div>
      </div>
    </div>
  );
};

export default Progress;
