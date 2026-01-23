import { Link } from "react-router-dom";
import { ArrowLeft, Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

const StartHere = () => {
  const checklist = [
    {
      category: "Profile Setup",
      items: [
        { id: "1", label: "Complete your intake form", completed: true },
        { id: "2", label: "Set your training days", completed: false },
        { id: "3", label: "Choose your equipment level", completed: false },
      ],
    },
    {
      category: "Training Preparation",
      items: [
        { id: "4", label: "Review workout templates", completed: false },
        { id: "5", label: "Create your first week's schedule", completed: false },
        { id: "6", label: "Set up your training space", completed: false },
      ],
    },
    {
      category: "Discipline Foundations",
      items: [
        { id: "7", label: "Review daily discipline routine templates", completed: false },
        { id: "8", label: "Set your wake time", completed: false },
        { id: "9", label: "Commit to your morning routine", completed: false },
      ],
    },
    {
      category: "Progress Tracking",
      items: [
        { id: "10", label: "Take starting photos", completed: false },
        { id: "11", label: "Record starting measurements", completed: false },
        { id: "12", label: "Set your first 4-week goals", completed: false },
      ],
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

        <div className="max-w-3xl">
          <h1 className="headline-section mb-2">
            Start <span className="text-primary">Here</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Complete your Week 0 setup. Check off each item as you complete it.
          </p>

          <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
            <p className="text-sm text-primary uppercase tracking-wider mb-2">Template Notice</p>
            <p className="text-muted-foreground">
              This is a template for the Start Here checklist. Dom will customize 
              the content and add specific instructions for each item.
            </p>
          </div>

          <div className="space-y-8">
            {checklist.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="headline-card mb-4 text-primary">{section.category}</h2>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      {item.completed ? (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                      )}
                      <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex gap-4">
            <Button variant="gold" asChild>
              <Link to="/dashboard/workouts">Go to Workout Templates</Link>
            </Button>
            <Button variant="goldOutline" asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartHere;
