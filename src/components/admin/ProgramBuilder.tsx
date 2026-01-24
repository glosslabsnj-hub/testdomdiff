import { useState, useMemo } from "react";
import { 
  Calendar, ArrowLeft, Plus, Edit, Trash2, Loader2, Video, 
  ChevronDown, ChevronRight, GripVertical, Dumbbell, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useProgramWeeks, type ProgramWeek } from "@/hooks/useWorkoutContent";
import { 
  useProgramDayWorkouts, 
  useProgramDayExercises,
  useBulkProgramExercises,
  type ProgramDayWorkout,
  type ProgramDayExercise 
} from "@/hooks/useProgramDayWorkouts";
import VideoUploader from "./VideoUploader";

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
  const [selectedWeek, setSelectedWeek] = useState<ProgramWeek | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  
  // Week settings dialog
  const [weekSettingsOpen, setWeekSettingsOpen] = useState(false);
  const [weekForm, setWeekForm] = useState({
    title: "",
    focus_description: "",
    conditioning_notes: "",
    recovery_notes: "",
    scripture_reference: "",
    video_url: "",
    video_title: "",
    video_description: "",
  });

  // Day workout dialog
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<ProgramDayWorkout | null>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>("");
  const [dayForm, setDayForm] = useState({
    workout_name: "",
    workout_description: "",
    is_rest_day: false,
  });

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
    scaling_options: "",
    display_order: 0,
  });

  // Hooks for day workouts and exercises
  const { workouts: dayWorkouts, loading: daysLoading, createWorkout, updateWorkout, deleteWorkout } = 
    useProgramDayWorkouts(selectedWeek?.id || null);
  
  const dayWorkoutIds = useMemo(() => dayWorkouts.map(d => d.id), [dayWorkouts]);
  const { exercisesMap, loading: exercisesLoading, fetchAllExercises } = useBulkProgramExercises(dayWorkoutIds);

  // Single day exercise hook for adding/editing
  const { createExercise, updateExercise, deleteExercise } = useProgramDayExercises(selectedDayWorkout?.id || null);

  // Phase colors
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "foundation": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "build": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "peak": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "";
    }
  };

  // Toggle day expansion
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
      conditioning_notes: selectedWeek.conditioning_notes || "",
      recovery_notes: selectedWeek.recovery_notes || "",
      scripture_reference: selectedWeek.scripture_reference || "",
      video_url: selectedWeek.video_url || "",
      video_title: selectedWeek.video_title || "",
      video_description: selectedWeek.video_description || "",
    });
    setWeekSettingsOpen(true);
  };

  const saveWeekSettings = async () => {
    if (!selectedWeek) return;
    await updateWeek(selectedWeek.id, {
      ...weekForm,
      video_url: weekForm.video_url || null,
      video_title: weekForm.video_title || null,
      video_description: weekForm.video_description || null,
    });
    setSelectedWeek({ ...selectedWeek, ...weekForm });
    setWeekSettingsOpen(false);
  };

  // Open day dialog
  const openDayDialog = (day: typeof DAYS_OF_WEEK[number], existingWorkout?: ProgramDayWorkout) => {
    setSelectedDayOfWeek(day.value);
    if (existingWorkout) {
      setEditingDay(existingWorkout);
      setDayForm({
        workout_name: existingWorkout.workout_name,
        workout_description: existingWorkout.workout_description || "",
        is_rest_day: existingWorkout.is_rest_day,
      });
    } else {
      setEditingDay(null);
      setDayForm({
        workout_name: "",
        workout_description: "",
        is_rest_day: false,
      });
    }
    setDayDialogOpen(true);
  };

  const saveDayWorkout = async () => {
    if (!selectedWeek || !selectedDayOfWeek) return;
    
    if (editingDay) {
      await updateWorkout(editingDay.id, dayForm);
    } else {
      await createWorkout({
        week_id: selectedWeek.id,
        day_of_week: selectedDayOfWeek as any,
        workout_name: dayForm.workout_name || (dayForm.is_rest_day ? "Rest Day" : "Workout"),
        workout_description: dayForm.workout_description || null,
        is_rest_day: dayForm.is_rest_day,
        display_order: DAYS_OF_WEEK.findIndex(d => d.value === selectedDayOfWeek),
      });
    }
    setDayDialogOpen(false);
  };

  const handleDeleteDay = async (workout: ProgramDayWorkout) => {
    if (confirm("Delete this workout day and all its exercises?")) {
      await deleteWorkout(workout.id);
    }
  };

  // Open exercise dialog
  const openExerciseDialog = (dayWorkout: ProgramDayWorkout, exercise?: ProgramDayExercise) => {
    setSelectedDayWorkout(dayWorkout);
    if (exercise) {
      setEditingExercise(exercise);
      setExerciseForm({
        section_type: exercise.section_type,
        exercise_name: exercise.exercise_name,
        sets: exercise.sets || "",
        reps_or_time: exercise.reps_or_time || "",
        rest: exercise.rest || "",
        notes: exercise.notes || "",
        scaling_options: exercise.scaling_options || "",
        display_order: exercise.display_order,
      });
    } else {
      setEditingExercise(null);
      const currentExercises = exercisesMap[dayWorkout.id] || [];
      setExerciseForm({
        section_type: "main",
        exercise_name: "",
        sets: "",
        reps_or_time: "",
        rest: "",
        notes: "",
        scaling_options: "",
        display_order: currentExercises.length,
      });
    }
    setExerciseDialogOpen(true);
  };

  const saveExercise = async () => {
    if (!selectedDayWorkout || !exerciseForm.exercise_name.trim()) return;
    
    if (editingExercise) {
      await updateExercise(editingExercise.id, exerciseForm);
    } else {
      await createExercise({
        ...exerciseForm,
        day_workout_id: selectedDayWorkout.id,
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

  // Get workout for a specific day
  const getWorkoutForDay = (dayValue: string) => 
    dayWorkouts.find(w => w.day_of_week === dayValue);

  // Loading state
  if (weeksLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Week detail view
  if (selectedWeek) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedWeek(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-display text-lg">
                {selectedWeek.week_number}
              </div>
              <div>
                <h2 className="headline-card">{selectedWeek.title || `Week ${selectedWeek.week_number}`}</h2>
                <Badge className={`${getPhaseColor(selectedWeek.phase)} text-xs mt-1`}>
                  {selectedWeek.phase.charAt(0).toUpperCase() + selectedWeek.phase.slice(1)} Phase
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={openWeekSettings}>
            <Edit className="h-4 w-4 mr-2" /> Week Settings
          </Button>
        </div>

        {selectedWeek.focus_description && (
          <p className="text-muted-foreground">{selectedWeek.focus_description}</p>
        )}

        {/* Days Grid */}
        {daysLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => {
              const workout = getWorkoutForDay(day.value);
              const dayExercises = workout ? (exercisesMap[workout.id] || []) : [];
              const isExpanded = workout ? expandedDays.has(workout.id) : false;

              return (
                <Card key={day.value} className="bg-charcoal border-border overflow-hidden">
                  <div className="flex items-center p-4 gap-4">
                    <div className="w-12 text-center">
                      <span className="text-xs text-muted-foreground uppercase">{day.short}</span>
                    </div>
                    
                    {workout ? (
                      <>
                        <Collapsible open={isExpanded} onOpenChange={() => toggleDay(workout.id)} className="flex-1">
                          <CollapsibleTrigger className="flex items-center gap-3 w-full text-left">
                            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            {workout.is_rest_day ? (
                              <Moon className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Dumbbell className="h-5 w-5 text-primary" />
                            )}
                            <div className="flex-1">
                              <span className="font-medium">{workout.workout_name}</span>
                              {workout.workout_description && (
                                <p className="text-sm text-muted-foreground truncate">{workout.workout_description}</p>
                              )}
                            </div>
                            {!workout.is_rest_day && (
                              <Badge variant="secondary" className="text-xs">
                                {dayExercises.length} exercise{dayExercises.length !== 1 ? "s" : ""}
                              </Badge>
                            )}
                          </CollapsibleTrigger>
                          
                          {!workout.is_rest_day && (
                            <CollapsibleContent>
                              <div className="pt-4 pl-8 space-y-4">
                                {SECTION_TYPES.map((section) => {
                                  const sectionExercises = dayExercises.filter(e => e.section_type === section.value);
                                  if (sectionExercises.length === 0 && section.value !== "main") return null;
                                  
                                  return (
                                    <div key={section.value}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-medium uppercase tracking-wider ${section.color}`}>
                                          {section.label}
                                        </span>
                                      </div>
                                      {sectionExercises.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">No exercises</p>
                                      ) : (
                                        <div className="space-y-2">
                                          {sectionExercises.map((exercise) => (
                                            <div key={exercise.id} className="flex items-center gap-3 p-2 rounded bg-background border border-border group">
                                              <GripVertical className="h-4 w-4 text-muted-foreground opacity-50" />
                                              <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{exercise.exercise_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                  {[exercise.sets && `${exercise.sets} sets`, exercise.reps_or_time, exercise.rest && `Rest: ${exercise.rest}`].filter(Boolean).join(" • ")}
                                                </p>
                                                {exercise.notes && <p className="text-xs text-muted-foreground/70 mt-0.5">{exercise.notes}</p>}
                                              </div>
                                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => openExerciseDialog(workout, exercise)}>
                                                <Edit className="h-3.5 w-3.5" />
                                              </Button>
                                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteExercise(exercise.id)}>
                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                
                                <Button variant="outline" size="sm" className="mt-2" onClick={() => openExerciseDialog(workout)}>
                                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Exercise
                                </Button>
                              </div>
                            </CollapsibleContent>
                          )}
                        </Collapsible>
                        
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDayDialog(day, workout)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteDay(workout)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Button variant="outline" className="flex-1 justify-start gap-2" onClick={() => openDayDialog(day)}>
                        <Plus className="h-4 w-4" /> Add {day.label} Workout
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Week Settings Dialog */}
        <Dialog open={weekSettingsOpen} onOpenChange={setWeekSettingsOpen}>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                Week {selectedWeek.week_number} Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Week Title</Label>
                <Input value={weekForm.title} onChange={(e) => setWeekForm({ ...weekForm, title: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="e.g., Foundation Building" />
              </div>
              <div>
                <Label>Focus Description</Label>
                <Textarea value={weekForm.focus_description} onChange={(e) => setWeekForm({ ...weekForm, focus_description: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="What's the main focus for this week?" />
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary" />
                  Week Video
                </h4>
                <VideoUploader
                  currentVideoUrl={weekForm.video_url || null}
                  onUpload={(url) => setWeekForm({ ...weekForm, video_url: url || "" })}
                  folder={`week-${selectedWeek.week_number}`}
                />
                <div>
                  <Label>Video Title</Label>
                  <Input value={weekForm.video_title} onChange={(e) => setWeekForm({ ...weekForm, video_title: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="e.g., Week 1 Overview" />
                </div>
                <div>
                  <Label>Video Description</Label>
                  <Textarea value={weekForm.video_description} onChange={(e) => setWeekForm({ ...weekForm, video_description: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="Brief description of the video content" />
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div>
                  <Label>Conditioning Notes</Label>
                  <Textarea value={weekForm.conditioning_notes} onChange={(e) => setWeekForm({ ...weekForm, conditioning_notes: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="Cardio, HIIT, or other conditioning notes..." />
                </div>
                <div>
                  <Label>Recovery Notes</Label>
                  <Textarea value={weekForm.recovery_notes} onChange={(e) => setWeekForm({ ...weekForm, recovery_notes: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="Stretching, mobility, rest day guidance..." />
                </div>
                <div>
                  <Label>Scripture Reference</Label>
                  <Input value={weekForm.scripture_reference} onChange={(e) => setWeekForm({ ...weekForm, scripture_reference: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="e.g., Philippians 4:13" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWeekSettingsOpen(false)}>Cancel</Button>
              <Button variant="gold" onClick={saveWeekSettings}>Save Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Day Workout Dialog */}
        <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>
                {editingDay ? "Edit" : "Add"} {DAYS_OF_WEEK.find(d => d.value === selectedDayOfWeek)?.label} Workout
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal border border-border">
                <div>
                  <Label>Rest Day</Label>
                  <p className="text-xs text-muted-foreground">Mark this as a rest/recovery day</p>
                </div>
                <Switch
                  checked={dayForm.is_rest_day}
                  onCheckedChange={(v) => setDayForm({ ...dayForm, is_rest_day: v, workout_name: v ? "Rest Day" : "" })}
                />
              </div>
              
              <div>
                <Label>Workout Name *</Label>
                <Input 
                  value={dayForm.workout_name} 
                  onChange={(e) => setDayForm({ ...dayForm, workout_name: e.target.value })} 
                  className="bg-charcoal border-border mt-1" 
                  placeholder={dayForm.is_rest_day ? "e.g., Active Recovery" : "e.g., Push Day Power"} 
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDayDialogOpen(false)}>Cancel</Button>
              <Button variant="gold" onClick={saveDayWorkout}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Exercise Dialog */}
        <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editingExercise ? "Edit Exercise" : "Add Exercise"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Section</Label>
                <Select value={exerciseForm.section_type} onValueChange={(v: any) => setExerciseForm({ ...exerciseForm, section_type: v })}>
                  <SelectTrigger className="bg-charcoal border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Exercise Name *</Label>
                <Input value={exerciseForm.exercise_name} onChange={(e) => setExerciseForm({ ...exerciseForm, exercise_name: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="e.g., Barbell Bench Press" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Sets</Label>
                  <Input value={exerciseForm.sets} onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="e.g., 4" />
                </div>
                <div>
                  <Label>Reps/Time</Label>
                  <Input value={exerciseForm.reps_or_time} onChange={(e) => setExerciseForm({ ...exerciseForm, reps_or_time: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="e.g., 8-10" />
                </div>
                <div>
                  <Label>Rest</Label>
                  <Input value={exerciseForm.rest} onChange={(e) => setExerciseForm({ ...exerciseForm, rest: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="e.g., 90s" />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={exerciseForm.notes} onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="e.g., Focus on controlled eccentric, 3-second negative" />
              </div>
              <div>
                <Label>Scaling Options</Label>
                <Textarea value={exerciseForm.scaling_options} onChange={(e) => setExerciseForm({ ...exerciseForm, scaling_options: e.target.value })} className="bg-charcoal border-border mt-1" placeholder="e.g., Beginner: Use dumbbells instead" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExerciseDialogOpen(false)}>Cancel</Button>
              <Button variant="gold" onClick={saveExercise}>Save Exercise</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Week selection grid
  const phases = [
    { name: "Foundation", key: "foundation", weeks: weeks.filter(w => w.phase === "foundation") },
    { name: "Build", key: "build", weeks: weeks.filter(w => w.phase === "build") },
    { name: "Peak", key: "peak", weeks: weeks.filter(w => w.phase === "peak") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="headline-card">12-Week Program Builder</h2>
        <p className="text-muted-foreground text-sm mt-1">Click a week to configure workouts, exercises, and content</p>
      </div>

      {phases.map((phase) => (
        <div key={phase.key} className="space-y-3">
          <h3 className="text-lg font-semibold text-primary">{phase.name} Phase</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {phase.weeks.map((week) => (
              <Card
                key={week.id}
                className="bg-charcoal border-border cursor-pointer hover:border-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                onClick={() => setSelectedWeek(week)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedWeek(week);
                  }
                }}
              >
                <CardContent className="p-4 pointer-events-none">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-display">
                      {week.week_number}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {week.video_url && <Video className="w-3 h-3 text-primary" />}
                      <Badge className={`${getPhaseColor(week.phase)} text-xs`}>{week.phase}</Badge>
                    </div>
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
    </div>
  );
}
