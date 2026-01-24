import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Check, TrendingUp, TrendingDown, Camera, Calendar } from "lucide-react";
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
import { WardenTip } from "@/components/warden";
import { cn } from "@/lib/utils";

const Progress = () => {
  const { entries, loading: entriesLoading, updateEntry } = useProgressEntries();
  const { loading: habitsLoading, toggleHabit, isHabitCompleted, getWeekDays, getWeeklyCompliancePercent } = useHabitLogs();
  const { photos, loading: photosLoading, uploadPhoto, deletePhoto, getPhotosByType } = useProgressPhotos();
  const { subscription } = useAuth();
  const { toast } = useToast();
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savingWeek, setSavingWeek] = useState<number | null>(null);
  const [togglingHabit, setTogglingHabit] = useState<string | null>(null);

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to {isCoaching ? "Dashboard" : "Cell Block"}
        </Link>

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

        {/* 12-Week Progress Grid */}
        <div className="bg-card p-8 rounded-lg border border-border mb-8">
          <h2 className="headline-card mb-6">Sentence Progress Grid</h2>
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
                            <Input
                              className="w-20 h-8 text-center bg-charcoal"
                              type="number"
                              step="0.1"
                              value={editValues.weight || ""}
                              onChange={(e) => setEditValues({ ...editValues, weight: e.target.value })}
                            />
                          ) : (
                            <>
                              <span>{getEntryValue(week, "weight") || "—"}</span>
                              {weightTrend === "down" && <TrendingDown className="w-3 h-3 text-green-500" />}
                              {weightTrend === "up" && <TrendingUp className="w-3 h-3 text-red-500" />}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <Input
                              className="w-20 h-8 text-center bg-charcoal"
                              type="number"
                              step="0.1"
                              value={editValues.waist || ""}
                              onChange={(e) => setEditValues({ ...editValues, waist: e.target.value })}
                            />
                          ) : (
                            <>
                              <span>{getEntryValue(week, "waist") || "—"}</span>
                              {waistTrend === "down" && <TrendingDown className="w-3 h-3 text-green-500" />}
                              {waistTrend === "up" && <TrendingUp className="w-3 h-3 text-red-500" />}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <Input
                            className="w-16 h-8 text-center bg-charcoal mx-auto"
                            type="number"
                            value={editValues.workouts || ""}
                            onChange={(e) => setEditValues({ ...editValues, workouts: e.target.value })}
                          />
                        ) : (
                          getEntryValue(week, "workouts") || "—"
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <Input
                            className="w-20 h-8 text-center bg-charcoal mx-auto"
                            type="number"
                            value={editValues.steps_avg || ""}
                            onChange={(e) => setEditValues({ ...editValues, steps_avg: e.target.value })}
                          />
                        ) : (
                          getEntryValue(week, "steps_avg") ? Number(getEntryValue(week, "steps_avg")).toLocaleString() : "—"
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <Input
                            className="w-16 h-8 text-center bg-charcoal mx-auto"
                            type="number"
                            max="100"
                            value={editValues.compliance_pct || ""}
                            onChange={(e) => setEditValues({ ...editValues, compliance_pct: e.target.value })}
                          />
                        ) : (
                          getEntryValue(week, "compliance_pct") ? `${getEntryValue(week, "compliance_pct")}%` : "—"
                        )}
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
        <div className="bg-card p-8 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="headline-card">Daily Compliance Tracker</h2>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{weeklyCompliance}%</p>
              <p className="text-xs text-muted-foreground">Block Compliance Rate</p>
            </div>
          </div>

          <div className="grid grid-cols-8 gap-2 text-xs text-center mb-4">
            <div className="font-semibold text-left">Habit</div>
            {weekDays.map(day => (
              <div key={day.toISOString()} className="text-muted-foreground">
                {format(day, "EEE")}
                <br />
                <span className="text-[10px]">{format(day, "M/d")}</span>
              </div>
            ))}
          </div>

          {DEFAULT_HABITS.map((habit) => (
            <div key={habit} className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-sm text-muted-foreground truncate">{habit}</div>
              {weekDays.map(day => {
                const isCompleted = isHabitCompleted(habit, day);
                const key = `${habit}-${format(day, "yyyy-MM-dd")}`;
                const isToggling = togglingHabit === key;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleHabitToggle(habit, day)}
                    disabled={isToggling}
                    className={`aspect-square rounded border-2 transition-all flex items-center justify-center ${
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
          </TabsContent>

          <TabsContent value="photos" className="space-y-8">
            {/* Starting Photos Section */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <h2 className="headline-card mb-2">Starting Photos (Day 1)</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Your Day 1 documentation. These are private by default.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <PhotoUploadCard
                  photoType="before"
                  existingPhotoUrl={beforePhotos[0]?.url}
                  onUpload={(file, options) => uploadPhoto(file, "before", options)}
                  onDelete={beforePhotos[0] ? () => deletePhoto(beforePhotos[0].id, beforePhotos[0].storage_path) : undefined}
                />
                <PhotoUploadCard
                  photoType="before"
                  existingPhotoUrl={beforePhotos[1]?.url}
                  onUpload={(file, options) => uploadPhoto(file, "before", options)}
                  onDelete={beforePhotos[1] ? () => deletePhoto(beforePhotos[1].id, beforePhotos[1].storage_path) : undefined}
                />
                <PhotoUploadCard
                  photoType="before"
                  existingPhotoUrl={beforePhotos[2]?.url}
                  onUpload={(file, options) => uploadPhoto(file, "before", options)}
                  onDelete={beforePhotos[2] ? () => deletePhoto(beforePhotos[2].id, beforePhotos[2].storage_path) : undefined}
                />
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

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {weeks.map((week) => {
                  const weekPhoto = getWeeklyPhotos(week)[0];
                  return (
                    <div 
                      key={week}
                      className={cn(
                        "relative aspect-square rounded-lg border-2 overflow-hidden",
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
                <PhotoUploadCard
                  photoType="after"
                  existingPhotoUrl={afterPhotos[0]?.url}
                  onUpload={(file, options) => uploadPhoto(file, "after", options)}
                  onDelete={afterPhotos[0] ? () => deletePhoto(afterPhotos[0].id, afterPhotos[0].storage_path) : undefined}
                />
                <PhotoUploadCard
                  photoType="after"
                  existingPhotoUrl={afterPhotos[1]?.url}
                  onUpload={(file, options) => uploadPhoto(file, "after", options)}
                  onDelete={afterPhotos[1] ? () => deletePhoto(afterPhotos[1].id, afterPhotos[1].storage_path) : undefined}
                />
                <PhotoUploadCard
                  photoType="after"
                  existingPhotoUrl={afterPhotos[2]?.url}
                  onUpload={(file, options) => uploadPhoto(file, "after", options)}
                  onDelete={afterPhotos[2] ? () => deletePhoto(afterPhotos[2].id, afterPhotos[2].storage_path) : undefined}
                />
              </div>
            </div>

            {/* Photo Comparison */}
            <PhotoComparison photos={photos} />
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard">Back to {isCoaching ? "Dashboard" : "Cell Block"}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Progress;
