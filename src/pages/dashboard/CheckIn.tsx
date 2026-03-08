import { useState, useEffect } from "react";
import { Send, Check, History, Camera, Loader2, CheckCircle2, Dumbbell, BookOpen, BarChart3, LayoutDashboard, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCheckIns, CheckInFormData } from "@/hooks/useCheckIns";
import { useProgressPhotos } from "@/hooks/useProgressPhotos";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import PhotoUploadCard from "@/components/progress/PhotoUploadCard";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import EmptyState from "@/components/EmptyState";
import DashboardBackLink from "@/components/DashboardBackLink";
import StickyMobileFooter from "@/components/StickyMobileFooter";
import DashboardLayout from "@/components/DashboardLayout";
import { z } from "zod";

// Validation schema for check-in form
const checkInSchema = z.object({
  weight: z.string().optional().refine(val => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0 && parseFloat(val) < 1000), {
    message: "Enter a valid weight (1-999 lbs)"
  }),
  waist: z.string().optional().refine(val => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0 && parseFloat(val) < 100), {
    message: "Enter a valid waist measurement (1-99 inches)"
  }),
  steps_avg: z.string().optional().refine(val => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) < 100000), {
    message: "Enter a valid step count (0-99,999)"
  }),
  workouts_completed: z.string().optional().refine(val => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 14), {
    message: "Enter a valid workout count (0-14)"
  }),
  wins: z.string().max(1000, "Wins must be less than 1000 characters").optional(),
  struggles: z.string().max(1000, "Struggles must be less than 1000 characters").optional(),
  changes: z.string().max(500, "Changes must be less than 500 characters").optional(),
  faith_reflection: z.string().max(1000, "Faith reflection must be less than 1000 characters").optional(),
});

