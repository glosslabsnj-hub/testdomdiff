import { useState, useEffect } from "react";
import {
  Loader2,
  Sparkles,
  Check,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Calendar,
  Target,
  Activity,
  AlertCircle,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useTemplateCategories,
  useProgramTemplates,
  useAssignTemplate,
  useTemplateDetails,
  type ProgramTemplate,
} from "@/hooks/useProgramTemplates";
import { useTemplateSuggestion, getMatchQuality } from "@/hooks/useTemplateSuggestion";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";

interface TemplateAssignmentProps {
  client: ClientWithSubscription;
  onAssigned: () => void;
}

type Mode = "initial" | "selecting-template" | "preview";

export default function TemplateAssignment({ client, onAssigned }: TemplateAssignmentProps) {
  const [mode, setMode] = useState<Mode>("initial");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useTemplateCategories();
  const { recommendedCategory, scoredCategories } = useTemplateSuggestion(categories, client);
  const { data: templates, isLoading: templatesLoading } = useProgramTemplates(selectedCategoryId || undefined);
  const { data: templateDetails, isLoading: previewLoading } = useTemplateDetails(selectedTemplateId);
  const assignTemplate = useAssignTemplate();

  // Auto-select recommended category when available
  useEffect(() => {
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

  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);
  const clientName = client.first_name || "Client";

  const handleContinueWithRecommended = () => {
    if (recommendedCategory) {
      setSelectedCategoryId(recommendedCategory.category.id);
      setMode("selecting-template");
      setShowAllCategories(false);
    }
  };

  const handleSelectDifferentCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedTemplateId(null);
    setMode("selecting-template");
    setShowAllCategories(false);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setMode("preview");
  };

  const handleAssign = async () => {
    if (!selectedTemplateId) return;

    await assignTemplate.mutateAsync({
      clientId: client.user_id,
      templateId: selectedTemplateId,
      suggestedCategoryId: recommendedCategory?.category.id,
      matchScore: recommendedCategory?.score,
      trainingDaysPerWeek: client.training_days_per_week || 4,
    });

    // Reset state and notify parent
    setMode("initial");
    setSelectedTemplateId(null);
    setShowAllCategories(false);
    onAssigned();
  };

  const handleBack = () => {
    if (mode === "preview") {
      setSelectedTemplateId(null);
      setMode("selecting-template");
    } else if (mode === "selecting-template") {
      setMode("initial");
    }
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Client Summary Badges */}
      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="secondary" className="gap-1">
          <Activity className="w-3 h-3" />
          {client.experience || "Unknown Experience"}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Target className="w-3 h-3" />
          {client.goal || "No Goal Set"}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Calendar className="w-3 h-3" />
          {client.training_days_per_week || 3} days/week
        </Badge>
        {client.body_fat_estimate && (
          <Badge variant="secondary" className="gap-1">
            <Dumbbell className="w-3 h-3" />
            {client.body_fat_estimate}
          </Badge>
        )}
      </div>

      {/* Mode: Initial - Show recommendation with action buttons */}
      {mode === "initial" && recommendedCategory && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs uppercase tracking-wide text-primary font-medium">
                    Recommended Category
                  </span>
                </div>
                <h3 className="font-bold text-lg">{recommendedCategory.category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {recommendedCategory.category.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {recommendedCategory.reasons.slice(0, 3).map((reason, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-primary/30">
                      <Check className="w-3 h-3 mr-1 text-primary" />
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

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleContinueWithRecommended}
                className="bg-primary hover:bg-primary/90"
              >
                <Check className="w-4 h-4 mr-2" />
                Continue with This
              </Button>
              <Collapsible open={showAllCategories} onOpenChange={setShowAllCategories}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Select Different
                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAllCategories ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Selector (when "Select Different" is clicked) */}
      {mode === "initial" && showAllCategories && (
        <div className="grid gap-2">
          {scoredCategories.map(({ category, score }) => (
            <button
              key={category.id}
              onClick={() => handleSelectDifferentCategory(category.id)}
            className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
              category.id === recommendedCategory?.category.id
                ? "border-primary/50 bg-primary/10"
                : "border-border hover:border-muted-foreground hover:bg-muted/10"
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
      )}

      {/* Mode: Selecting Template */}
      {mode === "selecting-template" && activeCategory && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-muted-foreground">
              <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
              Back
            </Button>
            <Badge className={matchQuality.color}>{activeCategoryScore}% Match</Badge>
          </div>

          <div>
            <h4 className="font-medium mb-1">Select Template from "{activeCategory.name}"</h4>
            <p className="text-sm text-muted-foreground mb-4">Choose a template to preview before assigning</p>
          </div>

          {templatesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : templates && templates.length > 0 ? (
            <RadioGroup
              value={selectedTemplateId || ""}
              onValueChange={handleTemplateSelect}
              className="space-y-2"
            >
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTemplateId === template.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                  <Label htmlFor={template.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{template.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {template.days_per_week} days
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {template.difficulty}
                      </Badge>
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground">{template.description}</p>
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
            <div className="flex items-center gap-2 text-muted-foreground py-6 justify-center border border-dashed rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>No templates available in this category yet.</span>
            </div>
          )}
        </div>
      )}

      {/* Mode: Preview */}
      {mode === "preview" && selectedTemplate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-muted-foreground">
              <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
              Back to Templates
            </Button>
          </div>

          <Card className="border-primary/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Preview: {selectedTemplate.name}</h4>
              </div>

              {previewLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : templateDetails && templateDetails.weeks.length > 0 ? (
                <div className="space-y-4">
                  {templateDetails.weeks.map((week) => {
                    const weekDays = templateDetails.days.filter(d => d.week_id === week.id);
                    return (
                      <div key={week.id} className="text-sm">
                        <div className="font-medium text-primary mb-2">
                          Week {week.week_number}{week.title ? `: ${week.title}` : ""}
                        </div>
                        <div className="pl-4 space-y-1">
                          {weekDays.map((day) => {
                            const exerciseCount = templateDetails.exercises.filter(
                              e => e.day_id === day.id
                            ).length;
                            return (
                              <div
                                key={day.id}
                                className="flex items-center gap-2 text-muted-foreground"
                              >
                                <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                                <span className="w-20">{day.day_of_week}:</span>
                                {day.is_rest_day ? (
                                  <span className="flex items-center gap-1">
                                    <Moon className="w-3 h-3" /> Rest Day
                                  </span>
                                ) : (
                                  <span>
                                    {day.workout_name}
                                    <span className="text-xs ml-2">({exerciseCount} exercises)</span>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Auto-generated 4-week program</span>
                  </p>
                  <p>
                    Based on {clientName}'s {client.training_days_per_week || 4} training days/week, 
                    the system will create a structured program with:
                  </p>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    <li>4 progressive weeks</li>
                    <li>{client.training_days_per_week || 4} workout days per week</li>
                    <li>{7 - (client.training_days_per_week || 4)} rest days per week</li>
                    <li>Placeholder workouts ready for customization</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assign Button */}
          <Button
            onClick={handleAssign}
            disabled={assignTemplate.isPending}
            className="w-full"
            size="lg"
          >
            {assignTemplate.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning to {clientName}...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Assign "{selectedTemplate.name}" to {clientName}
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            This will replace any existing program and sync to their dashboard
          </p>
        </div>
      )}
    </div>
  );
}
