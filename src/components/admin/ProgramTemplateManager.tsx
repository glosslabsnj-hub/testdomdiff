import { useState } from "react";
import {
  Plus,
  Library,
  Loader2,
  ChevronRight,
  Dumbbell,
  Calendar,
  Users,
  Settings,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useTemplateCategories,
  useProgramTemplates,
  useCreateTemplate,
  type ProgramTemplate,
  type TemplateCategory,
} from "@/hooks/useProgramTemplates";

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const EQUIPMENT_OPTIONS = [
  "bodyweight",
  "dumbbells",
  "barbell",
  "pull-up bar",
  "resistance bands",
  "full gym",
];

export default function ProgramTemplateManager() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    difficulty: "intermediate",
    days_per_week: 4,
    equipment: [] as string[],
    goal_focus: "",
  });

  const { data: categories, isLoading: categoriesLoading } = useTemplateCategories();
  const { data: allTemplates, isLoading: templatesLoading } = useProgramTemplates();
  const createTemplate = useCreateTemplate();

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !selectedCategoryId) return;

    await createTemplate.mutateAsync({
      ...newTemplate,
      category_id: selectedCategoryId,
      display_order: 0,
      is_active: true,
    });

    setIsCreateDialogOpen(false);
    setNewTemplate({
      name: "",
      description: "",
      difficulty: "intermediate",
      days_per_week: 4,
      equipment: [],
      goal_focus: "",
    });
  };

  const toggleEquipment = (item: string) => {
    setNewTemplate((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter((e) => e !== item)
        : [...prev.equipment, item],
    }));
  };

  const getTemplatesForCategory = (categoryId: string) => {
    return allTemplates?.filter((t) => t.category_id === categoryId) || [];
  };

  if (categoriesLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Library className="w-6 h-6 text-primary" />
            Free World Templates
          </h2>
          <p className="text-muted-foreground mt-1">
            50 pre-built 4-week workout templates organized by experience level
          </p>
        </div>
        <Button 
          variant="gold" 
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={!selectedCategoryId}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories?.map((category) => {
          const count = getTemplatesForCategory(category.id).length;
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all ${
                selectedCategoryId === category.id
                  ? "ring-2 ring-primary bg-primary/10"
                  : "hover:border-muted-foreground"
              }`}
              onClick={() => setSelectedCategoryId(category.id)}
            >
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary">{count}</div>
                <div className="text-sm font-medium truncate">{category.name}</div>
                <div className="text-xs text-muted-foreground">templates</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Accordion */}
      <Accordion type="single" collapsible className="space-y-2">
        {categories?.map((category) => {
          const templates = getTemplatesForCategory(category.id);
          return (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border rounded-lg bg-charcoal px-4"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{category.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.target_profile} • {templates.length} templates
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="pl-13 space-y-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>

                  {templates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Library className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No templates in this category yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setSelectedCategoryId(category.id);
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Template
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {templates.map((template) => (
                        <Card key={template.id} className="bg-background/50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{template.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {template.days_per_week} days
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs capitalize">
                                    {template.difficulty}
                                  </Badge>
                                </div>
                                {template.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {template.description}
                                  </p>
                                )}
                                {template.equipment && template.equipment.length > 0 && (
                                  <div className="flex gap-1 mt-2">
                                    {template.equipment.map((eq) => (
                                      <Badge key={eq} variant="outline" className="text-xs">
                                        {eq}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Category</Label>
              <Select
                value={selectedCategoryId || ""}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Template Name</Label>
              <Input
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g., Total Body Foundations"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newTemplate.description}
                onChange={(e) =>
                  setNewTemplate((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Brief description of this template..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Difficulty</Label>
                <Select
                  value={newTemplate.difficulty}
                  onValueChange={(v) =>
                    setNewTemplate((p) => ({ ...p, difficulty: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Days Per Week</Label>
                <Select
                  value={String(newTemplate.days_per_week)}
                  onValueChange={(v) =>
                    setNewTemplate((p) => ({ ...p, days_per_week: parseInt(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Equipment Required</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <Badge
                    key={eq}
                    variant={newTemplate.equipment.includes(eq) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleEquipment(eq)}
                  >
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Goal Focus</Label>
              <Input
                value={newTemplate.goal_focus}
                onChange={(e) =>
                  setNewTemplate((p) => ({ ...p, goal_focus: e.target.value }))
                }
                placeholder="e.g., fat_loss, muscle_building, strength"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={handleCreateTemplate}
              disabled={!newTemplate.name || !selectedCategoryId || createTemplate.isPending}
            >
              {createTemplate.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