const CheckIn = () => {
  const { checkIns, loading, submitCheckIn, getCurrentWeekNumber } = useCheckIns();
  const { uploadPhoto, getPhotosByType } = useProgressPhotos();
  const { subscription } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedWeek, setSubmittedWeek] = useState<number>(0);
  const navigate = useNavigate();

  const isCoaching = subscription?.plan_type === "coaching";
  const currentWeek = getCurrentWeekNumber();

  // Get weekly photos for the current week
  const duringPhotos = getPhotosByType("during");
  const hasWeeklyPhoto = duringPhotos.some(p => p.week_number === currentWeek);

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

  const handlePhotoUpload = async (file: File, options: { caption?: string; privacyLevel?: "private" | "coach_only" | "public" }) => {
    const success = await uploadPhoto(file, "during", { ...options, weekNumber: currentWeek });
    if (success) {
      toast({
        title: "Photo uploaded!",
        description: `Week ${currentWeek} progress photo saved.`,
      });
      setShowPhotoUpload(false);
    }
    return success;
  };

  const validateForm = (): boolean => {
    const result = checkInSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      return false;
    }
    setValidationErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (formData.week_number < 1 || formData.week_number > 12) {
      toast({
        title: "Invalid week",
        description: "Week number must be between 1 and 12.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Check the highlighted fields and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await submitCheckIn(formData);
      setSubmittedWeek(formData.week_number);
      setShowSuccess(true);
      setValidationErrors({});
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

  const handleDismissSuccess = () => {
    setShowSuccess(false);
    // Reset form for next week (capped at 12)
    setFormData({
      week_number: Math.min(currentWeek + 1, 12),
      weight: "",
      waist: "",
      steps_avg: "",
      workouts_completed: "",
      wins: "",
      struggles: "",
      changes: "",
      faith_reflection: "",
    });
  };

  const hasProgram = subscription?.plan_type === "transformation" || subscription?.plan_type === "coaching";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="section-container py-12">
          <DashboardBackLink className="mb-8" />
          <DashboardSkeleton variant="detail" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="section-container py-6 sm:py-12">
        <DashboardBackLink className="mb-4 sm:mb-8 min-h-[44px] inline-flex items-center" />

        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <h1 className="headline-section mb-2">
                {isCoaching ? "Weekly" : "Roll"} <span className="text-primary">{isCoaching ? "Report" : "Call"}</span>
              </h1>
              <p className="text-muted-foreground">
                {isCoaching 
                  ? "Submit your weekly progress report to stay on track."
                  : "Submit your weekly accountability report to stay compliant."}
              </p>
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

          {showSuccess ? (
            <div className="space-y-6 bg-card p-6 sm:p-10 rounded-lg border border-border text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Week {submittedWeek} {isCoaching ? "Report" : "Check-In"} Submitted
                </h2>
                <p className="text-muted-foreground">
                  Your progress has been logged. Consistency is what separates those who make it from those who don't. Keep showing up.
                </p>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4 text-left">What's Next</h3>
                <div className="space-y-3">
                  {hasProgram ? (
                    <button
                      onClick={() => navigate("/dashboard/program")}
                      className="w-full flex items-center justify-between p-4 rounded-lg border border-border bg-charcoal hover:border-primary/50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-semibold text-sm">Continue The Sentence</p>
                          <p className="text-xs text-muted-foreground">Pick up your 12-week program</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ) : null}
                  <button
                    onClick={() => navigate("/dashboard/workouts")}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-border bg-charcoal hover:border-primary/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <Dumbbell className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">Hit the Iron Pile</p>
                        <p className="text-xs text-muted-foreground">Get your next workout in</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                  <button
                    onClick={() => navigate("/dashboard/progress")}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-border bg-charcoal hover:border-primary/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">View Your Progress</p>
                        <p className="text-xs text-muted-foreground">See how far you've come</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-border bg-charcoal hover:border-primary/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">Back to Cell Block</p>
                        <p className="text-xs text-muted-foreground">Return to your dashboard</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="goldOutline"
                  onClick={handleDismissSuccess}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Another Check-In
                </Button>
              </div>
            </div>
          ) : showHistory ? (
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
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Weight</p>
                        <p className="font-semibold text-sm sm:text-base">{checkIn.weight || "—"} lbs</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Waist</p>
                        <p className="font-semibold text-sm sm:text-base">{checkIn.waist || "—"}"</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Avg Steps</p>
                        <p className="font-semibold text-sm sm:text-base">{checkIn.steps_avg?.toLocaleString() || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Workouts</p>
                        <p className="font-semibold text-sm sm:text-base">{checkIn.workouts_completed || "—"}</p>
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
            <div className="space-y-5 sm:space-y-6 bg-card p-4 sm:p-8 rounded-lg border border-border">
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/30 mb-6">
                <p className="text-sm font-semibold text-primary">Count {formData.week_number} Report</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">Weight (lbs)</Label>
                  <Input
                    className={`bg-charcoal h-11 ${validationErrors.weight ? 'border-destructive' : ''}`}
                    placeholder="Current weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                  />
                  {validationErrors.weight && (
                    <p className="text-xs text-destructive">{validationErrors.weight}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Waist (inches)</Label>
                  <Input
                    className={`bg-charcoal h-11 ${validationErrors.waist ? 'border-destructive' : ''}`}
                    placeholder="Waist measurement"
                    type="number"
                    step="0.1"
                    value={formData.waist}
                    onChange={(e) => handleChange("waist", e.target.value)}
                  />
                  {validationErrors.waist && (
                    <p className="text-xs text-destructive">{validationErrors.waist}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">Avg Daily Steps</Label>
                  <Input
                    className={`bg-charcoal h-11 ${validationErrors.steps_avg ? 'border-destructive' : ''}`}
                    placeholder="Average steps"
                    type="number"
                    value={formData.steps_avg}
                    onChange={(e) => handleChange("steps_avg", e.target.value)}
                  />
                  {validationErrors.steps_avg && (
                    <p className="text-xs text-destructive">{validationErrors.steps_avg}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Workouts Completed</Label>
                  <Input
                    className={`bg-charcoal h-11 ${validationErrors.workouts_completed ? 'border-destructive' : ''}`}
                    placeholder="# of workouts"
                    type="number"
                    value={formData.workouts_completed}
                    onChange={(e) => handleChange("workouts_completed", e.target.value)}
                  />
                  {validationErrors.workouts_completed && (
                    <p className="text-xs text-destructive">{validationErrors.workouts_completed}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">This Week's Wins</Label>
                <Textarea
                  className={`bg-charcoal min-h-[80px] sm:min-h-0 ${validationErrors.wins ? 'border-destructive' : ''}`}
                  rows={3}
                  placeholder="What went well this week?"
                  value={formData.wins}
                  onChange={(e) => handleChange("wins", e.target.value)}
                  maxLength={1000}
                />
                <p className={`text-xs text-right ${(formData.wins?.length || 0) > 900 ? 'text-orange-500' : 'text-muted-foreground'}`}>{formData.wins?.length || 0}/1000</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Struggles</Label>
                <Textarea
                  className={`bg-charcoal min-h-[80px] sm:min-h-0 ${validationErrors.struggles ? 'border-destructive' : ''}`}
                  rows={3}
                  placeholder="What was hard this week?"
                  value={formData.struggles}
                  onChange={(e) => handleChange("struggles", e.target.value)}
                  maxLength={1000}
                />
                <p className={`text-xs text-right ${(formData.struggles?.length || 0) > 900 ? 'text-orange-500' : 'text-muted-foreground'}`}>{formData.struggles?.length || 0}/1000</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">What Changes Next Week?</Label>
                <Textarea
                  className={`bg-charcoal min-h-[64px] sm:min-h-0 ${validationErrors.changes ? 'border-destructive' : ''}`}
                  rows={2}
                  placeholder="What adjustments will you make?"
                  value={formData.changes}
                  onChange={(e) => handleChange("changes", e.target.value)}
                  maxLength={500}
                />
                <p className={`text-xs text-right ${(formData.changes?.length || 0) > 450 ? 'text-orange-500' : 'text-muted-foreground'}`}>{formData.changes?.length || 0}/500</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Faith Reflection <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Textarea
                  className={`bg-charcoal min-h-[64px] sm:min-h-0 ${validationErrors.faith_reflection ? 'border-destructive' : ''}`}
                  rows={2}
                  placeholder="How did you honor God this week?"
                  value={formData.faith_reflection}
                  onChange={(e) => handleChange("faith_reflection", e.target.value)}
                  maxLength={1000}
                />
                <p className={`text-xs text-right ${(formData.faith_reflection?.length || 0) > 900 ? 'text-orange-500' : 'text-muted-foreground'}`}>{formData.faith_reflection?.length || 0}/1000</p>
              </div>

              {/* Weekly Progress Photo (Optional) */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base">Weekly Progress Photo (Optional)</Label>
                    <p className="text-sm text-muted-foreground">
                      Upload a photo to track your visual progress for Week {currentWeek}
                    </p>
                  </div>
                  {hasWeeklyPhoto && (
                    <span className="text-xs text-primary flex items-center gap-1">
                      <Check className="w-3 h-3" /> Photo uploaded
                    </span>
                  )}
                </div>
                
                {!hasWeeklyPhoto && (
                  <div className="w-full sm:max-w-xs">
                    <PhotoUploadCard
                      photoType="during"
                      onUpload={handlePhotoUpload}
                    />
                  </div>
                )}
              </div>

              {/* Desktop submit button */}
              <div className="hidden md:block">
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
                  Submit Weekly Check-In
                </Button>
              </div>
              
              {/* Add spacing for mobile sticky footer */}
              <div className="h-20 md:hidden" />
            </div>
          )}
        </div>
        
        {/* Mobile sticky submit button */}
        {!showHistory && !showSuccess && (
          <StickyMobileFooter className="md:hidden">
            <Button
              variant="gold"
              size="lg"
              className="w-full gap-2 min-h-[44px]"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Weekly Check-In
            </Button>
          </StickyMobileFooter>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CheckIn;
