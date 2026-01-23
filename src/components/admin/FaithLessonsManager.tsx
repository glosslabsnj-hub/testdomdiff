import { useState } from "react";
import { BookOpen, Edit, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFaithLessons, FaithLesson } from "@/hooks/useFaithLessons";

export default function FaithLessonsManager() {
  const { lessons, loading, updateLesson } = useFaithLessons(false);
  const [editingLesson, setEditingLesson] = useState<FaithLesson | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    big_idea: "",
    scripture: "",
    teaching_content: "",
    action_steps: "",
    reflection_questions: "",
    weekly_challenge: "",
    is_published: false,
  });

  const openEditDialog = (lesson: FaithLesson) => {
    setEditingLesson(lesson);
    setForm({
      title: lesson.title || "",
      big_idea: lesson.big_idea || "",
      scripture: lesson.scripture || "",
      teaching_content: lesson.teaching_content || "",
      action_steps: lesson.action_steps || "",
      reflection_questions: lesson.reflection_questions || "",
      weekly_challenge: lesson.weekly_challenge || "",
      is_published: lesson.is_published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingLesson) return;
    await updateLesson(editingLesson.id, form);
    setDialogOpen(false);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="headline-card">Faith Lessons</h2>
      </div>
      <p className="text-muted-foreground text-sm">Edit weekly faith lessons. Toggle "Published" to make visible to members.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => (
          <Card
            key={lesson.id}
            className="bg-charcoal border-border cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => openEditDialog(lesson)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-display text-lg flex-shrink-0">
                  {lesson.week_number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{lesson.title || `Week ${lesson.week_number} Lesson`}</h3>
                  </div>
                  {lesson.is_published ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                  {lesson.scripture && (
                    <p className="text-xs text-muted-foreground mt-2 truncate">{lesson.scripture}</p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditDialog(lesson); }}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              Week {editingLesson?.week_number} Lesson
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded bg-charcoal">
              <span className="font-medium">Published</span>
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-charcoal border-border" placeholder="e.g., Building Discipline Through Faith" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Big Idea</label>
              <Textarea value={form.big_idea} onChange={(e) => setForm({ ...form, big_idea: e.target.value })} className="bg-charcoal border-border" placeholder="The core takeaway for this week..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Scripture</label>
              <Textarea value={form.scripture} onChange={(e) => setForm({ ...form, scripture: e.target.value })} className="bg-charcoal border-border" placeholder="Philippians 4:13 - I can do all things..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Teaching Content</label>
              <Textarea value={form.teaching_content} onChange={(e) => setForm({ ...form, teaching_content: e.target.value })} className="bg-charcoal border-border min-h-[120px]" placeholder="The main teaching or story..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Action Steps</label>
              <Textarea value={form.action_steps} onChange={(e) => setForm({ ...form, action_steps: e.target.value })} className="bg-charcoal border-border" placeholder="1. Do this&#10;2. Then this&#10;3. Finally this" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Reflection Questions</label>
              <Textarea value={form.reflection_questions} onChange={(e) => setForm({ ...form, reflection_questions: e.target.value })} className="bg-charcoal border-border" placeholder="- What does this mean for your life?&#10;- How will you apply this?" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Weekly Challenge</label>
              <Textarea value={form.weekly_challenge} onChange={(e) => setForm({ ...form, weekly_challenge: e.target.value })} className="bg-charcoal border-border" placeholder="This week, I challenge you to..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={handleSave}>Save Lesson</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
