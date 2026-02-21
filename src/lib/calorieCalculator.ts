/**
 * Calculates daily calorie needs using the Mifflin-St Jeor equation
 * Adjusted for training program activity levels
 */

export interface CalorieCalculationInput {
  weightLbs: number;
  heightFeet: number;
  heightInches: number;
  age: number;
  goal: string;
}

export interface CalorieCalculationResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
}

/**
 * Parse height string like "5'10" or "5'10\"" into feet and inches
 */
export function parseHeight(heightStr: string): { feet: number; inches: number } {
  if (!heightStr) return { feet: 5, inches: 9 }; // Default average male height
  
  // Match patterns like "5'10", "5'10\"", "5 10", "5ft 10in"
  const match = heightStr.match(/(\d+)['\s]?\s*(\d+)?/);
  if (match) {
    const feet = parseInt(match[1], 10) || 5;
    const inches = parseInt(match[2], 10) || 0;
    return { feet, inches };
  }
  
  return { feet: 5, inches: 9 };
}

/**
 * Parse weight string like "185" or "185 lbs" into number
 */
export function parseWeight(weightStr: string): number {
  if (!weightStr) return 180; // Default average male weight
  
  const match = weightStr.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return 180;
}

/**
 * Calculate daily calorie needs based on user stats and goal
 * Uses Mifflin-St Jeor equation with moderate activity multiplier (1.55)
 * for prison-style training programs
 */
export function calculateDailyCalories(input: CalorieCalculationInput): CalorieCalculationResult {
  const { weightLbs, heightFeet, heightInches, age, goal } = input;

  // Clamp inputs to sane ranges to prevent garbage output
  const safeWeight = Math.max(50, Math.min(weightLbs, 500));
  const safeFeet = Math.max(3, Math.min(heightFeet, 8));
  const safeInches = Math.max(0, Math.min(heightInches, 11));
  const safeAge = Math.max(13, Math.min(age, 120));

  // Convert to metric
  const weightKg = safeWeight * 0.453592;
  const heightCm = (safeFeet * 12 + safeInches) * 2.54;
  
  // Mifflin-St Jeor equation for men
  // BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(years) + 5
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * safeAge + 5);
  
  // TDEE with moderate activity multiplier (1.55) for training program
  const tdee = Math.round(bmr * 1.55);
  
  // Adjust for goal
  let targetCalories: number;
  let proteinMultiplier: number;
  
  switch (goal) {
    case "Lose fat":
      targetCalories = tdee - 500; // 500 calorie deficit
      proteinMultiplier = 1.2; // Higher protein to preserve muscle
      break;
    case "Build muscle":
      targetCalories = tdee + 300; // 300 calorie surplus
      proteinMultiplier = 1.0;
      break;
    case "Both - lose fat and build muscle":
    default:
      targetCalories = tdee; // Maintenance for recomposition
      proteinMultiplier = 1.1;
      break;
  }
  
  // Calculate macros
  // Protein: 1g per lb of bodyweight (adjusted by goal)
  const protein = Math.round(safeWeight * proteinMultiplier);
  // Fat: 25% of calories
  const fats = Math.round((targetCalories * 0.25) / 9);
  // Carbs: remaining calories
  const proteinCalories = protein * 4;
  const fatCalories = fats * 9;
  const carbs = Math.round((targetCalories - proteinCalories - fatCalories) / 4);
  
  return {
    bmr,
    tdee,
    targetCalories: Math.round(targetCalories),
    protein,
    carbs: Math.max(carbs, 50), // Minimum 50g carbs
    fats
  };
}

/**
 * Find the best matching meal plan template based on calculated calories and goal
 */
export function findMatchingTemplate<T extends { 
  goal_type: string; 
  calorie_range_min: number; 
  calorie_range_max: number;
}>(
  templates: T[],
  targetCalories: number,
  goal: string
): T | null {
  // Filter by goal first
  const goalTemplates = templates.filter(t => t.goal_type === goal);
  
  if (goalTemplates.length === 0) {
    // Fallback to any goal if no exact match
    return templates.find(t => 
      targetCalories >= t.calorie_range_min && 
      targetCalories <= t.calorie_range_max
    ) || templates[0] || null;
  }
  
  // Find template where target calories fall within range
  const exactMatch = goalTemplates.find(t => 
    targetCalories >= t.calorie_range_min && 
    targetCalories <= t.calorie_range_max
  );
  
  if (exactMatch) return exactMatch;
  
  // Find closest template if no exact match
  let closestTemplate = goalTemplates[0];
  let closestDistance = Infinity;
  
  for (const template of goalTemplates) {
    const midpoint = (template.calorie_range_min + template.calorie_range_max) / 2;
    const distance = Math.abs(targetCalories - midpoint);
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestTemplate = template;
    }
  }
  
  return closestTemplate;
}
