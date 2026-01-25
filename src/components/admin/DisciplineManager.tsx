import { useState, useEffect } from "react";
import { Sun, Moon, Plus, Edit, Trash2, Loader2, Eye, GripVertical, Copy, BarChart3, ToggleLeft, ToggleRight, FileText, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDisciplineRoutines, DisciplineRoutine } from "@/hooks/useDisciplineRoutines";
import { useDisciplineTemplates, RoutineItem } from "@/hooks/useDisciplineTemplates";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import DisciplineTemplatesPanel from "./DisciplineTemplatesPanel";
import RoutineSubStepsEditor from "./RoutineSubStepsEditor";

interface ComplianceStats {
  totalUsers: number;
  morningCompletions: number;
  eveningCompletions: number;
  avgMorningPercent: number;
  avgEveningPercent: number;
}

export default function DisciplineManager() {
  const { routines, loading, createRoutine, updateRoutine, deleteRoutine, fetchRoutines } = useDisciplineRoutines();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<DisciplineRoutine | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [form, setForm] = useState({
    routine_type: "morning" as "morning" | "evening",
    time_slot: "",
    action_text: "",
    display_order: 0,
    is_active: true,
    duration_minutes: 5,
    description: "" as string | null,
  });

  // Fetch compliance stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      // Get unique users who have logged routines in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateStr = sevenDaysAgo.toISOString().split("T")[0];

      const { data: habitData, error } = await supabase
        .from("habit_logs")
        .select("user_id, habit_name, log_date")
        .like("habit_name", "routine_%")
        .gte("log_date", dateStr);

      if (error) throw error;

      const users = new Set((habitData || []).map(h => h.user_id));
      const morningLogs = (habitData || []).filter(h => {
        const routineId = h.habit_name.replace("routine_", "");
        const routine = routines.find(r => r.id === routineId);
        return routine?.routine_type === "morning";
      });
      const eveningLogs = (habitData || []).filter(h => {
        const routineId = h.habit_name.replace("routine_", "");
        const routine = routines.find(r => r.id === routineId);
        return routine?.routine_type === "evening";
      });

      const morningRoutineCount = routines.filter(r => r.routine_type === "morning" && r.is_active).length;
      const eveningRoutineCount = routines.filter(r => r.routine_type === "evening" && r.is_active).length;

      const totalPossibleMorning = users.size * 7 * morningRoutineCount;
      const totalPossibleEvening = users.size * 7 * eveningRoutineCount;

      setStats({
        totalUsers: users.size,
        morningCompletions: morningLogs.length,
        eveningCompletions: eveningLogs.length,
        avgMorningPercent: totalPossibleMorning > 0 ? Math.round((morningLogs.length / totalPossibleMorning) * 100) : 0,
        avgEveningPercent: totalPossibleEvening > 0 ? Math.round((eveningLogs.length / totalPossibleEvening) * 100) : 0,
      });
    } catch (e) {
      console.error("Error fetching stats:", e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (routines.length > 0) {
      fetchStats();
    }
  }, [routines]);

  const openDialog = (routine?: DisciplineRoutine) => {
    if (routine) {
      setEditingRoutine(routine);
      setForm({
        routine_type: routine.routine_type,
        time_slot: routine.time_slot,
        action_text: routine.action_text,
        display_order: routine.display_order,
        is_active: routine.is_active,
        duration_minutes: routine.duration_minutes || 5,
        description: routine.description || "",
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
        duration_minutes: 5,
        description: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.time_slot.trim() || !form.action_text.trim()) return;

    const routineData = {
      ...form,
      description: form.description?.trim() || null,
    };

    if (editingRoutine) {
      await updateRoutine(editingRoutine.id, routineData);
    } else {
      await createRoutine(routineData);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this routine item?")) {
      await deleteRoutine(id);
    }
  };

  const handleToggleActive = async (routine: DisciplineRoutine) => {
    await updateRoutine(routine.id, { is_active: !routine.is_active });
  };

  const handleDuplicateToEvening = async () => {
    const morningItems = routines.filter(r => r.routine_type === "morning");
    const existingEveningCount = routines.filter(r => r.routine_type === "evening").length;
    
    for (let i = 0; i < morningItems.length; i++) {
      const item = morningItems[i];
      // Convert AM times to PM
      const pmTime = item.time_slot.replace("AM", "PM").replace("am", "pm");
      await createRoutine({
        routine_type: "evening",
        time_slot: pmTime,
        action_text: item.action_text,
        display_order: existingEveningCount + i,
        is_active: item.is_active,
        duration_minutes: item.duration_minutes || 5,
        description: item.description || null,
      });
    }
  };

  const handleMoveUp = async (routine: DisciplineRoutine) => {
    const typeRoutines = routines.filter(r => r.routine_type === routine.routine_type);
    const currentIndex = typeRoutines.findIndex(r => r.id === routine.id);
    if (currentIndex <= 0) return;

    const prevRoutine = typeRoutines[currentIndex - 1];
    await updateRoutine(routine.id, { display_order: prevRoutine.display_order });
    await updateRoutine(prevRoutine.id, { display_order: routine.display_order });
    await fetchRoutines();
  };

  const handleMoveDown = async (routine: DisciplineRoutine) => {
    const typeRoutines = routines.filter(r => r.routine_type === routine.routine_type);
    const currentIndex = typeRoutines.findIndex(r => r.id === routine.id);
    if (currentIndex >= typeRoutines.length - 1) return;

    const nextRoutine = typeRoutines[currentIndex + 1];
    await updateRoutine(routine.id, { display_order: nextRoutine.display_order });
    await updateRoutine(nextRoutine.id, { display_order: routine.display_order });
    await fetchRoutines();
  };

  const morningRoutines = routines.filter(r => r.routine_type === "morning").sort((a, b) => a.display_order - b.display_order);
  const eveningRoutines = routines.filter(r => r.routine_type === "evening").sort((a, b) => a.display_order - b.display_order);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="headline-card text-lg sm:text-xl">Daily Discipline Routines</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">Configure morning and evening routine templates for members.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? "Edit Mode" : "Preview"}
          </Button>
          <Button variant="gold" size="sm" onClick={() => openDialog()} className="gap-2">
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      {/* Analytics Card */}
      <Card className="bg-charcoal border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            7-Day Compliance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-display text-primary">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-display text-primary">{stats.avgMorningPercent}%</p>
                <p className="text-xs text-muted-foreground">Morning Compliance</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-display text-primary">{stats.avgEveningPercent}%</p>
                <p className="text-xs text-muted-foreground">Evening Compliance</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-display text-primary">
                  {stats.morningCompletions + stats.eveningCompletions}
                </p>
                <p className="text-xs text-muted-foreground">Total Completions</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDuplicateToEvening}
          disabled={morningRoutines.length === 0}
          className="gap-2"
        >
          <Copy className="h-4 w-4" />
          Duplicate Morning → Evening
        </Button>
      </div>

      {/* Tabs for Templates, Sub-Steps Editor */}
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="bg-charcoal border border-border">
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Quick Templates
          </TabsTrigger>
          <TabsTrigger value="substeps" className="gap-2">
            <Layers className="h-4 w-4" />
            Sub-Steps Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card className="bg-charcoal border-border">
            <CardContent className="pt-6">
              <DisciplineTemplatesPanel
                onApplyTemplate={async (templateRoutines: RoutineItem[]) => {
                  // Delete all existing routines
                  for (const routine of routines) {
                    await deleteRoutine(routine.id);
                  }
                  // Create new routines from template
                  for (const item of templateRoutines) {
                    await createRoutine({
                      routine_type: item.routine_type,
                      time_slot: item.time_slot,
                      action_text: item.action_text,
                      display_order: item.display_order,
                      is_active: true,
                      duration_minutes: 5,
                      description: null,
                    });
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="substeps">
          <SubStepsEditorTab />
        </TabsContent>
      </Tabs>


      {/* Preview Mode */}
      {previewMode ? (
        <Card className="bg-charcoal border-primary/30">
          <CardHeader>
            <CardTitle className="text-primary">User Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Morning Preview */}
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Sun className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-primary uppercase tracking-wider font-semibold">Count Time: AM</p>
                    <h3 className="font-display">Reveille → Word → Work</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  {morningRoutines.filter(r => r.is_active).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-charcoal border border-border">
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/50" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.action_text}</p>
                        <p className="text-xs text-muted-foreground">{item.time_slot}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evening Preview */}
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Moon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-primary uppercase tracking-wider font-semibold">Count Time: PM</p>
                    <h3 className="font-display">Lockdown → Reflect → Rest</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  {eveningRoutines.filter(r => r.is_active).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-charcoal border border-border">
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/50" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.action_text}</p>
                        <p className="text-xs text-muted-foreground">{item.time_slot}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Morning Routines */}
          <Card className="bg-charcoal border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Morning Routine
                <Badge variant="outline" className="ml-auto text-xs">
                  {morningRoutines.filter(r => r.is_active).length} active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {morningRoutines.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No morning routine items</p>
              ) : (
                <div className="space-y-2">
                  {morningRoutines.map((routine, index) => (
                    <div 
                      key={routine.id} 
                      className={cn(
                        "flex items-center gap-2 p-2 sm:p-3 rounded bg-background border",
                        routine.is_active ? "border-border" : "border-border/50 opacity-60"
                      )}
                    >
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button 
                          onClick={() => handleMoveUp(routine)}
                          disabled={index === 0}
                          className="text-muted-foreground hover:text-primary disabled:opacity-30"
                        >
                          <GripVertical className="h-3 w-3 rotate-90" />
                        </button>
                        <button 
                          onClick={() => handleMoveDown(routine)}
                          disabled={index === morningRoutines.length - 1}
                          className="text-muted-foreground hover:text-primary disabled:opacity-30"
                        >
                          <GripVertical className="h-3 w-3 -rotate-90" />
                        </button>
                      </div>
                      
                      <span className="text-xs sm:text-sm font-mono text-primary w-16 sm:w-20 flex-shrink-0">
                        {routine.time_slot}
                      </span>
                      <span className={cn(
                        "text-xs sm:text-sm flex-1 min-w-0 truncate",
                        !routine.is_active && "line-through"
                      )}>
                        {routine.action_text}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleToggleActive(routine)}
                          className="p-1 text-muted-foreground hover:text-primary"
                          title={routine.is_active ? "Deactivate" : "Activate"}
                        >
                          {routine.is_active ? (
                            <ToggleRight className="h-4 w-4 text-primary" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => openDialog(routine)}>
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleDelete(routine.id)}>
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evening Routines */}
          <Card className="bg-charcoal border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Evening Routine
                <Badge variant="outline" className="ml-auto text-xs">
                  {eveningRoutines.filter(r => r.is_active).length} active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {eveningRoutines.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No evening routine items</p>
              ) : (
                <div className="space-y-2">
                  {eveningRoutines.map((routine, index) => (
                    <div 
                      key={routine.id} 
                      className={cn(
                        "flex items-center gap-2 p-2 sm:p-3 rounded bg-background border",
                        routine.is_active ? "border-border" : "border-border/50 opacity-60"
                      )}
                    >
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button 
                          onClick={() => handleMoveUp(routine)}
                          disabled={index === 0}
                          className="text-muted-foreground hover:text-primary disabled:opacity-30"
                        >
                          <GripVertical className="h-3 w-3 rotate-90" />
                        </button>
                        <button 
                          onClick={() => handleMoveDown(routine)}
                          disabled={index === eveningRoutines.length - 1}
                          className="text-muted-foreground hover:text-primary disabled:opacity-30"
                        >
                          <GripVertical className="h-3 w-3 -rotate-90" />
                        </button>
                      </div>
                      
                      <span className="text-xs sm:text-sm font-mono text-primary w-16 sm:w-20 flex-shrink-0">
                        {routine.time_slot}
                      </span>
                      <span className={cn(
                        "text-xs sm:text-sm flex-1 min-w-0 truncate",
                        !routine.is_active && "line-through"
                      )}>
                        {routine.action_text}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleToggleActive(routine)}
                          className="p-1 text-muted-foreground hover:text-primary"
                          title={routine.is_active ? "Deactivate" : "Activate"}
                        >
                          {routine.is_active ? (
                            <ToggleRight className="h-4 w-4 text-primary" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => openDialog(routine)}>
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleDelete(routine.id)}>
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Dialog */}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Time</label>
                <Input 
                  value={form.time_slot} 
                  onChange={(e) => setForm({ ...form, time_slot: e.target.value })} 
                  className="bg-charcoal border-border" 
                  placeholder="e.g., 5:00 AM" 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Duration (min)</label>
                <Input 
                  type="number"
                  min={1}
                  max={120}
                  value={form.duration_minutes} 
                  onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 5 })} 
                  className="bg-charcoal border-border" 
                  placeholder="5" 
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Action</label>
              <Input 
                value={form.action_text} 
                onChange={(e) => setForm({ ...form, action_text: e.target.value })} 
                className="bg-charcoal border-border" 
                placeholder="e.g., Wake up — no snooze" 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description / Instructions</label>
              <Textarea 
                value={form.description || ""} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                className="bg-charcoal border-border min-h-[80px]" 
                placeholder="Add detailed instructions that users will see when they expand this routine..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                This text appears when users expand the routine item. Use it for step-by-step guidance.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Active</label>
              <Switch 
                checked={form.is_active} 
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} 
              />
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

// Sub-Steps Editor Tab Component
function SubStepsEditorTab() {
  const { templates, loading } = useDisciplineTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const activeTemplates = templates.filter(t => t.is_active);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <Card className="bg-charcoal border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-5 w-5 text-primary" />
          Sub-Steps Editor
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Define micro-steps for each routine. Users will see these when they expand a routine item, and can customize them.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Select Template to Edit</label>
          <Select 
            value={selectedTemplateId || ""} 
            onValueChange={(v) => setSelectedTemplateId(v || null)}
          >
            <SelectTrigger className="bg-background border-border w-full max-w-md">
              <SelectValue placeholder="Choose a discipline template..." />
            </SelectTrigger>
            <SelectContent>
              {activeTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name} ({template.routines.length} routines)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Routines List with Sub-Steps Editors */}
        {selectedTemplate && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Morning Routines</span>
            </div>
            {selectedTemplate.routines
              .filter(r => r.routine_type === "morning")
              .sort((a, b) => a.display_order - b.display_order)
              .map((routine) => (
                <RoutineSubStepsEditor
                  key={`${selectedTemplate.id}-${routine.display_order}`}
                  templateId={selectedTemplate.id}
                  routineIndex={routine.display_order}
                  routineName={routine.action_text}
                />
              ))}

            <Separator className="my-6" />

            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Evening Routines</span>
            </div>
            {selectedTemplate.routines
              .filter(r => r.routine_type === "evening")
              .sort((a, b) => a.display_order - b.display_order)
              .map((routine) => (
                <RoutineSubStepsEditor
                  key={`${selectedTemplate.id}-evening-${routine.display_order}`}
                  templateId={selectedTemplate.id}
                  routineIndex={routine.display_order}
                  routineName={routine.action_text}
                />
              ))}
          </div>
        )}

        {!selectedTemplate && (
          <div className="text-center py-8 text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select a template above to edit its routine sub-steps.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
