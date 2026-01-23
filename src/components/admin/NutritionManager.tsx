import { useState } from "react";
import { Utensils, ShoppingCart, FileText, Plus, Edit, Trash2, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNutritionGuidelines, NutritionGuideline } from "@/hooks/useNutritionContent";

const CONTENT_TYPES = [
  { value: "meal_structure", label: "Meal Structure", icon: Utensils, description: "Daily meal templates with macros" },
  { value: "grocery_list", label: "Grocery List", icon: ShoppingCart, description: "Shopping list items by category" },
  { value: "rule", label: "Nutrition Rule", icon: FileText, description: "Simple nutrition guidelines" },
] as const;

export default function NutritionManager() {
  const { guidelines, loading, createGuideline, updateGuideline, deleteGuideline } = useNutritionGuidelines();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState<NutritionGuideline | null>(null);
  const [form, setForm] = useState({
    content_type: "meal_structure" as "meal_structure" | "grocery_list" | "rule" | "template",
    title: "",
    content: {} as Record<string, any>,
    display_order: 0,
    is_active: true,
  });
  
  // For grocery list items
  const [listItems, setListItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  
  // For meal structure
  const [mealContent, setMealContent] = useState({ protein: "", carbs: "", fats: "", calories: "" });

  const openDialog = (guideline?: NutritionGuideline) => {
    if (guideline) {
      setEditingGuideline(guideline);
      setForm({
        content_type: guideline.content_type,
        title: guideline.title,
        content: guideline.content as Record<string, any>,
        display_order: guideline.display_order,
        is_active: guideline.is_active,
      });
      
      // Parse content based on type
      if (guideline.content_type === "grocery_list") {
        const content = guideline.content as any;
        setListItems(Array.isArray(content) ? content : content?.items || []);
      } else if (guideline.content_type === "meal_structure") {
        const content = guideline.content as any;
        setMealContent({
          protein: content?.protein || "",
          carbs: content?.carbs || "",
          fats: content?.fats || "",
          calories: content?.calories || "",
        });
      }
    } else {
      setEditingGuideline(null);
      setForm({
        content_type: "meal_structure",
        title: "",
        content: {},
        display_order: guidelines.length,
        is_active: true,
      });
      setListItems([]);
      setMealContent({ protein: "", carbs: "", fats: "", calories: "" });
    }
    setDialogOpen(true);
  };

  const addListItem = () => {
    if (newItem.trim()) {
      setListItems([...listItems, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeListItem = (index: number) => {
    setListItems(listItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;

    let content: any = {};
    if (form.content_type === "grocery_list") {
      content = { items: listItems };
    } else if (form.content_type === "meal_structure") {
      content = mealContent;
    } else if (form.content_type === "rule") {
      content = { text: form.title };
    }

    const payload = {
      ...form,
      content,
    };

    if (editingGuideline) {
      await updateGuideline(editingGuideline.id, payload);
    } else {
      await createGuideline(payload);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this nutrition guideline?")) {
      await deleteGuideline(id);
    }
  };

  const toggleActive = async (guideline: NutritionGuideline) => {
    await updateGuideline(guideline.id, { is_active: !guideline.is_active });
  };

  const getIcon = (type: string) => {
    const found = CONTENT_TYPES.find(t => t.value === type);
    return found?.icon || FileText;
  };

  const mealStructures = guidelines.filter(g => g.content_type === "meal_structure");
  const groceryLists = guidelines.filter(g => g.content_type === "grocery_list");
  const rules = guidelines.filter(g => g.content_type === "rule");

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="headline-card">Nutrition Guidelines</h2>
        <Button variant="gold" onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Guideline
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">Manage meal templates, grocery lists, and nutrition rules for members.</p>

      {/* Meal Structures */}
      <Card className="bg-charcoal border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Utensils className="h-5 w-5 text-primary" />
            Meal Structures
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mealStructures.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No meal structures yet. Add meals like "Breakfast", "Lunch", "Dinner".</p>
          ) : (
            <div className="space-y-2">
              {mealStructures.map((item) => {
                const content = item.content as any;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded bg-background border border-border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.title}</span>
                        {!item.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {content?.protein && `Protein: ${content.protein}`}
                        {content?.carbs && ` • Carbs: ${content.carbs}`}
                        {content?.fats && ` • Fats: ${content.fats}`}
                      </p>
                    </div>
                    <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} />
                    <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grocery Lists */}
      <Card className="bg-charcoal border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Grocery Lists
          </CardTitle>
        </CardHeader>
        <CardContent>
          {groceryLists.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No grocery lists yet. Add categories like "Proteins", "Vegetables", "Carbs".</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {groceryLists.map((item) => {
                const content = item.content as any;
                const items = Array.isArray(content) ? content : content?.items || [];
                return (
                  <div key={item.id} className="p-4 rounded bg-background border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">{item.title}</span>
                        {!item.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} />
                        <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {items.slice(0, 3).join(", ")}
                      {items.length > 3 && ` +${items.length - 3} more`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutrition Rules */}
      <Card className="bg-charcoal border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Nutrition Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No rules yet. Add simple guidelines like "Drink 1 gallon of water daily".</p>
          ) : (
            <div className="space-y-2">
              {rules.map((rule, index) => (
                <div key={rule.id} className="flex items-center gap-3 p-3 rounded bg-background border border-border">
                  <span className="text-primary font-bold w-6">{index + 1}.</span>
                  <span className="flex-1">{rule.title}</span>
                  {!rule.is_active && <Badge variant="secondary">Inactive</Badge>}
                  <Switch checked={rule.is_active} onCheckedChange={() => toggleActive(rule)} />
                  <Button variant="ghost" size="icon" onClick={() => openDialog(rule)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingGuideline ? "Edit Guideline" : "Add Guideline"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <Select 
                value={form.content_type} 
                onValueChange={(v: any) => {
                  setForm({ ...form, content_type: v });
                  setListItems([]);
                  setMealContent({ protein: "", carbs: "", fats: "", calories: "" });
                }}
                disabled={!!editingGuideline}
              >
                <SelectTrigger className="bg-charcoal border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2">
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {CONTENT_TYPES.find(t => t.value === form.content_type)?.description}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                {form.content_type === "rule" ? "Rule Text" : "Title"}
              </label>
              <Input 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                className="bg-charcoal border-border" 
                placeholder={
                  form.content_type === "meal_structure" ? "e.g., Breakfast" :
                  form.content_type === "grocery_list" ? "e.g., Proteins" :
                  "e.g., Drink 1 gallon of water daily"
                }
              />
            </div>

            {/* Meal Structure Fields */}
            {form.content_type === "meal_structure" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Protein</label>
                  <Input 
                    value={mealContent.protein} 
                    onChange={(e) => setMealContent({ ...mealContent, protein: e.target.value })} 
                    className="bg-charcoal border-border" 
                    placeholder="e.g., 30-40g"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Carbs</label>
                  <Input 
                    value={mealContent.carbs} 
                    onChange={(e) => setMealContent({ ...mealContent, carbs: e.target.value })} 
                    className="bg-charcoal border-border" 
                    placeholder="e.g., 40-50g"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Fats</label>
                  <Input 
                    value={mealContent.fats} 
                    onChange={(e) => setMealContent({ ...mealContent, fats: e.target.value })} 
                    className="bg-charcoal border-border" 
                    placeholder="e.g., 10-15g"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Calories (optional)</label>
                  <Input 
                    value={mealContent.calories} 
                    onChange={(e) => setMealContent({ ...mealContent, calories: e.target.value })} 
                    className="bg-charcoal border-border" 
                    placeholder="e.g., 400-500"
                  />
                </div>
              </div>
            )}

            {/* Grocery List Fields */}
            {form.content_type === "grocery_list" && (
              <div className="space-y-3">
                <label className="text-sm font-medium block">Items</label>
                <div className="flex gap-2">
                  <Input 
                    value={newItem} 
                    onChange={(e) => setNewItem(e.target.value)} 
                    className="bg-charcoal border-border" 
                    placeholder="e.g., Chicken breast"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addListItem())}
                  />
                  <Button type="button" variant="outline" onClick={addListItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {listItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-charcoal rounded border border-border max-h-32 overflow-y-auto">
                    {listItems.map((item, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {item}
                        <button onClick={() => removeListItem(index)} className="ml-1 hover:text-destructive">
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded bg-charcoal">
              <span className="font-medium">Active</span>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
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
