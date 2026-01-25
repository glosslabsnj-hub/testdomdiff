import { useState } from "react";
import { format } from "date-fns";
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCoachingGoals } from "@/hooks/useCoachingGoals";
import { useCoachingActionItems } from "@/hooks/useCoachingActionItems";

interface ClientGoalsTabProps {
  clientId: string;
}

export default function ClientGoalsTab({ clientId }: ClientGoalsTabProps) {
  const { goals, loading: goalsLoading, createGoal, updateProgress, completeGoal, deleteGoal } =
    useCoachingGoals(clientId);
  const {
    actionItems,
    loading: itemsLoading,
    createActionItem,
    toggleComplete,
    deleteActionItem,
    getPendingItems,
    getOverdueItems,
  } = useCoachingActionItems(clientId);

  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);

  // Goal form state
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalTargetDate, setGoalTargetDate] = useState("");

  // Action item form state
  const [actionTitle, setActionTitle] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [actionDueDate, setActionDueDate] = useState("");
  const [actionPriority, setActionPriority] = useState("medium");

  const handleCreateGoal = async () => {
    if (!goalTitle) return;
    await createGoal({
      client_id: clientId,
      title: goalTitle,
      description: goalDescription || undefined,
      target_date: goalTargetDate || undefined,
    });
    setGoalDialogOpen(false);
    setGoalTitle("");
    setGoalDescription("");
    setGoalTargetDate("");
  };

  const handleCreateAction = async () => {
    if (!actionTitle) return;
    await createActionItem({
      client_id: clientId,
      title: actionTitle,
      description: actionDescription || undefined,
      due_date: actionDueDate || undefined,
      priority: actionPriority,
    });
    setActionDialogOpen(false);
    setActionTitle("");
    setActionDescription("");
    setActionDueDate("");
    setActionPriority("medium");
  };

  const pendingItems = getPendingItems();
  const overdueItems = getOverdueItems();
  const activeGoals = goals.filter((g) => g.status === "active");

  if (goalsLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Goals Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Goals
          </h3>
          <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Goal Title</Label>
                  <Input
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g., Lose 20 lbs"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    placeholder="Details about this goal..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Target Date (optional)</Label>
                  <Input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleCreateGoal} className="w-full" variant="gold">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {activeGoals.length > 0 ? (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <Card key={goal.id} className="bg-background/50 border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>
                      )}
                      {goal.target_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Target: {format(new Date(goal.target_date), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => completeGoal(goal.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{goal.progress_pct}%</span>
                    </div>
                    <Slider
                      value={[goal.progress_pct]}
                      max={100}
                      step={5}
                      onValueChange={(value) => updateProgress(goal.id, value[0])}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No active goals</p>
        )}
      </div>

      {/* Action Items Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Action Items
            {overdueItems.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {overdueItems.length} overdue
              </Badge>
            )}
          </h3>
          <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Action Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Task Title</Label>
                  <Input
                    value={actionTitle}
                    onChange={(e) => setActionTitle(e.target.value)}
                    placeholder="e.g., Increase protein to 180g/day"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={actionDescription}
                    onChange={(e) => setActionDescription(e.target.value)}
                    placeholder="Additional details..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={actionDueDate}
                      onChange={(e) => setActionDueDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={actionPriority} onValueChange={setActionPriority}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreateAction} className="w-full" variant="gold">
                  Assign Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {pendingItems.length > 0 ? (
          <div className="space-y-2">
            {pendingItems.map((item) => {
              const isOverdue =
                item.due_date && new Date(item.due_date) < new Date() && !item.completed_at;

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    isOverdue
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-background/50 border-border"
                  }`}
                >
                  <Checkbox
                    checked={!!item.completed_at}
                    onCheckedChange={() => toggleComplete(item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.title}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          item.priority === "high"
                            ? "border-red-400 text-red-400"
                            : item.priority === "low"
                            ? "border-muted-foreground"
                            : ""
                        }`}
                      >
                        {item.priority}
                      </Badge>
                      {isOverdue && (
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                    {item.due_date && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Due: {format(new Date(item.due_date), "MMM d")}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => deleteActionItem(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
        )}
      </div>
    </div>
  );
}
