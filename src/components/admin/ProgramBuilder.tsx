import { useState, useMemo } from "react";
import { 
  Calendar, ArrowLeft, Plus, Edit, Trash2, Loader2, 
  ChevronDown, ChevronRight, Dumbbell, Moon, Copy, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useProgramWeeks, useWorkoutTemplates, useWorkoutExercises, type ProgramWeek, type WorkoutTemplate } from "@/hooks/useWorkoutContent";
import { 
  useProgramDayWorkouts, 
  useProgramDayExercises,
  useBulkProgramExercises,
  type ProgramDayWorkout,
  type ProgramDayExercise 
} from "@/hooks/useProgramDayWorkouts";

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday", short: "Mon" },
  { value: "tuesday", label: "Tuesday", short: "Tue" },
  { value: "wednesday", label: "Wednesday", short: "Wed" },
  { value: "thursday", label: "Thursday", short: "Thu" },
  { value: "friday", label: "Friday", short: "Fri" },
  { value: "saturday", label: "Saturday", short: "Sat" },
  { value: "sunday", label: "Sunday", short: "Sun" },
] as const;

const SECTION_TYPES = [
  { value: "warmup", label: "Warm-up", color: "text-yellow-400" },
  { value: "main", label: "Main Work", color: "text-primary" },
  { value: "finisher", label: "Finisher", color: "text-red-400" },
  { value: "cooldown", label: "Cool-down", color: "text-blue-400" },
] as const;

