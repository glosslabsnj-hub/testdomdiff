import { useState, useMemo } from "react";
import {
  Loader2,
  Sparkles,
  Check,
  ChevronDown,
  Dumbbell,
  Calendar,
  Target,
  Activity,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useTemplateCategories,
  useProgramTemplates,
  useAssignTemplate,
  type ProgramTemplate,
} from "@/hooks/useProgramTemplates";
import { useTemplateSuggestion, getMatchQuality } from "@/hooks/useTemplateSuggestion";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";

interface TemplateAssignmentProps {
  client: ClientWithSubscription;
  onAssigned: () => void;
}

export default function TemplateAssignment({ client, onAssigned }: TemplateAssignmentProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useTemplateCategories();
  const { recommendedCategory, scoredCategories } = useTemplateSuggestion(categories, client);
  const { data: templates, isLoading: templatesLoading } = useProgramTemplates(
    selectedCategoryId || recommendedCategory?.category.id
  );
  const assignTemplate = useAssignTemplate();

  // Auto-select recommended category on first load
  useMemo(() => {
    if (recommendedCategory && !selectedCategoryId) {
      setSelectedCategoryId(recommendedCategory.category.id);
    }
  }, [recommendedCategory, selectedCategoryId]);

  const activeCategory = selectedCategoryId
    ? categories?.find((c) => c.id === selectedCategoryId)
    : recommendedCategory?.category;

  const activeCategoryScore = selectedCategoryId
    ? scoredCategories.find((s) => s.category.id === selectedCategoryId)?.score || 0
    : recommendedCategory?.score || 0;

  const matchQuality = getMatchQuality(activeCategoryScore);

  const handleAssign = async () => {
    if (!selectedTemplateId) return;

    await assignTemplate.mutateAsync({
      clientId: client.user_id,
      templateId: selectedTemplateId,
      suggestedCategoryId: recommendedCategory?.category.id,
      matchScore: recommendedCategory?.score,
    });

    onAssigned();
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Summary for Context */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Experience:</span>
              <Badge variant="secondary">{client.experience || "Not specified"}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Goal:</span>
              <Badge variant="secondary">{client.goal || "Not specified"}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Days:</span>
              <Badge variant="secondary">{client.training_days_per_week || 3} days/week</Badge>
            </div>
            {client.body_fat_estimate && (
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Body:</span>
                <Badge variant="secondary">{client.body_fat_estimate}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Category */}
      {recommendedCategory && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Recommended Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">{recommendedCategory.category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {recommendedCategory.category.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {recommendedCategory.reasons.slice(0, 3).map((reason, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{recommendedCategory.score}%</div>
                <div className={`text-xs ${matchQuality.color}`}>{matchQuality.label}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Override */}
      <Collapsible open={showAllCategories} onOpenChange={setShowAllCategories}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            <span>Or select a different category</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showAllCategories ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="grid grid-cols-1 gap-2">
            {scoredCategories.map(({ category, score }) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategoryId(category.id);
                  setSelectedTemplateId(null);
                  setShowAllCategories(false);
                }}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                  selectedCategoryId === category.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{category.target_profile}</div>
                </div>
                <Badge variant={score >= 70 ? "default" : "secondary"}>{score}%</Badge>
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Template Selection */}
      {activeCategory && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                Select Template from "{activeCategory.name}"
              </span>
              <Badge className={matchQuality.color}>{activeCategoryScore}% Match</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : templates && templates.length > 0 ? (
              <RadioGroup
                value={selectedTemplateId || ""}
                onValueChange={setSelectedTemplateId}
                className="space-y-2"
              >
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplateId === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                    onClick={() => setSelectedTemplateId(template.id)}
                  >
                    <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                    <Label htmlFor={template.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{template.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {template.days_per_week} days
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {template.difficulty}
                        </Badge>
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
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
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <AlertCircle className="w-4 h-4" />
                <span>No templates available in this category yet.</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assign Button */}
      <Button
        onClick={handleAssign}
        disabled={!selectedTemplateId || assignTemplate.isPending}
        className="w-full"
        size="lg"
      >
        {assignTemplate.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Assigning Template...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Assign Selected Template
          </>
        )}
      </Button>
    </div>
  );
}
