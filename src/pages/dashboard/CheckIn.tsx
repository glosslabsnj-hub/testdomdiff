import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, Check, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCheckIns, CheckInFormData } from "@/hooks/useCheckIns";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const CheckIn = () => {
  const { checkIns, loading, submitCheckIn, getCurrentWeekNumber } = useCheckIns();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const currentWeek = getCurrentWeekNumber();

  const [formData, setFormData] = useState<CheckInFormData>({
    week_number: currentWeek,
    weight: "",
    waist: "",
    steps_avg: "",
    workouts_completed: "",
    wins: "",
    struggles: "",
    changes: "",
    faith_reflection: "",
  });

  // Update week number when it changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, week_number: currentWeek }));
  }, [currentWeek]);

  const handleChange = (field: keyof CheckInFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await submitCheckIn(formData);
      toast({
        title: "Check-in submitted!",
        description: `Week ${formData.week_number} check-in saved successfully.`,
      });
      // Reset form for next week
      setFormData({
        week_number: currentWeek + 1,
        weight: "",
        waist: "",
        steps_avg: "",
        workouts_completed: "",
        wins: "",
        struggles: "",
        changes: "",
        faith_reflection: "",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit check-in",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Cell Block
        </Link>

        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="headline-section mb-2">Roll <span className="text-primary">Call</span></h1>
              <p className="text-muted-foreground">Submit your weekly accountability report to stay compliant.</p>
            </div>
            <Button
              variant={showHistory ? "gold" : "goldOutline"}
              onClick={() => setShowHistory(!showHistory)}
              className="gap-2"
            >
              <History className="w-4 h-4" />
              {showHistory ? "New Report" : "View Past Reports"}
            </Button>
          </div>

          {showHistory ? (
            <div className="space-y-4">
              {checkIns.length === 0 ? (
                <div className="bg-card p-8 rounded-lg border border-border text-center">
                  <p className="text-muted-foreground">No check-ins submitted yet.</p>
                </div>
              ) : (
                checkIns.map((checkIn) => (
                  <div key={checkIn.id} className="bg-card p-6 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-primary">Week {checkIn.week_number}</h3>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(checkIn.submitted_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Weight</p>
                        <p className="font-semibold">{checkIn.weight || "—"} lbs</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Waist</p>
                        <p className="font-semibold">{checkIn.waist || "—"}"</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Steps</p>
                        <p className="font-semibold">{checkIn.steps_avg?.toLocaleString() || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Workouts</p>
                        <p className="font-semibold">{checkIn.workouts_completed || "—"}</p>
                      </div>
                    </div>
                    {checkIn.wins && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground">Wins</p>
                        <p className="text-sm">{checkIn.wins}</p>
                      </div>
                    )}
                    {checkIn.struggles && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground">Struggles</p>
                        <p className="text-sm">{checkIn.struggles}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6 bg-card p-8 rounded-lg border border-border">
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/30 mb-6">
                <p className="text-sm font-semibold text-primary">Count {formData.week_number} Report</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Weight (lbs)</Label>
                  <Input
                    className="bg-charcoal"
                    placeholder="Current weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Waist (inches)</Label>
                  <Input
                    className="bg-charcoal"
                    placeholder="Waist measurement"
                    type="number"
                    step="0.1"
                    value={formData.waist}
                    onChange={(e) => handleChange("waist", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Avg Daily Steps</Label>
                  <Input
                    className="bg-charcoal"
                    placeholder="Average steps"
                    type="number"
                    value={formData.steps_avg}
                    onChange={(e) => handleChange("steps_avg", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Workouts Completed</Label>
                  <Input
                    className="bg-charcoal"
                    placeholder="# of workouts"
                    type="number"
                    value={formData.workouts_completed}
                    onChange={(e) => handleChange("workouts_completed", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>This Week's Wins</Label>
                <Textarea
                  className="bg-charcoal"
                  rows={3}
                  placeholder="What went well this week?"
                  value={formData.wins}
                  onChange={(e) => handleChange("wins", e.target.value)}
                />
              </div>
              <div>
                <Label>Struggles</Label>
                <Textarea
                  className="bg-charcoal"
                  rows={3}
                  placeholder="What was hard this week?"
                  value={formData.struggles}
                  onChange={(e) => handleChange("struggles", e.target.value)}
                />
              </div>
              <div>
                <Label>What Changes Next Week?</Label>
                <Textarea
                  className="bg-charcoal"
                  rows={2}
                  placeholder="What adjustments will you make?"
                  value={formData.changes}
                  onChange={(e) => handleChange("changes", e.target.value)}
                />
              </div>
              <div>
                <Label>Faith Reflection (Optional)</Label>
                <Textarea
                  className="bg-charcoal"
                  rows={2}
                  placeholder="How did you honor God this week?"
                  value={formData.faith_reflection}
                  onChange={(e) => handleChange("faith_reflection", e.target.value)}
                />
              </div>
              <Button
                variant="gold"
                size="lg"
                className="w-full gap-2"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Report In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
