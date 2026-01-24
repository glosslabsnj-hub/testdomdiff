import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Circle, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserChecklist } from "@/hooks/useUserChecklist";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const CHECKLIST_ITEMS = [
  {
    category: "Inmate Registration",
    items: [
      { id: "profile-1", label: "Complete your processing form" },
      { id: "profile-2", label: "Set your training days" },
      { id: "profile-3", label: "Choose your equipment level" },
    ],
  },
  {
    category: "Yard Prep",
    items: [
      { id: "training-1", label: "Review workout templates" },
      { id: "training-2", label: "Create your first week's schedule" },
      { id: "training-3", label: "Set up your training space" },
    ],
  },
  {
    category: "Block Rules",
    items: [
      { id: "discipline-1", label: "Review daily discipline routine templates" },
      { id: "discipline-2", label: "Set your reveille time" },
      { id: "discipline-3", label: "Commit to your morning routine" },
    ],
  },
  {
    category: "Record Keeping",
    items: [
      { id: "progress-1", label: "Take starting photos" },
      { id: "progress-2", label: "Record starting measurements" },
      { id: "progress-3", label: "Set your first 4-week goals" },
    ],
  },
];

const totalItems = CHECKLIST_ITEMS.reduce((acc, cat) => acc + cat.items.length, 0);

const StartHere = () => {
  const { loading, toggleItem, isItemCompleted, getCompletionPercent } = useUserChecklist();
  const { toast } = useToast();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const completionPercent = getCompletionPercent(totalItems);

  const handleToggle = async (itemId: string) => {
    try {
      setTogglingId(itemId);
      await toggleItem(itemId);
      
      const wasCompleted = isItemCompleted(itemId);
      if (!wasCompleted) {
        toast({
          title: "Nice work!",
          description: "Keep building momentum.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update checklist",
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cell Block
        </Link>

        <div className="max-w-3xl">
          <h1 className="headline-section mb-2">
            Intake <span className="text-primary">Processing</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Complete your Week 0 setup. Check off each item as you get processed into the system.
          </p>

          {/* Progress Bar */}
          <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="font-semibold">Your Progress</span>
              </div>
              <span className="text-2xl font-bold text-primary">{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {completionPercent === 100 
                ? "🎉 You're ready to crush it!"
                : `${totalItems - Math.round(completionPercent / 100 * totalItems)} items remaining`}
            </p>
          </div>

          <div className="space-y-8">
            {CHECKLIST_ITEMS.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="headline-card mb-4 text-primary">{section.category}</h2>
                <div className="space-y-3">
                  {section.items.map((item) => {
                    const completed = isItemCompleted(item.id);
                    const isToggling = togglingId === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleToggle(item.id)}
                        disabled={isToggling}
                        className="w-full flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-left disabled:opacity-50"
                      >
                        {isToggling ? (
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        ) : completed ? (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground" />
                        )}
                        <span className={completed ? "line-through text-muted-foreground" : ""}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex gap-4">
            <Button variant="gold" asChild>
              <Link to="/dashboard/workouts">Report to Yard Time</Link>
            </Button>
            <Button variant="goldOutline" asChild>
              <Link to="/dashboard">Back to Cell Block</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartHere;
