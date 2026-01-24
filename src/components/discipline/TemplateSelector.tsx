import { useState, useEffect } from "react";
import { Loader2, Check, Settings2, Sun, Shield, Cross, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface DisciplineTemplate {
  id: string;
  name: string;
  description: string | null;
  routine_items: any;
  is_active: boolean;
}

interface TemplateSelectorProps {
  currentTemplateId: string | null;
  onTemplateChange: (templateId: string) => void;
}

const TEMPLATE_ICONS: Record<string, any> = {
  "Beginner Block": Sun,
  "5 AM Warrior": Shield,
  "Faith Foundation": Cross,
  "Iron Sharpens Iron": Dumbbell,
};

const TEMPLATE_COLORS: Record<string, string> = {
  "Beginner Block": "from-green-500/20 to-green-500/5 border-green-500/30",
  "5 AM Warrior": "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  "Faith Foundation": "from-purple-500/20 to-purple-500/5 border-purple-500/30",
  "Iron Sharpens Iron": "from-primary/20 to-primary/5 border-primary/30",
};

const TemplateSelector = ({ currentTemplateId, onTemplateChange }: TemplateSelectorProps) => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<DisciplineTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(currentTemplateId);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    setSelectedId(currentTemplateId);
  }, [currentTemplateId]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("discipline_templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at");

      if (error) throw error;
      // Map database fields to interface
      const mapped: DisciplineTemplate[] = (data || []).map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        routine_items: t.routines || [],
        is_active: t.is_active,
      }));
      setTemplates(mapped);
    } catch (e) {
      console.error("Error fetching templates:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async () => {
    if (!user || !selectedId) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ discipline_template_id: selectedId })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      onTemplateChange(selectedId);
      setOpen(false);
      
      const template = templates.find(t => t.id === selectedId);
      toast({
        title: "Template Applied",
        description: `Your discipline routine is now set to "${template?.name}".`,
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to apply template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const currentTemplate = templates.find(t => t.id === currentTemplateId);
  const CurrentIcon = currentTemplate ? TEMPLATE_ICONS[currentTemplate.name] || Settings2 : Settings2;

  return (
    <>
      {/* Current Template Display & Trigger */}
      <Button
        variant="goldOutline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <CurrentIcon className="w-4 h-4" />
        {currentTemplate ? currentTemplate.name : "Choose Discipline Level"}
      </Button>

      {/* Template Selection Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose Your Discipline Level</DialogTitle>
            <DialogDescription>
              Select a routine template that matches your commitment level. You can change this anytime.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No discipline templates available yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 py-4">
              {templates.map((template) => {
                const Icon = TEMPLATE_ICONS[template.name] || Settings2;
                const colorClass = TEMPLATE_COLORS[template.name] || "from-muted/20 to-muted/5 border-border";
                const isSelected = selectedId === template.id;
                const isCurrent = currentTemplateId === template.id;
                const routineCount = Array.isArray(template.routine_items) 
                  ? template.routine_items.length 
                  : 0;

                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedId(template.id)}
                    className={cn(
                      "relative p-4 rounded-lg border text-left transition-all",
                      `bg-gradient-to-br ${colorClass}`,
                      isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      !isSelected && "hover:scale-[1.02]"
                    )}
                  >
                    {isCurrent && (
                      <Badge className="absolute top-2 right-2 bg-primary/20 text-primary border-primary/30 text-xs">
                        Current
                      </Badge>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{template.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.description || "A structured daily routine."}
                        </p>
                        <p className="text-xs text-primary mt-2">
                          {routineCount} daily tasks
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute bottom-2 right-2">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={handleApplyTemplate}
              disabled={!selectedId || selectedId === currentTemplateId || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Applying...
                </>
              ) : (
                "Apply Template"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateSelector;
