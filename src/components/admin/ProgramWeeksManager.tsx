import { useState } from "react";
import { Calendar, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProgramWeeks, ProgramWeek, useWorkoutTemplates } from "@/hooks/useWorkoutContent";

export default function ProgramWeeksManager() {
  const { weeks, loading, updateWeek } = useProgramWeeks();
  const { templates } = useWorkoutTemplates();
  const [editingWeek, setEditingWeek] = useState<ProgramWeek | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    focus_description: "",
    workout_monday: "",
    workout_tuesday: "",
    workout_wednesday: "",
    workout_thursday: "",
    workout_friday: "",
    workout_saturday: "",
    conditioning_notes: "",
    recovery_notes: "",
    scripture_reference: "",
  });

  const openEditDialog = (week: ProgramWeek) => {
    setEditingWeek(week);
    setForm({
      title: week.title || `Week ${week.week_number}`,
      focus_description: week.focus_description || "",
      workout_monday: week.workout_monday || "",
      workout_tuesday: week.workout_tuesday || "",
      workout_wednesday: week.workout_wednesday || "",
      workout_thursday: week.workout_thursday || "",
      workout_friday: week.workout_friday || "",
      workout_saturday: week.workout_saturday || "",
      conditioning_notes: week.conditioning_notes || "",
      recovery_notes: week.recovery_notes || "",
      scripture_reference: week.scripture_reference || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingWeek) return;
    await updateWeek(editingWeek.id, {
      ...form,
      workout_monday: form.workout_monday || null,
      workout_tuesday: form.workout_tuesday || null,
      workout_wednesday: form.workout_wednesday || null,
      workout_thursday: form.workout_thursday || null,
      workout_friday: form.workout_friday || null,
      workout_saturday: form.workout_saturday || null,
    });
    setDialogOpen(false);
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "foundation": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "build": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "peak": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "";
    }
  };

  const WorkoutSelect = ({ value, onChange, day }: { value: string; onChange: (v: string) => void; day: string }) => (
    <div>
      <label className="text-sm font-medium mb-1 block">{day}</label>
      <Select value={value || "none"} onValueChange={(v) => onChange(v === "none" ? "" : v)}>
        <SelectTrigger className="bg-charcoal border-border">
          <SelectValue placeholder="Rest / No workout" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Rest / No workout</SelectItem>
          {templates.map((t) => (
            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const phases = [
    { name: "Foundation", weeks: weeks.filter(w => w.phase === "foundation") },
    { name: "Build", weeks: weeks.filter(w => w.phase === "build") },
    { name: "Peak", weeks: weeks.filter(w => w.phase === "peak") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="headline-card">12-Week Program</h2>
      </div>
      <p className="text-muted-foreground text-sm">Configure each week's focus, workouts, and content.</p>

      {phases.map((phase) => (
        <div key={phase.name} className="space-y-3">
          <h3 className="text-lg font-semibold text-primary">{phase.name} Phase</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {phase.weeks.map((week) => (
              <Card
                key={week.id}
                className="bg-charcoal border-border cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => openEditDialog(week)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-display">
                      {week.week_number}
                    </div>
                    <Badge className={getPhaseColor(week.phase)}>{week.phase}</Badge>
                  </div>
                  <h4 className="font-medium text-sm truncate">{week.title || `Week ${week.week_number}`}</h4>
                  {week.focus_description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{week.focus_description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              Week {editingWeek?.week_number} - {editingWeek?.phase?.charAt(0).toUpperCase()}{editingWeek?.phase?.slice(1)} Phase
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Week Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-charcoal border-border" placeholder="e.g., Foundation Building" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Focus Description</label>
              <Textarea value={form.focus_description} onChange={(e) => setForm({ ...form, focus_description: e.target.value })} className="bg-charcoal border-border" placeholder="What's the main focus for this week?" />
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-medium mb-3">Weekly Workout Schedule</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <WorkoutSelect day="Monday" value={form.workout_monday} onChange={(v) => setForm({ ...form, workout_monday: v })} />
                <WorkoutSelect day="Tuesday" value={form.workout_tuesday} onChange={(v) => setForm({ ...form, workout_tuesday: v })} />
                <WorkoutSelect day="Wednesday" value={form.workout_wednesday} onChange={(v) => setForm({ ...form, workout_wednesday: v })} />
                <WorkoutSelect day="Thursday" value={form.workout_thursday} onChange={(v) => setForm({ ...form, workout_thursday: v })} />
                <WorkoutSelect day="Friday" value={form.workout_friday} onChange={(v) => setForm({ ...form, workout_friday: v })} />
                <WorkoutSelect day="Saturday" value={form.workout_saturday} onChange={(v) => setForm({ ...form, workout_saturday: v })} />
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Conditioning Notes</label>
                <Textarea value={form.conditioning_notes} onChange={(e) => setForm({ ...form, conditioning_notes: e.target.value })} className="bg-charcoal border-border" placeholder="Cardio, HIIT, or other conditioning notes..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Recovery Notes</label>
                <Textarea value={form.recovery_notes} onChange={(e) => setForm({ ...form, recovery_notes: e.target.value })} className="bg-charcoal border-border" placeholder="Stretching, mobility, rest day guidance..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Scripture Reference</label>
                <Input value={form.scripture_reference} onChange={(e) => setForm({ ...form, scripture_reference: e.target.value })} className="bg-charcoal border-border" placeholder="e.g., Philippians 4:13" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={handleSave}>Save Week</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
