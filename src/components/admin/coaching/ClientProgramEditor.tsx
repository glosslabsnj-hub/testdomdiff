import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Calendar,
  Loader2,
  GripVertical,
  Pencil,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useClientProgram, ClientProgramWeek, ClientProgramDay, ClientProgramExercise } from "@/hooks/useClientProgram";

interface ClientProgramEditorProps {
  clientId: string;
}

const SECTION_TYPES = [
  { value: "warmup", label: "Warm-up" },
  { value: "main", label: "Main Work" },
  { value: "accessory", label: "Accessory" },
  { value: "conditioning", label: "Conditioning" },
  { value: "cooldown", label: "Cool-down" },
];

export default function ClientProgramEditor({ clientId }: ClientProgramEditorProps) {
  const {
    weeks,
    loading,
    hasProgram,
    initializeProgram,
    updateWeek,
    updateDay,
    addExercise,
    updateExercise,
    deleteExercise,
    deleteProgram,
  } = useClientProgram(clientId);

  const [expandedWeeks, setExpandedWeeks] = useState<string[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks((prev) =>
      prev.includes(weekId) ? prev.filter((id) => id !== weekId) : [...prev, weekId]
    );
  };

  const toggleDay = (dayId: string) => {
    setExpandedDays((prev) =>
      prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]
    );
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    await initializeProgram();
    setIsInitializing(false);
    // Expand first week by default
    if (weeks.length === 0) {
      // Will be expanded after refetch
    }
  };

  const handleAddExercise = async (dayId: string, existingCount: number) => {
    await addExercise(dayId, {
      exercise_name: "New Exercise",
      section_type: "main",
      display_order: existingCount,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasProgram) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Structured Program</h3>
          <p className="text-muted-foreground text-center mb-4 max-w-md">
            Create a 4-week custom program with workouts, exercises, sets, and reps.
            This will appear in the client's "Program" tab.
          </p>
          <Button variant="gold" onClick={handleInitialize} disabled={isInitializing}>
            {isInitializing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create 4-Week Program
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Structured 4-Week Program</h3>
          <p className="text-sm text-muted-foreground">
            Edit workouts and exercises for each day
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-crimson hover:text-crimson">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Program
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Entire Program?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all 4 weeks, days, and exercises. The client will no
                longer see a structured program. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteProgram}
                className="bg-crimson hover:bg-crimson-dark"
              >
                Delete Program
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Weeks */}
      {weeks.map((week) => (
        <WeekCard
          key={week.id}
          week={week}
          isExpanded={expandedWeeks.includes(week.id)}
          onToggle={() => toggleWeek(week.id)}
          expandedDays={expandedDays}
          onToggleDay={toggleDay}
          editingExercise={editingExercise}
          setEditingExercise={setEditingExercise}
          onUpdateWeek={updateWeek}
          onUpdateDay={updateDay}
          onAddExercise={handleAddExercise}
          onUpdateExercise={updateExercise}
          onDeleteExercise={deleteExercise}
        />
      ))}
    </div>
  );
}

interface WeekCardProps {
  week: ClientProgramWeek;
  isExpanded: boolean;
  onToggle: () => void;
  expandedDays: string[];
  onToggleDay: (dayId: string) => void;
  editingExercise: string | null;
  setEditingExercise: (id: string | null) => void;
  onUpdateWeek: (weekId: string, updates: Partial<ClientProgramWeek>) => Promise<boolean>;
  onUpdateDay: (dayId: string, updates: Partial<ClientProgramDay>) => Promise<boolean>;
  onAddExercise: (dayId: string, existingCount: number) => Promise<void>;
  onUpdateExercise: (exerciseId: string, updates: Partial<ClientProgramExercise>) => Promise<boolean>;
  onDeleteExercise: (exerciseId: string) => Promise<boolean>;
}

