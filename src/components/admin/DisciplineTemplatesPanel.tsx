import { useState } from "react";
import { FileText, Plus, Check, Loader2, Edit, Trash2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useDisciplineTemplates, DisciplineTemplate, RoutineItem } from "@/hooks/useDisciplineTemplates";
import { useDisciplineRoutines } from "@/hooks/useDisciplineRoutines";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  general: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
  military: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  faith_focused: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const categoryLabels: Record<string, string> = {
  general: "General",
  beginner: "Beginner",
  advanced: "Advanced",
  military: "Military Style",
  faith_focused: "Faith Focused",
};

interface DisciplineTemplatesPanelProps {
  onApplyTemplate: (routines: RoutineItem[]) => Promise<void>;
}

export default function DisciplineTemplatesPanel({ onApplyTemplate }: DisciplineTemplatesPanelProps) {
  const { templates, loading } = useDisciplineTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DisciplineTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  const handlePreview = (template: DisciplineTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleApply = async () => {
    if (!selectedTemplate) return;
    setApplying(true);
    await onApplyTemplate(selectedTemplate.routines);
    setApplying(false);
    setPreviewOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg">Quick Templates</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Apply a preset routine template or use as inspiration. Applying a template will replace all current routines.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {templates.filter(t => t.is_active).map((template) => {
          const morningCount = template.routines.filter(r => r.routine_type === "morning").length;
          const eveningCount = template.routines.filter(r => r.routine_type === "evening").length;

          return (
            <Card
              key={template.id}
              className="bg-charcoal border-border hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handlePreview(template)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  <Badge className={cn("text-xs", categoryColors[template.category])}>
                    {categoryLabels[template.category]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Sun className="h-4 w-4" />
                    <span>{morningCount} morning</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-400">
                    <Moon className="h-4 w-4" />
                    <span>{eveningCount} evening</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview & Apply Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate?.name}
              {selectedTemplate && (
                <Badge className={cn("text-xs", categoryColors[selectedTemplate.category])}>
                  {categoryLabels[selectedTemplate.category]}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Morning Routines */}
                <div className="bg-charcoal rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="h-4 w-4 text-amber-400" />
                    <span className="font-semibold text-amber-400">Morning</span>
                  </div>
                  <div className="space-y-2">
                    {selectedTemplate.routines
                      .filter(r => r.routine_type === "morning")
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((routine, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-background rounded">
                          <span className="text-primary font-mono text-xs w-16">{routine.time_slot}</span>
                          <span className="flex-1">{routine.action_text}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Evening Routines */}
                <div className="bg-charcoal rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Moon className="h-4 w-4 text-blue-400" />
                    <span className="font-semibold text-blue-400">Evening</span>
                  </div>
                  <div className="space-y-2">
                    {selectedTemplate.routines
                      .filter(r => r.routine_type === "evening")
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((routine, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-background rounded">
                          <span className="text-primary font-mono text-xs w-16">{routine.time_slot}</span>
                          <span className="flex-1">{routine.action_text}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <p className="text-amber-400 text-sm">
                  ⚠️ Applying this template will <strong>replace all current routines</strong> with these items.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)} disabled={applying}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleApply} disabled={applying}>
              {applying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Apply Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
