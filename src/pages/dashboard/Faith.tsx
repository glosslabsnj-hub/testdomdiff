import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Cross } from "lucide-react";
import { Button } from "@/components/ui/button";

const Faith = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="headline-section mb-2">Mindset + Faith <span className="text-primary">Lessons</span></h1>
        <p className="text-muted-foreground mb-8">Weekly lessons on faith, discipline, and mindset.</p>

        <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
          <p className="text-sm text-primary uppercase tracking-wider mb-2">Lesson Template Format</p>
          <p className="text-muted-foreground">Each lesson follows this structure. Dom fills in the content.</p>
        </div>

        <div className="bg-card p-8 rounded-lg border border-border">
          <div className="space-y-6">
            <div className="p-4 bg-charcoal rounded border border-dashed border-border">
              <p className="text-xs text-primary uppercase tracking-wider mb-1">Title</p>
              <div className="h-8 border border-dashed border-border/50 rounded" />
            </div>
            <div className="p-4 bg-charcoal rounded border border-dashed border-border">
              <p className="text-xs text-primary uppercase tracking-wider mb-1">Big Idea</p>
              <div className="h-12 border border-dashed border-border/50 rounded" />
            </div>
            <div className="p-4 bg-charcoal rounded border border-dashed border-border">
              <p className="text-xs text-primary uppercase tracking-wider mb-1">Scripture</p>
              <div className="h-16 border border-dashed border-border/50 rounded" />
            </div>
            <div className="p-4 bg-charcoal rounded border border-dashed border-border">
              <p className="text-xs text-primary uppercase tracking-wider mb-1">Story / Teaching</p>
              <div className="h-24 border border-dashed border-border/50 rounded" />
            </div>
            <div className="p-4 bg-charcoal rounded border border-dashed border-border">
              <p className="text-xs text-primary uppercase tracking-wider mb-1">Action Steps</p>
              <div className="h-16 border border-dashed border-border/50 rounded" />
            </div>
            <div className="p-4 bg-charcoal rounded border border-dashed border-border">
              <p className="text-xs text-primary uppercase tracking-wider mb-1">Reflection Questions</p>
              <div className="h-16 border border-dashed border-border/50 rounded" />
            </div>
            <div className="p-4 bg-charcoal rounded border border-dashed border-border">
              <p className="text-xs text-primary uppercase tracking-wider mb-1">Weekly Challenge</p>
              <div className="h-12 border border-dashed border-border/50 rounded" />
            </div>
          </div>
        </div>

        <div className="mt-8"><Button variant="goldOutline" asChild><Link to="/dashboard">Back to Dashboard</Link></Button></div>
      </div>
    </div>
  );
};

export default Faith;
