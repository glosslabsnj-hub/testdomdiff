import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Check, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProgressEntries } from "@/hooks/useProgressEntries";
import { useHabitLogs, DEFAULT_HABITS } from "@/hooks/useHabitLogs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Progress = () => {
  const { entries, loading: entriesLoading, updateEntry } = useProgressEntries();
  const { loading: habitsLoading, toggleHabit, isHabitCompleted, getWeekDays, getWeeklyCompliancePercent } = useHabitLogs();
  const { toast } = useToast();
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savingWeek, setSavingWeek] = useState<number | null>(null);
  const [togglingHabit, setTogglingHabit] = useState<string | null>(null);

  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
  const weekDays = getWeekDays();
  const weeklyCompliance = getWeeklyCompliancePercent();

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

  if (entriesLoading || habitsLoading) {
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
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="headline-section mb-2">Progress <span className="text-primary">Trackers</span></h1>
        <p className="text-muted-foreground mb-8">Track your habits and progress over 12 weeks.</p>

        {/* 12-Week Progress Grid */}
        <div className="bg-card p-8 rounded-lg border border-border mb-8">
          <h2 className="headline-card mb-6">12-Week Progress Grid</h2>
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
            <h2 className="headline-card">This Week's Habit Tracker</h2>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{weeklyCompliance}%</p>
              <p className="text-xs text-muted-foreground">Weekly Compliance</p>
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

        <div className="mt-8">
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Progress;
