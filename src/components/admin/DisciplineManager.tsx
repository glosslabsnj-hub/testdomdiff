import { useState } from "react";
import { Sun, Moon, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDisciplineRoutines, DisciplineRoutine } from "@/hooks/useDisciplineRoutines";

export default function DisciplineManager() {
  const { routines, loading, createRoutine, updateRoutine, deleteRoutine } = useDisciplineRoutines();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<DisciplineRoutine | null>(null);
  const [form, setForm] = useState({
    routine_type: "morning" as "morning" | "evening",
    time_slot: "",
    action_text: "",
    display_order: 0,
    is_active: true,
  });

  const openDialog = (routine?: DisciplineRoutine) => {
    if (routine) {
      setEditingRoutine(routine);
      setForm({
        routine_type: routine.routine_type,
        time_slot: routine.time_slot,
        action_text: routine.action_text,
        display_order: routine.display_order,
        is_active: routine.is_active,
      });
    } else {
      setEditingRoutine(null);
      const morningCount = routines.filter(r => r.routine_type === "morning").length;
      setForm({
        routine_type: "morning",
        time_slot: "",
        action_text: "",
        display_order: morningCount,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.time_slot.trim() || !form.action_text.trim()) return;

    if (editingRoutine) {
      await updateRoutine(editingRoutine.id, form);
    } else {
      await createRoutine(form);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this routine item?")) {
      await deleteRoutine(id);
    }
  };

  const morningRoutines = routines.filter(r => r.routine_type === "morning");
  const eveningRoutines = routines.filter(r => r.routine_type === "evening");

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="headline-card">Daily Discipline Routines</h2>
        <Button variant="gold" onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Routine Item
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">Configure morning and evening routine templates for members.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sun className="h-5 w-5 text-primary" />
              Morning Routine
            </CardTitle>
          </CardHeader>
          <CardContent>
            {morningRoutines.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No morning routine items</p>
            ) : (
              <div className="space-y-2">
                {morningRoutines.map((routine) => (
                  <div key={routine.id} className="flex items-center gap-3 p-3 rounded bg-background border border-border">
                    <span className="text-sm font-mono text-primary w-20">{routine.time_slot}</span>
                    <span className="text-sm flex-1">{routine.action_text}</span>
                    <Button variant="ghost" size="icon" onClick={() => openDialog(routine)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(routine.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-charcoal border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="h-5 w-5 text-primary" />
              Evening Routine
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eveningRoutines.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No evening routine items</p>
            ) : (
              <div className="space-y-2">
                {eveningRoutines.map((routine) => (
                  <div key={routine.id} className="flex items-center gap-3 p-3 rounded bg-background border border-border">
                    <span className="text-sm font-mono text-primary w-20">{routine.time_slot}</span>
                    <span className="text-sm flex-1">{routine.action_text}</span>
                    <Button variant="ghost" size="icon" onClick={() => openDialog(routine)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(routine.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingRoutine ? "Edit Routine Item" : "Add Routine Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Routine Type</label>
              <Select value={form.routine_type} onValueChange={(v: "morning" | "evening") => setForm({ ...form, routine_type: v })}>
                <SelectTrigger className="bg-charcoal border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Time</label>
              <Input value={form.time_slot} onChange={(e) => setForm({ ...form, time_slot: e.target.value })} className="bg-charcoal border-border" placeholder="e.g., 5:00 AM" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Action</label>
              <Input value={form.action_text} onChange={(e) => setForm({ ...form, action_text: e.target.value })} className="bg-charcoal border-border" placeholder="e.g., Wake up — no snooze" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