function WeekCard({
  week,
  isExpanded,
  onToggle,
  expandedDays,
  onToggleDay,
  editingExercise,
  setEditingExercise,
  onUpdateWeek,
  onUpdateDay,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
}: WeekCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(week.title || `Week ${week.week_number}`);

  const workoutDays = (week.days || []).filter((d) => !d.is_rest_day).length;
  const totalExercises = (week.days || []).reduce(
    (sum, d) => sum + (d.exercises?.length || 0),
    0
  );

  const handleSaveTitle = async () => {
    await onUpdateWeek(week.id, { title: titleValue });
    setIsEditingTitle(false);
  };

  return (
    <Card className="bg-charcoal-light">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-charcoal transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={titleValue}
                        onChange={(e) => setTitleValue(e.target.value)}
                        className="h-8 w-48"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" onClick={handleSaveTitle}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsEditingTitle(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        {week.title || `Week ${week.week_number}`}
                      </CardTitle>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingTitle(true);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {workoutDays} workout days • {totalExercises} exercises
                  </p>
                </div>
              </div>
              <Badge variant="outline">Week {week.week_number}</Badge>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {(week.days || []).map((day) => (
              <DayCard
                key={day.id}
                day={day}
                weekNumber={week.week_number}
                isExpanded={expandedDays.includes(day.id)}
                onToggle={() => onToggleDay(day.id)}
                editingExercise={editingExercise}
                setEditingExercise={setEditingExercise}
                onUpdateDay={onUpdateDay}
                onAddExercise={onAddExercise}
                onUpdateExercise={onUpdateExercise}
                onDeleteExercise={onDeleteExercise}
              />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface DayCardProps {
  day: ClientProgramDay;
  weekNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
  editingExercise: string | null;
  setEditingExercise: (id: string | null) => void;
  onUpdateDay: (dayId: string, updates: Partial<ClientProgramDay>) => Promise<boolean>;
  onAddExercise: (dayId: string, existingCount: number) => Promise<void>;
  onUpdateExercise: (exerciseId: string, updates: Partial<ClientProgramExercise>) => Promise<boolean>;
  onDeleteExercise: (exerciseId: string) => Promise<boolean>;
}

function DayCard({
  day,
  weekNumber,
  isExpanded,
  onToggle,
  editingExercise,
  setEditingExercise,
  onUpdateDay,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
}: DayCardProps) {
  const [isEditingDay, setIsEditingDay] = useState(false);
  const [dayName, setDayName] = useState(day.workout_name);
  const [dayDescription, setDayDescription] = useState(day.workout_description || "");
  const [isRestDay, setIsRestDay] = useState(day.is_rest_day);

  const handleSaveDay = async () => {
    await onUpdateDay(day.id, {
      workout_name: dayName,
      workout_description: dayDescription || null,
      is_rest_day: isRestDay,
    });
    setIsEditingDay(false);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div
            className={`p-3 cursor-pointer hover:bg-charcoal transition-colors flex items-center justify-between ${
              day.is_rest_day ? "bg-muted/30" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{day.day_of_week}</span>
                  {day.is_rest_day ? (
                    <Badge variant="secondary" className="text-xs">
                      Rest
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      — {day.workout_name}
                    </span>
                  )}
                </div>
                {!day.is_rest_day && (
                  <p className="text-xs text-muted-foreground">
                    {day.exercises?.length || 0} exercises
                  </p>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingDay(true);
              }}
            >
              <Pencil className="w-3 h-3" />
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border p-3 space-y-3 bg-charcoal/50">
            {/* Day Edit Form */}
            {isEditingDay && (
              <div className="p-3 border border-primary/30 rounded-lg bg-primary/5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Workout Name</Label>
                    <Input
                      value={dayName}
                      onChange={(e) => setDayName(e.target.value)}
                      placeholder="e.g., Upper Body Push"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <Switch checked={isRestDay} onCheckedChange={setIsRestDay} />
                    <Label>Rest Day</Label>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Description (optional)</Label>
                  <Textarea
                    value={dayDescription}
                    onChange={(e) => setDayDescription(e.target.value)}
                    placeholder="Brief workout description..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="gold" onClick={handleSaveDay}>
                    Save Day
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingDay(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Exercises */}
            {!day.is_rest_day && (
              <>
                {(day.exercises || []).length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No exercises added yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(day.exercises || []).map((exercise) => (
                      <ExerciseRow
                        key={exercise.id}
                        exercise={exercise}
                        isEditing={editingExercise === exercise.id}
                        onEdit={() => setEditingExercise(exercise.id)}
                        onCancelEdit={() => setEditingExercise(null)}
                        onUpdate={onUpdateExercise}
                        onDelete={onDeleteExercise}
                      />
                    ))}
                  </div>
                )}

                <Button
                  size="sm"
                  variant="goldOutline"
                  onClick={() => onAddExercise(day.id, day.exercises?.length || 0)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface ExerciseRowProps {
  exercise: ClientProgramExercise;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (exerciseId: string, updates: Partial<ClientProgramExercise>) => Promise<boolean>;
  onDelete: (exerciseId: string) => Promise<boolean>;
}

function ExerciseRow({
  exercise,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}: ExerciseRowProps) {
  const [name, setName] = useState(exercise.exercise_name);
  const [sets, setSets] = useState(exercise.sets || "");
  const [reps, setReps] = useState(exercise.reps_or_time || "");
  const [rest, setRest] = useState(exercise.rest || "");
  const [sectionType, setSectionType] = useState(exercise.section_type);
  const [notes, setNotes] = useState(exercise.notes || "");

  const handleSave = async () => {
    await onUpdate(exercise.id, {
      exercise_name: name,
      sets: sets || null,
      reps_or_time: reps || null,
      rest: rest || null,
      section_type: sectionType,
      notes: notes || null,
    });
    onCancelEdit();
  };

  if (isEditing) {
    return (
      <div className="p-3 border border-primary/30 rounded-lg bg-primary/5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Exercise Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Barbell Bench Press"
            />
          </div>
          <div>
            <Label className="text-xs">Section</Label>
            <Select value={sectionType} onValueChange={setSectionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Sets</Label>
            <Input value={sets} onChange={(e) => setSets(e.target.value)} placeholder="3" />
          </div>
          <div>
            <Label className="text-xs">Reps/Time</Label>
            <Input value={reps} onChange={(e) => setReps(e.target.value)} placeholder="8-10" />
          </div>
          <div>
            <Label className="text-xs">Rest</Label>
            <Input value={rest} onChange={(e) => setRest(e.target.value)} placeholder="90s" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Form cues, modifications, etc."
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="gold" onClick={handleSave}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancelEdit}>
            Cancel
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="ml-auto text-crimson">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Exercise?</AlertDialogTitle>
                <AlertDialogDescription>
                  Remove "{exercise.exercise_name}" from this day?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(exercise.id)}
                  className="bg-crimson hover:bg-crimson-dark"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-charcoal cursor-pointer"
      onClick={onEdit}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground" />
      <Dumbbell className="w-4 h-4 text-primary" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{exercise.exercise_name}</span>
          <Badge variant="outline" className="text-xs">
            {SECTION_TYPES.find((t) => t.value === exercise.section_type)?.label || "Main"}
          </Badge>
        </div>
        {(exercise.sets || exercise.reps_or_time) && (
          <p className="text-xs text-muted-foreground">
            {exercise.sets && `${exercise.sets} sets`}
            {exercise.sets && exercise.reps_or_time && " × "}
            {exercise.reps_or_time && `${exercise.reps_or_time}`}
            {exercise.rest && ` • ${exercise.rest} rest`}
          </p>
        )}
      </div>
      <Pencil className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}
