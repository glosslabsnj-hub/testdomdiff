import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2, GripVertical, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SubStep {
  id: string;
  template_id: string;
  routine_index: number;
  step_order: number;
  action_text: string;
  duration_seconds: number | null;
}

interface RoutineSubStepsEditorProps {
  templateId: string;
  routineIndex: number;
  routineName: string;
}

export default function RoutineSubStepsEditor({
  templateId,
  routineIndex,
  routineName,
}: RoutineSubStepsEditorProps) {
  const { toast } = useToast();
  const [subSteps, setSubSteps] = useState<SubStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStepText, setNewStepText] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchSubSteps = async () => {
    try {
      const { data, error } = await supabase
        .from("routine_substeps")
        .select("*")
        .eq("template_id", templateId)
        .eq("routine_index", routineIndex)
        .order("step_order");

      if (error) throw error;
      setSubSteps(data || []);
    } catch (e: any) {
      console.error("Error fetching sub-steps:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubSteps();
  }, [templateId, routineIndex]);

  const handleAdd = async () => {
    if (!newStepText.trim()) return;
    setAdding(true);
    
    const maxOrder = subSteps.length > 0 
      ? Math.max(...subSteps.map(s => s.step_order)) 
      : -1;

    try {
      const { error } = await supabase
        .from("routine_substeps")
        .insert({
          template_id: templateId,
          routine_index: routineIndex,
          step_order: maxOrder + 1,
          action_text: newStepText.trim(),
        });

      if (error) throw error;
      setNewStepText("");
      await fetchSubSteps();
      toast({ title: "Step added" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (id: string, newText: string) => {
    try {
      const { error } = await supabase
        .from("routine_substeps")
        .update({ action_text: newText })
        .eq("id", id);

      if (error) throw error;
      await fetchSubSteps();
      toast({ title: "Step updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this step?")) return;
    
    try {
      const { error } = await supabase
        .from("routine_substeps")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchSubSteps();
      toast({ title: "Step deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleMoveUp = async (step: SubStep, index: number) => {
    if (index === 0) return;
    const prevStep = subSteps[index - 1];
    
    try {
      await supabase
        .from("routine_substeps")
        .update({ step_order: prevStep.step_order })
        .eq("id", step.id);
      
      await supabase
        .from("routine_substeps")
        .update({ step_order: step.step_order })
        .eq("id", prevStep.id);
      
      await fetchSubSteps();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleMoveDown = async (step: SubStep, index: number) => {
    if (index >= subSteps.length - 1) return;
    const nextStep = subSteps[index + 1];
    
    try {
      await supabase
        .from("routine_substeps")
        .update({ step_order: nextStep.step_order })
        .eq("id", step.id);
      
      await supabase
        .from("routine_substeps")
        .update({ step_order: step.step_order })
        .eq("id", nextStep.id);
      
      await fetchSubSteps();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="bg-charcoal/50 border-border/50">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="text-primary">#{routineIndex + 1}</span>
          {routineName}
          <span className="ml-auto text-xs text-muted-foreground">
            {subSteps.length} steps
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-2">
        {/* Existing sub-steps */}
        {subSteps.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            No sub-steps defined. Add some below.
          </p>
        ) : (
          <div className="space-y-1">
            {subSteps.map((step, index) => (
              <SubStepRow
                key={step.id}
                step={step}
                index={index}
                totalCount={subSteps.length}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onMoveUp={() => handleMoveUp(step, index)}
                onMoveDown={() => handleMoveDown(step, index)}
              />
            ))}
          </div>
        )}

        {/* Add new step */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
          <Input
            value={newStepText}
            onChange={(e) => setNewStepText(e.target.value)}
            placeholder="Add a step..."
            className="flex-1 h-8 text-sm bg-background"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
          <Button
            size="sm"
            variant="gold"
            onClick={handleAdd}
            disabled={adding || !newStepText.trim()}
            className="h-8 px-3"
          >
            {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Individual sub-step row with inline editing
function SubStepRow({
  step,
  index,
  totalCount,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  step: SubStep;
  index: number;
  totalCount: number;
  onUpdate: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(step.action_text);

  const handleSave = async () => {
    if (!editText.trim()) return;
    await onUpdate(step.id, editText.trim());
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-2 bg-background rounded border border-primary/30">
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="flex-1 h-7 text-sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
        />
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSave}>
          <Save className="h-3 w-3 text-primary" />
        </Button>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsEditing(false)}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 p-2 bg-background rounded border border-border hover:border-primary/30 transition-colors">
      {/* Reorder buttons */}
      <div className="flex flex-col gap-0.5">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="text-muted-foreground hover:text-primary disabled:opacity-30"
        >
          <GripVertical className="h-2.5 w-2.5 rotate-90" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index >= totalCount - 1}
          className="text-muted-foreground hover:text-primary disabled:opacity-30"
        >
          <GripVertical className="h-2.5 w-2.5 -rotate-90" />
        </button>
      </div>

      {/* Step number */}
      <span className="text-xs text-primary font-mono w-4">{index + 1}.</span>

      {/* Text */}
      <span
        className="flex-1 text-sm cursor-pointer hover:text-primary transition-colors"
        onClick={() => {
          setEditText(step.action_text);
          setIsEditing(true);
        }}
      >
        {step.action_text}
      </span>

      {/* Delete button */}
      <button
        onClick={() => onDelete(step.id)}
        className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

