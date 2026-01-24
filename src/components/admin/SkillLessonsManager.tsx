import { useState } from "react";
import { Briefcase, Plus, Edit, Trash2, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSkillLessons, SkillLesson } from "@/hooks/useSkillLessons";

export default function SkillLessonsManager() {
  const { lessons, loading, createLesson, updateLesson, deleteLesson } = useSkillLessons(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<SkillLesson | null>(null);
  const [form, setForm] = useState({
    week_number: 1,
    title: "",
    description: "",
    video_url: "",
    content: "",
    action_steps: "",
    is_published: false,
    is_advanced: false,
    display_order: 0,
  });

  const openDialog = (lesson?: SkillLesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setForm({
        week_number: lesson.week_number,
        title: lesson.title,
        description: lesson.description || "",
        video_url: lesson.video_url || "",
        content: lesson.content || "",
        action_steps: lesson.action_steps || "",
        is_published: lesson.is_published,
        is_advanced: lesson.is_advanced,
        display_order: lesson.display_order,
      });
    } else {
      setEditingLesson(null);
      setForm({
        week_number: lessons.length + 1,
        title: "",
        description: "",
        video_url: "",
        content: "",
        action_steps: "",
        is_published: false,
        is_advanced: false,
        display_order: lessons.length,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;

    if (editingLesson) {
      await updateLesson(editingLesson.id, { ...form, resources: [] });
    } else {
      await createLesson({ ...form, resources: [] });
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    await deleteLesson(id);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const regularLessons = lessons.filter((l) => !l.is_advanced);
  const advancedLessons = lessons.filter((l) => l.is_advanced);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Skill-Building Lessons</h3>
          <p className="text-sm text-muted-foreground">
            Manage money-making skill content for transformation and coaching members
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Add Lesson
        </Button>
      </div>

      {/* Regular Lessons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="w-4 h-4 text-primary" />
            Standard Lessons (Transformation+)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {regularLessons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No standard lessons yet
            </p>
          ) : (
            <div className="space-y-2">
              {regularLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-3 rounded bg-charcoal border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {lesson.week_number}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">Week {lesson.week_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={lesson.is_published ? "default" : "secondary"}>
                      {lesson.is_published ? "Published" : "Draft"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => openDialog(lesson)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(lesson.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Lessons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="w-4 h-4 text-amber-500" />
            Advanced Lessons (Coaching Only)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {advancedLessons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No advanced lessons yet
            </p>
          ) : (
            <div className="space-y-2">
              {advancedLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-3 rounded bg-charcoal border border-amber-500/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-amber-500 text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {lesson.week_number}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">Week {lesson.week_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      Advanced
                    </Badge>
                    <Badge variant={lesson.is_published ? "default" : "secondary"}>
                      {lesson.is_published ? "Published" : "Draft"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => openDialog(lesson)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(lesson.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="week_number">Week Number</Label>
                <Input
                  id="week_number"
                  type="number"
                  min={1}
                  value={form.week_number}
                  onChange={(e) => setForm({ ...form, week_number: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Starting a Side Hustle"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief overview of the lesson"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="video_url">Video URL (YouTube/Vimeo embed)</Label>
              <Input
                id="video_url"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>

            <div>
              <Label htmlFor="content">Lesson Content</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Main teaching content"
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="action_steps">Action Steps</Label>
              <Textarea
                id="action_steps"
                value={form.action_steps}
                onChange={(e) => setForm({ ...form, action_steps: e.target.value })}
                placeholder="What should they do after this lesson?"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_advanced"
                  checked={form.is_advanced}
                  onCheckedChange={(v) => setForm({ ...form, is_advanced: v })}
                />
                <Label htmlFor="is_advanced">Coaching Only (Advanced)</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_published"
                  checked={form.is_published}
                  onCheckedChange={(v) => setForm({ ...form, is_published: v })}
                />
                <Label htmlFor="is_published">Published</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleSave} disabled={!form.title.trim()}>
              {editingLesson ? "Save Changes" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
