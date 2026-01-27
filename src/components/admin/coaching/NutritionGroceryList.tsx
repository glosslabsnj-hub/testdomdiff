import { useMemo, useState } from "react";
import { ShoppingCart, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import type { NutritionMealPlanMeal, NutritionMealPlanDay } from "@/hooks/useNutritionTemplates";

interface Ingredient {
  item: string;
  amount: string;
  notes?: string;
}

interface NutritionGroceryListProps {
  weekNumber: number;
  days: Array<{ id: string; day_name: string; day_number: number }>;
  meals: NutritionMealPlanMeal[];
}

// Category keywords for ingredient classification
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Proteins: ["chicken", "beef", "turkey", "salmon", "fish", "pork", "eggs", "egg", "shrimp", "tuna", "tilapia", "cod", "steak", "ground", "bacon", "sausage", "tofu", "tempeh"],
  Vegetables: ["broccoli", "spinach", "pepper", "peppers", "asparagus", "zucchini", "onion", "garlic", "tomato", "tomatoes", "lettuce", "kale", "carrots", "carrot", "celery", "cucumber", "mushroom", "mushrooms", "cabbage", "cauliflower", "green beans", "peas", "corn", "avocado", "sweet potato", "potato"],
  Fruits: ["apple", "banana", "orange", "berries", "strawberries", "blueberries", "mango", "pineapple", "grapes", "lemon", "lime", "watermelon", "peach", "pear"],
  Grains: ["rice", "quinoa", "bread", "oats", "oatmeal", "pasta", "noodles", "tortilla", "wrap", "cereal", "flour", "bagel", "english muffin"],
  Dairy: ["milk", "cheese", "yogurt", "cottage cheese", "cream", "butter", "sour cream", "mozzarella", "cheddar", "feta", "parmesan", "greek yogurt"],
  Pantry: ["oil", "olive oil", "salt", "pepper", "spices", "sauce", "honey", "maple syrup", "peanut butter", "almond butter", "almonds", "nuts", "seeds", "protein powder", "soy sauce", "vinegar", "mustard", "mayo", "dressing"],
};

function categorizeIngredient(item: string): string {
  const lower = item.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return category;
    }
  }
  return "Other";
}

interface AggregatedIngredient {
  item: string;
  amounts: string[];
  category: string;
}

export default function NutritionGroceryList({ weekNumber, days, meals }: NutritionGroceryListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter meals for this week's days
  const weekDayIds = new Set(days.map((d) => d.id));
  const weekMeals = meals.filter((m) => weekDayIds.has(m.day_id));

  // Aggregate ingredients
  const groceryList = useMemo(() => {
    const ingredientMap = new Map<string, AggregatedIngredient>();

    weekMeals.forEach((meal) => {
      const ingredients = (meal as NutritionMealPlanMeal & { ingredients?: Ingredient[] | null }).ingredients;
      if (!Array.isArray(ingredients)) return;

      ingredients.forEach((ing: Ingredient) => {
        const key = ing.item.toLowerCase().trim();
        const existing = ingredientMap.get(key);
        const category = categorizeIngredient(ing.item);

        if (existing) {
          existing.amounts.push(ing.amount);
        } else {
          ingredientMap.set(key, {
            item: ing.item,
            amounts: [ing.amount],
            category,
          });
        }
      });
    });

    // Group by category
    const grouped: Record<string, AggregatedIngredient[]> = {};
    ingredientMap.forEach((ingredient) => {
      if (!grouped[ingredient.category]) {
        grouped[ingredient.category] = [];
      }
      grouped[ingredient.category].push(ingredient);
    });

    // Sort each category alphabetically
    Object.values(grouped).forEach((items) => {
      items.sort((a, b) => a.item.localeCompare(b.item));
    });

    return grouped;
  }, [weekMeals]);

  const categoryOrder = ["Proteins", "Vegetables", "Fruits", "Grains", "Dairy", "Pantry", "Other"];
  const totalItems = Object.values(groceryList).flat().length;

  const copyToClipboard = () => {
    const lines: string[] = [`Week ${weekNumber} Grocery List`, ""];
    
    categoryOrder.forEach((category) => {
      const items = groceryList[category];
      if (!items?.length) return;
      
      lines.push(category.toUpperCase());
      items.forEach((item) => {
        const amountStr = item.amounts.length > 1 
          ? `(${item.amounts.join(" + ")})`
          : item.amounts[0];
        lines.push(`• ${item.item}: ${amountStr}`);
      });
      lines.push("");
    });

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    toast.success("Grocery list copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (totalItems === 0) {
    return (
      <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
        No ingredients found for Week {weekNumber}
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-purple-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <ShoppingCart className="w-4 h-4 text-purple-400" />
            <span className="font-medium text-sm">Week {weekNumber} Grocery List</span>
            <Badge variant="secondary" className="text-xs">
              {totalItems} items
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard();
            }}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-2 p-4 bg-background border border-border rounded-lg space-y-4">
          {categoryOrder.map((category) => {
            const items = groceryList[category];
            if (!items?.length) return null;

            return (
              <div key={category}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {category}
                </h4>
                <ul className="space-y-1">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      <span className="flex-1">
                        <span className="font-medium">{item.item}</span>
                        <span className="text-muted-foreground">
                          : {item.amounts.length > 1 
                              ? `${item.amounts.join(" + ")}` 
                              : item.amounts[0]}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
