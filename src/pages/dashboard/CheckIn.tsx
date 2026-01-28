import { useState, useEffect } from "react";
import { Send, Check, History, Camera, Loader2 } from "lucide-react";
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
      toast({
        title: isCoaching ? "Report submitted!" : "Check-in submitted!",
        description: `Week ${formData.week_number} ${isCoaching ? "report" : "check-in"} saved successfully.`,
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
      <div className="section-container py-12">
        <DashboardBackLink className="mb-8" />

        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-8">
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
                <div className="space-y-1">
                  <Label>Weight (lbs)</Label>
                  <Input
                    className={`bg-charcoal ${validationErrors.weight ? 'border-destructive' : ''}`}
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
                  <Label>Waist (inches)</Label>
                  <Input
                    className={`bg-charcoal ${validationErrors.waist ? 'border-destructive' : ''}`}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Avg Daily Steps</Label>
                  <Input
                    className={`bg-charcoal ${validationErrors.steps_avg ? 'border-destructive' : ''}`}
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
                  <Label>Workouts Completed</Label>
                  <Input
                    className={`bg-charcoal ${validationErrors.workouts_completed ? 'border-destructive' : ''}`}
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
                <Label>This Week's Wins</Label>
                <Textarea
                  className={`bg-charcoal ${validationErrors.wins ? 'border-destructive' : ''}`}
                  rows={3}
                  placeholder="What went well this week?"
                  value={formData.wins}
                  onChange={(e) => handleChange("wins", e.target.value)}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">{formData.wins?.length || 0}/1000</p>
              </div>
              <div className="space-y-1">
                <Label>Struggles</Label>
                <Textarea
                  className={`bg-charcoal ${validationErrors.struggles ? 'border-destructive' : ''}`}
                  rows={3}
                  placeholder="What was hard this week?"
                  value={formData.struggles}
                  onChange={(e) => handleChange("struggles", e.target.value)}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">{formData.struggles?.length || 0}/1000</p>
              </div>
              <div className="space-y-1">
                <Label>What Changes Next Week?</Label>
                <Textarea
                  className={`bg-charcoal ${validationErrors.changes ? 'border-destructive' : ''}`}
                  rows={2}
                  placeholder="What adjustments will you make?"
                  value={formData.changes}
                  onChange={(e) => handleChange("changes", e.target.value)}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{formData.changes?.length || 0}/500</p>
              </div>
              <div className="space-y-1">
                <Label>Faith Reflection (Optional)</Label>
                <Textarea
                  className={`bg-charcoal ${validationErrors.faith_reflection ? 'border-destructive' : ''}`}
                  rows={2}
                  placeholder="How did you honor God this week?"
                  value={formData.faith_reflection}
                  onChange={(e) => handleChange("faith_reflection", e.target.value)}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">{formData.faith_reflection?.length || 0}/1000</p>
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
                  <div className="max-w-xs">
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
        {!showHistory && (
          <StickyMobileFooter className="md:hidden">
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
          </StickyMobileFooter>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CheckIn;