export default function ProgramBuilder() {
  const { weeks, loading: weeksLoading, updateWeek } = useProgramWeeks();
  const { templates } = useWorkoutTemplates();
  const [selectedWeek, setSelectedWeek] = useState<ProgramWeek | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  
  // Week settings dialog
  const [weekSettingsOpen, setWeekSettingsOpen] = useState(false);
  const [weekForm, setWeekForm] = useState({ title: "", focus_description: "", scripture_reference: "" });

  // Day workout dialog - simplified
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<ProgramDayWorkout | null>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState("");
  const [dayForm, setDayForm] = useState({ workout_name: "", workout_description: "", is_rest_day: false });
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Exercise dialog
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ProgramDayExercise | null>(null);
  const [selectedDayWorkout, setSelectedDayWorkout] = useState<ProgramDayWorkout | null>(null);
  const [exerciseForm, setExerciseForm] = useState({
    section_type: "main" as "warmup" | "main" | "finisher" | "cooldown",
    exercise_name: "",
    sets: "",
    reps_or_time: "",
    rest: "",
    notes: "",
  });
  
  // For picking from template exercises
  const [pickFromTemplate, setPickFromTemplate] = useState(false);
  const [exerciseTemplateId, setExerciseTemplateId] = useState<string>("");
  const [allTemplateExercises, setAllTemplateExercises] = useState<any[]>([]);

  // Hooks
  const { workouts: dayWorkouts, loading: daysLoading, createWorkout, updateWorkout, deleteWorkout } = 
    useProgramDayWorkouts(selectedWeek?.id || null);
  
  const dayWorkoutIds = useMemo(() => dayWorkouts.map(d => d.id), [dayWorkouts]);
  const { exercisesMap, loading: exercisesLoading, fetchAllExercises } = useBulkProgramExercises(dayWorkoutIds);
  const { createExercise, updateExercise, deleteExercise, bulkCreateExercises } = useProgramDayExercises(selectedDayWorkout?.id || null);
  
  // Template exercises for import
  const { exercises: templateExercises } = useWorkoutExercises(selectedTemplateId || null);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "foundation": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "build": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "peak": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "";
    }
  };

  const toggleDay = (dayId: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  // Open week settings
  const openWeekSettings = () => {
    if (!selectedWeek) return;
    setWeekForm({
      title: selectedWeek.title || `Week ${selectedWeek.week_number}`,
      focus_description: selectedWeek.focus_description || "",
      scripture_reference: selectedWeek.scripture_reference || "",
    });
    setWeekSettingsOpen(true);
  };

  const saveWeekSettings = async () => {
    if (!selectedWeek) return;
    await updateWeek(selectedWeek.id, weekForm);
    setSelectedWeek({ ...selectedWeek, ...weekForm });
    setWeekSettingsOpen(false);
  };

  // Open day dialog
  const openDayDialog = (day: typeof DAYS_OF_WEEK[number], existingWorkout?: ProgramDayWorkout) => {
    setSelectedDayOfWeek(day.value);
    setUseTemplate(false);
    setSelectedTemplateId("");
    if (existingWorkout) {
      setEditingDay(existingWorkout);
      setDayForm({
        workout_name: existingWorkout.workout_name,
        workout_description: existingWorkout.workout_description || "",
        is_rest_day: existingWorkout.is_rest_day,
      });
    } else {
      setEditingDay(null);
      setDayForm({ workout_name: "", workout_description: "", is_rest_day: false });
    }
    setDayDialogOpen(true);
  };

  const saveDayWorkout = async () => {
    if (!selectedWeek || !selectedDayOfWeek) return;
    
    let workoutId: string | undefined;
    
    if (editingDay) {
      await updateWorkout(editingDay.id, dayForm);
      workoutId = editingDay.id;
    } else {
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      const newWorkout = await createWorkout({
        week_id: selectedWeek.id,
        day_of_week: selectedDayOfWeek as any,
        workout_name: useTemplate && selectedTemplate 
          ? selectedTemplate.name 
          : (dayForm.workout_name || (dayForm.is_rest_day ? "Rest Day" : "Workout")),
        workout_description: useTemplate && selectedTemplate 
          ? selectedTemplate.description 
          : (dayForm.workout_description || null),
        is_rest_day: dayForm.is_rest_day,
        display_order: DAYS_OF_WEEK.findIndex(d => d.value === selectedDayOfWeek),
      });
      workoutId = newWorkout?.id;
      
      // Import exercises from template
      if (useTemplate && selectedTemplateId && templateExercises.length > 0 && workoutId) {
        const exercisesToCreate = templateExercises.map((ex, idx) => ({
          day_workout_id: workoutId!,
          section_type: ex.section_type,
          exercise_name: ex.exercise_name,
          sets: ex.sets,
          reps_or_time: ex.reps_or_time,
          rest: ex.rest,
          notes: ex.notes,
          scaling_options: ex.scaling_options,
          display_order: idx,
        }));
        await bulkCreateExercises(exercisesToCreate);
        await fetchAllExercises();
      }
    }
    setDayDialogOpen(false);
  };

  const handleDeleteDay = async (workout: ProgramDayWorkout) => {
    if (confirm("Delete this workout and all exercises?")) {
      await deleteWorkout(workout.id);
    }
  };

  // Exercise functions
  const openExerciseDialog = (dayWorkout: ProgramDayWorkout, exercise?: ProgramDayExercise) => {
    setSelectedDayWorkout(dayWorkout);
    setPickFromTemplate(false);
    setExerciseTemplateId("");
    setAllTemplateExercises([]);
    
    if (exercise) {
      setEditingExercise(exercise);
      setExerciseForm({
        section_type: exercise.section_type,
        exercise_name: exercise.exercise_name,
        sets: exercise.sets || "",
        reps_or_time: exercise.reps_or_time || "",
        rest: exercise.rest || "",
        notes: exercise.notes || "",
      });
    } else {
      setEditingExercise(null);
      setExerciseForm({
        section_type: "main",
        exercise_name: "",
        sets: "",
        reps_or_time: "",
        rest: "",
        notes: "",
      });
    }
    setExerciseDialogOpen(true);
  };

  // Load exercises when template is selected for exercise picker
  const loadTemplateExercisesForPicker = async (templateId: string) => {
    setExerciseTemplateId(templateId);
    if (!templateId) {
      setAllTemplateExercises([]);
      return;
    }
    
    const { data } = await import("@/integrations/supabase/client").then(m => 
      m.supabase
        .from("workout_exercises")
        .select("*")
        .eq("template_id", templateId)
        .order("display_order")
    );
    setAllTemplateExercises(data || []);
  };

  // Apply selected template exercise to form
  const applyTemplateExercise = (ex: any) => {
    setExerciseForm({
      section_type: ex.section_type,
      exercise_name: ex.exercise_name,
      sets: ex.sets || "",
      reps_or_time: ex.reps_or_time || "",
      rest: ex.rest || "",
      notes: ex.notes || "",
    });
    setPickFromTemplate(false);
  };

  const saveExercise = async () => {
    if (!selectedDayWorkout || !exerciseForm.exercise_name.trim()) return;
    
    const currentExercises = exercisesMap[selectedDayWorkout.id] || [];
    
    if (editingExercise) {
      await updateExercise(editingExercise.id, exerciseForm);
    } else {
      await createExercise({
        ...exerciseForm,
        day_workout_id: selectedDayWorkout.id,
        display_order: currentExercises.length,
        scaling_options: null,
      });
    }
    await fetchAllExercises();
    setExerciseDialogOpen(false);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (confirm("Delete this exercise?")) {
      await deleteExercise(exerciseId);
      await fetchAllExercises();
    }
  };

  const getWorkoutForDay = (dayValue: string) => dayWorkouts.find(w => w.day_of_week === dayValue);

  if (weeksLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Week detail view
  if (selectedWeek) {
    return (
      <div className="space-y-6">
        {/* Simple Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedWeek(null)} className="self-start">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Weeks
          </Button>
          <div className="flex-1 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-display text-xl">
              {selectedWeek.week_number}
            </div>
            <div>
              <h2 className="text-xl font-bold">{selectedWeek.title || `Week ${selectedWeek.week_number}`}</h2>
              <Badge className={`${getPhaseColor(selectedWeek.phase)} text-xs`}>
                {selectedWeek.phase.charAt(0).toUpperCase() + selectedWeek.phase.slice(1)} Phase
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={openWeekSettings}>
            <Edit className="h-4 w-4 mr-2" /> Edit Week Info
          </Button>
        </div>

        {/* Instructions */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">How to use:</strong> Click "+ Add Workout" to create a new workout for any day. 
              You can either <strong>build from scratch</strong> or <strong>use a template</strong> from your workout library.
            </p>
          </CardContent>
        </Card>

        {/* Days - Simple Cards */}
        {daysLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => {
              const workout = getWorkoutForDay(day.value);
              const dayExercises = workout ? (exercisesMap[workout.id] || []) : [];
              const isExpanded = workout ? expandedDays.has(workout.id) : false;

              return (
                <Card key={day.value} className="bg-charcoal border-border">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center gap-4">
                      <div className="w-16 text-center py-2 rounded bg-background">
                        <span className="text-xs font-medium text-muted-foreground uppercase">{day.short}</span>
                      </div>
                      
                      {workout ? (
                        <div className="flex-1 flex items-center gap-3">
                          {workout.is_rest_day ? (
                            <Moon className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Dumbbell className="h-5 w-5 text-primary" />
                          )}
                          <div className="flex-1">
                            <span className="font-semibold">{workout.workout_name}</span>
                            {!workout.is_rest_day && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {dayExercises.length} exercises
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {!workout.is_rest_day && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleDay(workout.id)}
                              >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                {isExpanded ? "Hide" : "Show"}
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDayDialog(day, workout)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteDay(workout)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="flex-1 justify-center gap-2 h-12" 
                          onClick={() => openDayDialog(day)}
                        >
                          <Plus className="h-4 w-4" /> Add {day.label} Workout
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  {/* Expanded Exercise View */}
                  {workout && !workout.is_rest_day && isExpanded && (
                    <CardContent className="pt-2 pb-4 space-y-4">
                      {SECTION_TYPES.map((section) => {
                        const sectionExercises = dayExercises.filter(e => e.section_type === section.value);
                        if (sectionExercises.length === 0 && section.value !== "main") return null;
                        
                        return (
                          <div key={section.value} className="pl-20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-bold uppercase tracking-wider ${section.color}`}>
                                {section.label}
                              </span>
                            </div>
                            {sectionExercises.length === 0 ? (
                              <p className="text-sm text-muted-foreground italic">No exercises yet</p>
                            ) : (
                              <div className="space-y-1">
                                {sectionExercises.map((exercise) => (
                                  <div key={exercise.id} className="flex items-start gap-3 p-2 rounded bg-background border border-border group">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm">{exercise.exercise_name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {[
                                          exercise.sets && `${exercise.sets} sets`,
                                          exercise.reps_or_time,
                                          exercise.rest && `Rest: ${exercise.rest}`
                                        ].filter(Boolean).join(" • ")}
                                      </p>
                                      {exercise.notes && <p className="text-xs text-primary/80 mt-1">{exercise.notes}</p>}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openExerciseDialog(workout, exercise)}>
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteExercise(exercise.id)}>
                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      <div className="pl-20">
                        <Button variant="outline" size="sm" onClick={() => openExerciseDialog(workout)}>
                          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Exercise
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Week Settings Dialog - Simplified */}
        <Dialog open={weekSettingsOpen} onOpenChange={setWeekSettingsOpen}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle>Week {selectedWeek.week_number} Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Week Title</Label>
                <Input 
                  value={weekForm.title} 
                  onChange={(e) => setWeekForm({ ...weekForm, title: e.target.value })} 
                  className="bg-charcoal border-border mt-1" 
                  placeholder="e.g., Foundation Building" 
                />
              </div>
              <div>
                <Label>Focus / Description</Label>
                <Textarea 
                  value={weekForm.focus_description} 
                  onChange={(e) => setWeekForm({ ...weekForm, focus_description: e.target.value })} 
                  className="bg-charcoal border-border mt-1" 
                  placeholder="What's the main focus for this week?" 
                />
              </div>
              <div>
                <Label>Scripture Reference</Label>
                <Input 
                  value={weekForm.scripture_reference} 
                  onChange={(e) => setWeekForm({ ...weekForm, scripture_reference: e.target.value })} 
                  className="bg-charcoal border-border mt-1" 
                  placeholder="e.g., Philippians 4:13" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWeekSettingsOpen(false)}>Cancel</Button>
              <Button variant="gold" onClick={saveWeekSettings}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Day Workout Dialog - With Template Option */}
        <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {editingDay ? "Edit" : "Add"} {DAYS_OF_WEEK.find(d => d.value === selectedDayOfWeek)?.label} Workout
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Rest Day Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal border border-border">
                <div>
                  <Label className="text-base">Rest Day</Label>
                  <p className="text-xs text-muted-foreground">No workout - recovery day</p>
                </div>
                <Switch
                  checked={dayForm.is_rest_day}
                  onCheckedChange={(v) => {
                    setDayForm({ ...dayForm, is_rest_day: v, workout_name: v ? "Rest Day" : "" });
                    if (v) setUseTemplate(false);
                  }}
                />
              </div>
              
              {!dayForm.is_rest_day && !editingDay && (
                <>
                  {/* Template or Custom Toggle */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={!useTemplate ? "default" : "outline"}
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => setUseTemplate(false)}
                    >
                      <Plus className="h-5 w-5" />
                      <span>Build from Scratch</span>
                    </Button>
                    <Button
                      type="button"
                      variant={useTemplate ? "default" : "outline"}
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => setUseTemplate(true)}
                    >
                      <Copy className="h-5 w-5" />
                      <span>Use a Template</span>
                    </Button>
                  </div>
                  
                  {useTemplate && (
                    <div>
                      <Label>Select Template</Label>
                      <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                        <SelectTrigger className="bg-charcoal border-border mt-1">
                          <SelectValue placeholder="Choose a workout template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.filter(t => t.is_active).map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name} {t.focus && `(${t.focus})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        All exercises from this template will be copied in. You can edit them after.
                      </p>
                    </div>
                  )}
                </>
              )}
              
              {!dayForm.is_rest_day && !useTemplate && (
                <>
                  <div>
                    <Label>Workout Name *</Label>
                    <Input 
                      value={dayForm.workout_name} 
                      onChange={(e) => setDayForm({ ...dayForm, workout_name: e.target.value })} 
                      className="bg-charcoal border-border mt-1" 
                      placeholder="e.g., Push Day, Leg Power, Full Body Burn" 
                    />
                  </div>
                  <div>
                    <Label>Description (optional)</Label>
                    <Textarea 
                      value={dayForm.workout_description} 
                      onChange={(e) => setDayForm({ ...dayForm, workout_description: e.target.value })} 
                      className="bg-charcoal border-border mt-1" 
                      placeholder="Brief description of today's focus..." 
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDayDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="gold" 
                onClick={saveDayWorkout}
                disabled={!dayForm.is_rest_day && !useTemplate && !dayForm.workout_name.trim() && !editingDay}
              >
                <Save className="h-4 w-4 mr-2" /> Save Workout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Exercise Dialog - With Template Picker */}
        <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
          <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                {editingExercise ? "Edit" : "Add"} Exercise
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Option to pick from template - only when adding new */}
              {!editingExercise && (
                <div className="p-4 rounded-lg bg-charcoal border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="text-base">Pick from Template</Label>
                      <p className="text-xs text-muted-foreground">Use an existing exercise with pre-filled details</p>
                    </div>
                    <Switch
                      checked={pickFromTemplate}
                      onCheckedChange={(v) => {
                        setPickFromTemplate(v);
                        if (!v) {
                          setExerciseTemplateId("");
                          setAllTemplateExercises([]);
                        }
                      }}
                    />
                  </div>
                  
                  {pickFromTemplate && (
                    <div className="space-y-3">
                      <Select value={exerciseTemplateId} onValueChange={loadTemplateExercisesForPicker}>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select a template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.filter(t => t.is_active).map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {allTemplateExercises.length > 0 && (
                        <div className="max-h-48 overflow-y-auto space-y-1 rounded border border-border p-2 bg-background">
                          {allTemplateExercises.map((ex) => (
                            <button
                              key={ex.id}
                              type="button"
                              className="w-full text-left p-2 rounded hover:bg-primary/10 transition-colors"
                              onClick={() => applyTemplateExercise(ex)}
                            >
                              <p className="font-medium text-sm">{ex.exercise_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {[ex.sets && `${ex.sets} sets`, ex.reps_or_time, ex.rest].filter(Boolean).join(" • ")}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {exerciseTemplateId && allTemplateExercises.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">No exercises in this template</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Main form fields */}
              <div>
                <Label>Section</Label>
                <Select value={exerciseForm.section_type} onValueChange={(v: any) => setExerciseForm({ ...exerciseForm, section_type: v })}>
                  <SelectTrigger className="bg-charcoal border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <span className={s.color}>{s.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Exercise Name *</Label>
                <Input 
                  value={exerciseForm.exercise_name} 
                  onChange={(e) => setExerciseForm({ ...exerciseForm, exercise_name: e.target.value })} 
                  className="bg-charcoal border-border mt-1" 
                  placeholder="e.g., Push-ups, Burpees, Squats" 
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Sets</Label>
                  <Input 
                    value={exerciseForm.sets} 
                    onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value })} 
                    className="bg-charcoal border-border mt-1" 
                    placeholder="e.g., 4" 
                  />
                </div>
                <div>
                  <Label>Reps/Time</Label>
                  <Input 
                    value={exerciseForm.reps_or_time} 
                    onChange={(e) => setExerciseForm({ ...exerciseForm, reps_or_time: e.target.value })} 
                    className="bg-charcoal border-border mt-1" 
                    placeholder="e.g., 10" 
                  />
                </div>
                <div>
                  <Label>Rest</Label>
                  <Input 
                    value={exerciseForm.rest} 
                    onChange={(e) => setExerciseForm({ ...exerciseForm, rest: e.target.value })} 
                    className="bg-charcoal border-border mt-1" 
                    placeholder="e.g., 60s" 
                  />
                </div>
              </div>
              <div>
                <Label>Coaching Notes (optional)</Label>
                <Textarea 
                  value={exerciseForm.notes} 
                  onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })} 
                  className="bg-charcoal border-border mt-1" 
                  placeholder="e.g., Keep core tight, focus on form" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExerciseDialogOpen(false)}>Cancel</Button>
              <Button variant="gold" onClick={saveExercise} disabled={!exerciseForm.exercise_name.trim()}>
                <Save className="h-4 w-4 mr-2" /> Save Exercise
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Week selection - Cleaner Grid
  const phases = [
    { name: "Foundation", key: "foundation", color: "text-blue-400", weeks: weeks.filter(w => w.phase === "foundation") },
    { name: "Build", key: "build", color: "text-amber-400", weeks: weeks.filter(w => w.phase === "build") },
    { name: "Peak", key: "peak", color: "text-green-400", weeks: weeks.filter(w => w.phase === "peak") },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">12-Week Program Builder</h2>
        <p className="text-muted-foreground mt-1">Select a week to add or edit workouts</p>
      </div>

      {phases.map((phase) => (
        <div key={phase.key}>
          <h3 className={`text-lg font-bold mb-4 ${phase.color}`}>{phase.name} Phase</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {phase.weeks.map((week) => (
              <Card
                key={week.id}
                className="bg-charcoal border-border cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
                onClick={() => setSelectedWeek(week)}
              >
                <CardContent className="p-5 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-2xl mb-3 group-hover:scale-110 transition-transform">
                    {week.week_number}
                  </div>
                  <h4 className="font-semibold truncate">{week.title || `Week ${week.week_number}`}</h4>
                  {week.focus_description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{week.focus_description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
