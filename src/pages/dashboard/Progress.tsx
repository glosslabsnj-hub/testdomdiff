import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, TrendingUp, TrendingDown, Camera, Calendar, Images, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgressEntries } from "@/hooks/useProgressEntries";
import { useHabitLogs, DEFAULT_HABITS } from "@/hooks/useHabitLogs";
import { useProgressPhotos } from "@/hooks/useProgressPhotos";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import PhotoUploadCard from "@/components/progress/PhotoUploadCard";
import PhotoComparison from "@/components/progress/PhotoComparison";
import WorkoutHeatmap from "@/components/progress/WorkoutHeatmap";
import { WardenTip } from "@/components/warden";
import { cn } from "@/lib/utils";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import DashboardBackLink from "@/components/DashboardBackLink";

const Progress = () => {
  const { entries, loading: entriesLoading, updateEntry } = useProgressEntries();
  const { loading: habitsLoading, toggleHabit, isHabitCompleted, getWeekDays, getWeeklyCompliancePercent } = useHabitLogs();
  const { photos, loading: photosLoading, uploadPhoto, deletePhoto, getPhotosByType } = useProgressPhotos();
  const { subscription } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savingWeek, setSavingWeek] = useState<number | null>(null);
  const [togglingHabit, setTogglingHabit] = useState<string | null>(null);
  
  // Handle #metrics hash for deep linking
  const defaultTab = location.hash === "#photos" ? "photos" : "metrics";

  const isCoaching = subscription?.plan_type === "coaching";
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
  const weekDays = getWeekDays();
  const weeklyCompliance = getWeeklyCompliancePercent();
  
  const beforePhotos = getPhotosByType("before");
  const duringPhotos = getPhotosByType("during");
  const afterPhotos = getPhotosByType("after");
  
  // Get photos organized by week
  const getWeeklyPhotos = (weekNumber: number) => {
    return duringPhotos.filter(p => p.week_number === weekNumber);
  };

  const getEntryValue = (weekNumber: number, field: string): string => {
    if (editingWeek === weekNumber && editValues[field] !== undefined) {
      return editValues[field];
    }
    const entry = entries.find(e => e.week_number === weekNumber);
    if (!entry) return "";
    const value = (entry as any)[field];
    return value !== null && value !== undefined ? String(value) : "";
  };

  const handleEdit = (weekNumber: number) => {
    const entry = entries.find(e => e.week_number === weekNumber);
    setEditingWeek(weekNumber);
    setEditValues({
      weight: entry?.weight?.toString() || "",
      waist: entry?.waist?.toString() || "",
      workouts: entry?.workouts?.toString() || "",
      steps_avg: entry?.steps_avg?.toString() || "",
      compliance_pct: entry?.compliance_pct?.toString() || "",
    });
  };

  const handleSave = async (weekNumber: number) => {
    // Validate numeric inputs
    if (editValues.weight && (isNaN(parseFloat(editValues.weight)) || parseFloat(editValues.weight) <= 0)) {
      toast({ title: "Invalid weight", description: "Weight must be a positive number.", variant: "destructive" });
      return;
    }
    if (editValues.waist && (isNaN(parseFloat(editValues.waist)) || parseFloat(editValues.waist) <= 0)) {
      toast({ title: "Invalid waist", description: "Waist must be a positive number.", variant: "destructive" });
      return;
    }
    if (editValues.workouts && (isNaN(parseInt(editValues.workouts)) || parseInt(editValues.workouts) < 0 || parseInt(editValues.workouts) > 14)) {
      toast({ title: "Invalid workouts", description: "Workouts must be between 0 and 14.", variant: "destructive" });
      return;
    }
    if (editValues.steps_avg && (isNaN(parseInt(editValues.steps_avg)) || parseInt(editValues.steps_avg) < 0)) {
      toast({ title: "Invalid steps", description: "Steps must be a non-negative number.", variant: "destructive" });
      return;
    }
    if (editValues.compliance_pct && (isNaN(parseInt(editValues.compliance_pct)) || parseInt(editValues.compliance_pct) < 0 || parseInt(editValues.compliance_pct) > 100)) {
      toast({ title: "Invalid compliance", description: "Compliance must be between 0 and 100.", variant: "destructive" });
      return;
    }

    try {
      setSavingWeek(weekNumber);
      await updateEntry(weekNumber, {
        weight: editValues.weight ? parseFloat(editValues.weight) : null,
        waist: editValues.waist ? parseFloat(editValues.waist) : null,
        workouts: editValues.workouts ? parseInt(editValues.workouts) : null,
        steps_avg: editValues.steps_avg ? parseInt(editValues.steps_avg) : null,
        compliance_pct: editValues.compliance_pct ? parseInt(editValues.compliance_pct) : null,
      });
      setEditingWeek(null);
      setEditValues({});
      toast({ title: "Saved!", description: `Week ${weekNumber} progress updated.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingWeek(null);
    }
  };

  const handleCancel = () => {
    setEditingWeek(null);
    setEditValues({});
  };

  const handleHabitToggle = async (habit: string, date: Date) => {
    const key = `${habit}-${format(date, "yyyy-MM-dd")}`;
    try {
      setTogglingHabit(key);
      await toggleHabit(habit, date);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setTogglingHabit(null);
    }
  };

  const getTrend = (weekNumber: number, field: "weight" | "waist") => {
    const current = entries.find(e => e.week_number === weekNumber);
    const previous = entries.find(e => e.week_number === weekNumber - 1);
    if (!current || !previous) return null;
    const currentVal = current[field];
    const previousVal = previous[field];
    if (currentVal === null || previousVal === null) return null;
    if (currentVal < previousVal) return "down";
    if (currentVal > previousVal) return "up";
    return "same";
  };

  if (entriesLoading || habitsLoading || photosLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="section-container py-12">
          <DashboardBackLink className="mb-8" />
          <div className="space-y-6">
            <DashboardSkeleton variant="cards" count={4} />
            <DashboardSkeleton variant="table" count={6} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-6 sm:py-12">
        <DashboardBackLink className="mb-4 sm:mb-8" />

        <h1 className="headline-section mb-2">
          {isCoaching ? "Progress" : "Time"} <span className="text-primary">{isCoaching ? "Report" : "Served"}</span>
        </h1>
        <p className="text-muted-foreground mb-4">
          {isCoaching 
            ? "Track your transformation journey over 12 weeks."
            : "Track your sentence progress over 12 weeks."}
        </p>

        {/* Warden Tip */}
        <WardenTip 
          tip={`Week ${Math.max(...entries.map(e => e.week_number), 1)} in the books. ${weeklyCompliance >= 80 ? "Solid compliance this week. Keep that fire burning." : "Push harder on those daily habits. Consistency is freedom."}`}
          className="mb-8"
        />

        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="photos" className="gap-2">
              <Camera className="h-4 w-4" />
              Progress Photos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-8">
            {/* Workout Heatmap */}
            <WorkoutHeatmap />
        <div className="bg-card p-4 sm:p-8 rounded-lg border border-border mb-8">
          <h2 className="headline-card mb-4 sm:mb-6">Sentence Progress Grid</h2>

          {/* Mobile: stacked card layout */}
          <div className="space-y-3 md:hidden">
            {weeks.map((week) => {
              const isEditing = editingWeek === week;
              const isSaving = savingWeek === week;
              const weightTrend = getTrend(week, "weight");
              const waistTrend = getTrend(week, "waist");
              const hasData = getEntryValue(week, "weight") || getEntryValue(week, "waist") || getEntryValue(week, "workouts");

              return (
                <div key={week} className={cn("p-3 rounded-lg border", hasData ? "border-primary/30 bg-primary/5" : "border-border")}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-primary">Week {week}</span>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="gold" onClick={() => handleSave(week)} disabled={isSaving} className="min-h-[44px] px-3">
                          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} className="min-h-[44px] px-3">Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(week)} className="min-h-[44px] min-w-[44px]">Edit</Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight</span>
                      <span className="flex items-center gap-1 font-medium">
                        {isEditing ? (
                          <Input className="flex-1 h-11 text-center bg-charcoal" type="number" step="0.1" value={editValues.weight || ""} onChange={(e) => setEditValues({ ...editValues, weight: e.target.value })} />
                        ) : (
                          <>{getEntryValue(week, "weight") || "—"}{weightTrend === "down" && <TrendingDown className="w-3 h-3 text-green-500" />}{weightTrend === "up" && <TrendingUp className="w-3 h-3 text-red-500" />}</>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Waist</span>
                      <span className="flex items-center gap-1 font-medium">
                        {isEditing ? (
                          <Input className="flex-1 h-11 text-center bg-charcoal" type="number" step="0.1" value={editValues.waist || ""} onChange={(e) => setEditValues({ ...editValues, waist: e.target.value })} />
                        ) : (
                          <>{getEntryValue(week, "waist") || "—"}{waistTrend === "down" && <TrendingDown className="w-3 h-3 text-green-500" />}{waistTrend === "up" && <TrendingUp className="w-3 h-3 text-red-500" />}</>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Workouts</span>
                      <span className="font-medium">
                        {isEditing ? (
                          <Input className="flex-1 h-11 text-center bg-charcoal" type="number" value={editValues.workouts || ""} onChange={(e) => setEditValues({ ...editValues, workouts: e.target.value })} />
                        ) : (getEntryValue(week, "workouts") || "—")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Steps</span>
                      <span className="font-medium">
                        {isEditing ? (
                          <Input className="flex-1 h-11 text-center bg-charcoal" type="number" value={editValues.steps_avg || ""} onChange={(e) => setEditValues({ ...editValues, steps_avg: e.target.value })} />
                        ) : (getEntryValue(week, "steps_avg") ? Number(getEntryValue(week, "steps_avg")).toLocaleString() : "—")}
                      </span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="text-muted-foreground">Compliance</span>
                      <span className="font-medium">
                        {isEditing ? (
                          <Input className="flex-1 h-11 text-center bg-charcoal" type="number" max="100" value={editValues.compliance_pct || ""} onChange={(e) => setEditValues({ ...editValues, compliance_pct: e.target.value })} />
                        ) : (getEntryValue(week, "compliance_pct") ? `${getEntryValue(week, "compliance_pct")}%` : "—")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2">Week</th>
                  <th className="text-center p-2">Weight</th>
                  <th className="text-center p-2">Waist</th>
                  <th className="text-center p-2">Workouts</th>
                  <th className="text-center p-2">Steps Avg</th>
                  <th className="text-center p-2">Compliance</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((week) => {
                  const isEditing = editingWeek === week;
                  const isSaving = savingWeek === week;
                  const weightTrend = getTrend(week, "weight");
                  const waistTrend = getTrend(week, "waist");

                  return (
                    <tr key={week} className="border-b border-border/50">
                      <td className="p-2 font-semibold text-primary">Week {week}</td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <Input className="w-20 h-8 text-center bg-charcoal" type="number" step="0.1" value={editValues.weight || ""} onChange={(e) => setEditValues({ ...editValues, weight: e.target.value })} />
                          ) : (
                            <><span>{getEntryValue(week, "weight") || "—"}</span>{weightTrend === "down" && <TrendingDown className="w-3 h-3 text-green-500" />}{weightTrend === "up" && <TrendingUp className="w-3 h-3 text-red-500" />}</>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <Input className="w-20 h-8 text-center bg-charcoal" type="number" step="0.1" value={editValues.waist || ""} onChange={(e) => setEditValues({ ...editValues, waist: e.target.value })} />
                          ) : (
                            <><span>{getEntryValue(week, "waist") || "—"}</span>{waistTrend === "down" && <TrendingDown className="w-3 h-3 text-green-500" />}{waistTrend === "up" && <TrendingUp className="w-3 h-3 text-red-500" />}</>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <Input className="w-16 h-8 text-center bg-charcoal mx-auto" type="number" value={editValues.workouts || ""} onChange={(e) => setEditValues({ ...editValues, workouts: e.target.value })} />
                        ) : (getEntryValue(week, "workouts") || "—")}
                      </td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <Input className="w-20 h-8 text-center bg-charcoal mx-auto" type="number" value={editValues.steps_avg || ""} onChange={(e) => setEditValues({ ...editValues, steps_avg: e.target.value })} />
                        ) : (getEntryValue(week, "steps_avg") ? Number(getEntryValue(week, "steps_avg")).toLocaleString() : "—")}
                      </td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <Input className="w-16 h-8 text-center bg-charcoal mx-auto" type="number" max="100" value={editValues.compliance_pct || ""} onChange={(e) => setEditValues({ ...editValues, compliance_pct: e.target.value })} />
                        ) : (getEntryValue(week, "compliance_pct") ? `${getEntryValue(week, "compliance_pct")}%` : "—")}
                      </td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <div className="flex gap-1 justify-center">
                            <Button size="sm" variant="gold" onClick={() => handleSave(week)} disabled={isSaving}>
                              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(week)}>Edit</Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Habit Tracker */}
        <div className="bg-card p-4 sm:p-8 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="headline-card">Daily Compliance Tracker</h2>
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold text-primary">{weeklyCompliance}%</p>
              <p className="text-xs text-muted-foreground">Block Compliance Rate</p>
            </div>
          </div>

          <div className="relative">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[420px]">
              <div className="grid grid-cols-8 gap-1.5 sm:gap-2 text-xs text-center mb-3">
                <div className="font-semibold text-left">Habit</div>
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="text-muted-foreground">
                    {format(day, "EEE")}
                    <br />
                    <span className="text-xs">{format(day, "M/d")}</span>
                  </div>
                ))}
              </div>

              {DEFAULT_HABITS.map((habit) => (
                <div key={habit} className="grid grid-cols-8 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="text-xs sm:text-sm text-muted-foreground truncate flex items-center">{habit}</div>
                  {weekDays.map(day => {
                    const isCompleted = isHabitCompleted(habit, day);
                    const key = `${habit}-${format(day, "yyyy-MM-dd")}`;
                    const isToggling = togglingHabit === key;

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleHabitToggle(habit, day)}
                        disabled={isToggling}
                        className={`aspect-square min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 rounded border-2 transition-all flex items-center justify-center ${
                          isCompleted
                            ? "bg-primary border-primary"
                            : "bg-charcoal border-border hover:border-primary/50"
                        } ${isToggling ? "opacity-50" : ""}`}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isCompleted ? (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {/* Scroll fade indicator (mobile only) */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none sm:hidden" />
          </div>
          </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-8">
            {/* Gallery Link */}
            <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Images className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">View Full Photo Gallery</p>
                  <p className="text-xs text-muted-foreground">Timeline view, comparison tools, and more</p>
                </div>
              </div>
              <Link to="/dashboard/photos">
                <Button variant="gold" size="sm">
                  Open Gallery
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Starting Photos Section */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <h2 className="headline-card mb-2">Starting Photos (Day 1)</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Your Day 1 documentation. These are private by default.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map(i => beforePhotos.length > i ? (
                  <PhotoUploadCard
                    key={i}
                    photoType="before"
                    existingPhotoUrl={beforePhotos[i]?.url}
                    onUpload={(file, options) => uploadPhoto(file, "before", options)}
                    onDelete={() => deletePhoto(beforePhotos[i].id, beforePhotos[i].storage_path)}
                  />
                ) : (
                  <PhotoUploadCard
                    key={i}
                    photoType="before"
                    onUpload={(file, options) => uploadPhoto(file, "before", options)}
                  />
                ))}
              </div>
            </div>

            {/* Weekly Progress Timeline */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="headline-card">Weekly Progress Timeline</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                Upload a photo each week to track your visual transformation over 12 weeks.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                {weeks.map((week) => {
                  const weekPhoto = getWeeklyPhotos(week)[0];
                  return (
                    <div 
                      key={week}
                      className={cn(
                        "relative aspect-square rounded-lg border-2 overflow-hidden active:opacity-80 transition-opacity",
                        weekPhoto ? "border-primary" : "border-dashed border-border"
                      )}
                    >
                      <div className="absolute top-1 left-1 z-10 px-1.5 py-0.5 bg-background/80 rounded text-xs font-bold">
                        W{week}
                      </div>
                      {weekPhoto ? (
                        <img
                          src={weekPhoto.url}
                          alt={`Week ${week}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-charcoal">
                          <Camera className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Add weekly photos via your Weekly {isCoaching ? "Report" : "Check-in"} or upload directly here.
              </p>
            </div>

            {/* Final Results Section */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <h2 className="headline-card mb-2">Final Results (After)</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Upload your final transformation photos when you complete your 12 weeks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map(i => afterPhotos.length > i ? (
                  <PhotoUploadCard
                    key={i}
                    photoType="after"
                    existingPhotoUrl={afterPhotos[i]?.url}
                    onUpload={(file, options) => uploadPhoto(file, "after", options)}
                    onDelete={() => deletePhoto(afterPhotos[i].id, afterPhotos[i].storage_path)}
                  />
                ) : (
                  <PhotoUploadCard
                    key={i}
                    photoType="after"
                    onUpload={(file, options) => uploadPhoto(file, "after", options)}
                  />
                ))}
              </div>
            </div>

            {/* Photo Comparison */}
            <PhotoComparison photos={photos} />
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <Button variant="goldOutline" asChild className="min-h-[44px]">
            <Link to="/dashboard">Back to {isCoaching ? "Dashboard" : "Cell Block"}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Progress;
