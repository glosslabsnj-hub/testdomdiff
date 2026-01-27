import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Ingredient {
  item: string;
  amount: string;
  notes?: string;
}

interface MealTemplate {
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  prep_time_min: number;
  cook_time_min: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string;
  notes?: string;
}

// ============================================================
// BREAKFAST TEMPLATES (20 options, 250-600 cal range)
// ============================================================
const BREAKFASTS: MealTemplate[] = [
  {
    meal_type: "breakfast",
    meal_name: "Iron Will Steak & Eggs",
    calories: 520,
    protein_g: 48,
    carbs_g: 8,
    fats_g: 34,
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Ribeye steak", amount: "6 oz", notes: "room temperature" },
      { item: "Whole eggs", amount: "3 large" },
      { item: "Butter", amount: "1 tbsp" },
      { item: "Salt", amount: "to taste" },
      { item: "Black pepper", amount: "to taste" },
    ],
    instructions: `1. PREP: Pull steak from fridge 30 min before cooking. Pat dry with paper towels. Season generously with salt and pepper on both sides. No seasoning fear here.

2. HEAT: Get your cast iron screaming hot over medium-high heat for 5 minutes. You want it smoking. That's the commitment.

3. SEAR: Add half the butter, let it foam. Lay steak away from you to avoid splatter. Don't touch it for 3 minutes. Trust the process.

4. FLIP: Only once. Another 3 minutes for medium-rare, 4 for medium. Use a meat thermometer if you're disciplined: 130°F medium-rare.

5. REST: Remove steak to cutting board. Cover loosely with foil. 5 minutes minimum. This is where iron sharpens iron.

6. EGGS: While steak rests, add remaining butter to the same pan. Crack eggs directly in. Season with salt.

7. COOK EGGS: For over-easy: 2 minutes lid off, then 30 seconds lid on. Whites set, yolk runny. That's the warrior's way.

8. PLATE: Slice steak against the grain. Arrange with eggs. Pour any pan juices over steak.

9. SERVE: Immediately. Cold food is for quitters.

PRO TIP: Make multiple steaks for meal prep. Slice cold on salads. This meal built warriors.`,
    notes: "High protein, low carb. The ultimate breakfast of champions. This is how you start a day of dominance."
  },
  {
    meal_type: "breakfast",
    meal_name: "Power Egg Scramble",
    calories: 420,
    protein_g: 35,
    carbs_g: 25,
    fats_g: 22,
    prep_time_min: 5,
    cook_time_min: 10,
    servings: 1,
    ingredients: [
      { item: "Whole eggs", amount: "3 large" },
      { item: "Egg whites", amount: "3 large" },
      { item: "Spinach", amount: "1 cup", notes: "fresh" },
      { item: "Bell pepper", amount: "1/2", notes: "diced" },
      { item: "Olive oil", amount: "1 tsp" },
      { item: "Whole wheat toast", amount: "1 slice" },
      { item: "Salt and pepper", amount: "to taste" }
    ],
    instructions: `1. PREP: Dice bell pepper. Measure out spinach. Crack eggs into a bowl, add egg whites. Whisk with a fork until combined.

2. HEAT PAN: Add olive oil to a non-stick pan over medium heat. Wait until it shimmers - patience is discipline.

3. SAUTÉ VEGGIES: Add bell pepper first, cook 2 minutes until slightly softened. Add spinach, stir until wilted. About 1 minute.

4. ADD EGGS: Pour egg mixture over vegetables. Let sit for 20 seconds without touching.

5. SCRAMBLE: Using a spatula, gently push eggs from edges toward center. Let sit 20 seconds. Repeat until just barely set.

6. REMOVE FROM HEAT: Take pan off heat when eggs still look slightly wet. They'll finish cooking from residual heat.

7. TOAST: While eggs cook, toast your bread. Timing is coordination. Coordination is discipline.

8. SEASON: Add salt and pepper. Taste. Adjust. Own your food.

9. PLATE: Serve scramble alongside toast. No excuses.

PRO TIP: Add hot sauce for metabolism boost. Capsaicin is thermogenic - burns fat while you eat. That's efficiency.`,
    notes: "Quick, balanced, effective. Perfect for morning training days. Veggies first thing hits different."
  },
  {
    meal_type: "breakfast",
    meal_name: "Protein Oatmeal Bowl",
    calories: 380,
    protein_g: 30,
    carbs_g: 45,
    fats_g: 10,
    prep_time_min: 5,
    cook_time_min: 5,
    servings: 1,
    ingredients: [
      { item: "Rolled oats", amount: "1/2 cup", notes: "dry" },
      { item: "Protein powder", amount: "1 scoop", notes: "vanilla or unflavored" },
      { item: "Banana", amount: "1/2", notes: "sliced" },
      { item: "Peanut butter", amount: "1 tbsp" },
      { item: "Cinnamon", amount: "1/2 tsp" },
      { item: "Water or almond milk", amount: "1 cup" }
    ],
    instructions: `1. BOIL: Bring water or milk to a boil. Discipline starts with doing what you said you'd do.

2. ADD OATS: Reduce heat to medium. Add oats. Stir once to distribute.

3. COOK: Simmer for 4-5 minutes, stirring occasionally. Oats should be creamy, not watery.

4. COOL SLIGHTLY: Remove from heat. Wait 2 minutes. Protein powder clumps if added to boiling liquid.

5. ADD PROTEIN: Stir in protein powder until fully incorporated. No lumps. That's the standard.

6. TRANSFER: Pour into a bowl. This is your foundation.

7. TOP: Add sliced banana in a line. Drizzle peanut butter in zig-zags. Dust with cinnamon.

8. SERVE: Eat immediately while warm. Cold oatmeal is punishment. Hot oatmeal is fuel.

9. CLEAN YOUR BOWL: Oats harden like concrete. Rinse immediately. Clean as you go.

PRO TIP: Make overnight oats the night before. Add protein in the morning. Prep is the key to consistency.`,
    notes: "Complex carbs + protein = sustained energy. Perfect pre-workout 90 mins before training. The warrior's fuel."
  },
  {
    meal_type: "breakfast",
    meal_name: "Greek Yogurt Parfait",
    calories: 350,
    protein_g: 28,
    carbs_g: 40,
    fats_g: 8,
    prep_time_min: 5,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Greek yogurt", amount: "1 cup", notes: "plain, 0% fat" },
      { item: "Mixed berries", amount: "1/2 cup" },
      { item: "Granola", amount: "1/4 cup", notes: "low sugar" },
      { item: "Honey", amount: "1 tsp" },
      { item: "Almonds", amount: "10", notes: "sliced" }
    ],
    instructions: `1. BASE: Add Greek yogurt to a bowl or mason jar. This is your protein foundation.

2. FIRST LAYER: Add half the berries on top. Press down slightly so they nestle into the yogurt.

3. SECOND LAYER: Sprinkle half the granola. You want crunch in every bite.

4. REPEAT: Add remaining yogurt, berries, then granola on top.

5. GARNISH: Scatter sliced almonds over the top. These add healthy fats and crunch.

6. DRIZZLE: Honey in a thin stream over everything. Control the sweetness. Control your life.

7. SERVE: Eat immediately if you want crunch. Let sit 10 min if you want softer texture.

8. OPTION: Store in mason jar overnight. Grab and go in the morning. Prep is power.

PRO TIP: Freeze berries and add frozen - they'll thaw by morning and make the parfait extra thick and cold.`,
    notes: "No cooking required. High protein, gut-healthy probiotics. Quick doesn't mean weak."
  },
  {
    meal_type: "breakfast",
    meal_name: "Breakfast Burrito",
    calories: 480,
    protein_g: 32,
    carbs_g: 38,
    fats_g: 22,
    prep_time_min: 10,
    cook_time_min: 10,
    servings: 1,
    ingredients: [
      { item: "Whole wheat tortilla", amount: "1 large", notes: "10 inch" },
      { item: "Whole eggs", amount: "3 large" },
      { item: "Black beans", amount: "1/4 cup", notes: "drained and rinsed" },
      { item: "Salsa", amount: "2 tbsp" },
      { item: "Cheese", amount: "1 oz", notes: "shredded cheddar or pepper jack" },
      { item: "Avocado", amount: "1/4", notes: "sliced" }
    ],
    instructions: `1. PREP BEANS: Drain and rinse black beans. Set aside. Preparation is half the battle.

2. WARM TORTILLA: Heat tortilla in dry pan for 30 seconds each side. Or microwave 15 seconds wrapped in damp paper towel.

3. SCRAMBLE: Beat eggs in a bowl. Cook in lightly oiled pan over medium heat, stirring frequently until just set.

4. WARM BEANS: Add beans to the pan with eggs for the last 30 seconds. Season with salt and pepper.

5. ASSEMBLE: Lay tortilla flat. Add eggs and beans in a line in the center.

6. ADD TOPPINGS: Layer cheese (it will melt from the heat), salsa, then avocado slices.

7. FOLD: Fold bottom of tortilla up over filling. Fold sides in. Roll from bottom to top, keeping it tight.

8. CRISP (OPTIONAL): Place seam-side down in a hot pan for 1 minute to seal and crisp.

9. CUT AND SERVE: Slice in half diagonally. Show off that cross-section. Eat with pride.

PRO TIP: Make a batch of 5, wrap in foil, freeze. Microwave 2 minutes for instant breakfast. Meal prep is freedom.`,
    notes: "Portable protein power. Make extras and freeze. The hustler's breakfast."
  },
  {
    meal_type: "breakfast",
    meal_name: "Cottage Cheese Power Bowl",
    calories: 320,
    protein_g: 32,
    carbs_g: 28,
    fats_g: 8,
    prep_time_min: 5,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Cottage cheese", amount: "1 cup", notes: "2% fat" },
      { item: "Peaches", amount: "1/2 cup", notes: "fresh or canned in juice" },
      { item: "Hemp hearts", amount: "1 tbsp" },
      { item: "Honey", amount: "1 tsp" },
      { item: "Cinnamon", amount: "dash" }
    ],
    instructions: `1. BASE: Scoop cottage cheese into a bowl. This is pure casein protein - slow digesting, keeps you full.

2. PEACHES: If using fresh, slice thin. If canned, drain well. Layer over cottage cheese.

3. HEMP HEARTS: Sprinkle over top. These add omega-3s and complete protein.

4. SWEETEN: Drizzle honey in thin lines across the bowl.

5. SEASON: Dust with cinnamon. It helps regulate blood sugar. That's optimization.

6. MIX OR LAYER: Your choice. Mixing combines flavors. Layering gives variety in each bite.

7. SERVE: Eat cold. No heating needed. Speed is efficiency.

PRO TIP: This is excellent before bed. Casein protein feeds your muscles while you sleep. Recovery is growth.`,
    notes: "Casein protein for slow absorption. Great before bed or for sustained morning energy."
  },
  {
    meal_type: "breakfast",
    meal_name: "Egg White Veggie Omelet",
    calories: 280,
    protein_g: 28,
    carbs_g: 12,
    fats_g: 14,
    prep_time_min: 10,
    cook_time_min: 8,
    servings: 1,
    ingredients: [
      { item: "Egg whites", amount: "6 large" },
      { item: "Mushrooms", amount: "1/4 cup", notes: "sliced" },
      { item: "Spinach", amount: "1/2 cup" },
      { item: "Tomato", amount: "1/4 cup", notes: "diced" },
      { item: "Feta cheese", amount: "1 oz", notes: "crumbled" },
      { item: "Olive oil spray", amount: "as needed" }
    ],
    instructions: `1. PREP VEGGIES: Slice mushrooms, dice tomato, measure spinach. All ingredients ready before you cook.

2. HEAT PAN: Spray non-stick pan with olive oil. Heat over medium. Too hot and the whites will rubber up.

3. SAUTÉ: Add mushrooms first. Cook 3 minutes until they release moisture and brown.

4. ADD GREENS: Toss in spinach and tomato. Cook 1 minute until spinach wilts.

5. REMOVE VEGGIES: Take vegetables out, set aside. Keep pan on heat.

6. POUR WHITES: Add egg whites to pan. Let sit 1 minute until edges set.

7. FILL: Add vegetables and feta to one half of the omelet.

8. FOLD: Using spatula, flip empty half over the filled side. Cook 1 more minute.

9. SLIDE AND SERVE: Slide onto plate. Season with pepper if desired.

PRO TIP: Add a splash of hot sauce inside before folding. Heat accelerates metabolism. Burn while you eat.`,
    notes: "Low calorie, high protein. For aggressive fat loss phases. Egg whites are pure protein."
  },
  {
    meal_type: "breakfast",
    meal_name: "Avocado Toast with Eggs",
    calories: 450,
    protein_g: 20,
    carbs_g: 32,
    fats_g: 28,
    prep_time_min: 5,
    cook_time_min: 8,
    servings: 1,
    ingredients: [
      { item: "Sourdough bread", amount: "2 slices" },
      { item: "Avocado", amount: "1 medium", notes: "ripe" },
      { item: "Eggs", amount: "2 large" },
      { item: "Lime juice", amount: "1 tsp" },
      { item: "Red pepper flakes", amount: "pinch" },
      { item: "Salt", amount: "to taste" }
    ],
    instructions: `1. TOAST: Get your bread toasting first. Golden brown, not burnt. Discipline is attention to detail.

2. HALVE AVOCADO: Cut around the pit lengthwise. Twist to separate. Remove pit with knife heel.

3. SCOOP AND MASH: Scoop avocado into bowl. Add lime juice and salt. Mash with fork to desired texture.

4. FRY EGGS: In a non-stick pan, cook eggs to your preference. Over-easy or sunny-side up for that runny yolk.

5. SPREAD: Divide avocado between both toast slices. Spread to edges.

6. TOP: Place one egg on each toast. Season with salt and red pepper flakes.

7. SERVE: Eat immediately. When you cut into the yolk, it should run. That's the moment.

PRO TIP: Add everything bagel seasoning instead of red pepper for different flavor. Variety keeps you consistent.`,
    notes: "Healthy fats + carbs + protein. Balanced macros for sustained energy. Instagram optional."
  },
  {
    meal_type: "breakfast",
    meal_name: "Protein Pancakes",
    calories: 420,
    protein_g: 35,
    carbs_g: 42,
    fats_g: 12,
    prep_time_min: 5,
    cook_time_min: 10,
    servings: 1,
    ingredients: [
      { item: "Rolled oats", amount: "1/2 cup" },
      { item: "Egg whites", amount: "4 large" },
      { item: "Cottage cheese", amount: "1/2 cup" },
      { item: "Banana", amount: "1 small" },
      { item: "Protein powder", amount: "1/2 scoop" },
      { item: "Baking powder", amount: "1/2 tsp" }
    ],
    instructions: `1. BLEND: Add all ingredients to a blender. Blend until completely smooth. No chunks.

2. REST BATTER: Let sit 2 minutes. The oats will absorb liquid and thicken.

3. HEAT PAN: Non-stick pan or griddle over medium heat. Spray lightly with oil.

4. POUR: Use 1/4 cup batter per pancake. Don't crowd the pan.

5. WAIT FOR BUBBLES: Cook until bubbles form on surface and edges look set. About 2-3 minutes.

6. FLIP: Only flip once. Cook another 1-2 minutes until golden.

7. REPEAT: Make 3-4 pancakes total. Keep warm in 200°F oven while making the rest.

8. SERVE: Stack and top with fresh fruit, a drizzle of maple syrup, or more nut butter.

PRO TIP: These freeze well. Make a double batch, freeze individually, microwave for 1 minute for instant breakfast.`,
    notes: "Tastes like regular pancakes, hits like protein. No guilt, just gains."
  },
  {
    meal_type: "breakfast",
    meal_name: "Smoked Salmon Bagel",
    calories: 480,
    protein_g: 30,
    carbs_g: 48,
    fats_g: 18,
    prep_time_min: 5,
    cook_time_min: 3,
    servings: 1,
    ingredients: [
      { item: "Whole wheat bagel", amount: "1" },
      { item: "Smoked salmon", amount: "3 oz" },
      { item: "Cream cheese", amount: "2 tbsp", notes: "light" },
      { item: "Red onion", amount: "2 slices", notes: "thin" },
      { item: "Capers", amount: "1 tsp" },
      { item: "Fresh dill", amount: "for garnish" }
    ],
    instructions: `1. TOAST BAGEL: Slice and toast until golden. You want it sturdy enough to hold the toppings.

2. SPREAD: While warm, spread cream cheese on both halves. The warmth softens it.

3. LAYER SALMON: Drape smoked salmon over cream cheese. Fold it for height.

4. ONION: Add red onion rings on top. They add crunch and bite.

5. CAPERS: Scatter capers over the salmon. These add briny pops of flavor.

6. GARNISH: Add fresh dill if you have it. Makes it look and taste professional.

7. ASSEMBLE: You can eat open-faced or close it as a sandwich.

PRO TIP: Make it open-faced to save carbs. Or go all in with the full bagel. Know your targets.`,
    notes: "Omega-3 rich breakfast. Brain food + protein. Elite morning fuel."
  },
  {
    meal_type: "breakfast",
    meal_name: "Turkey Sausage Hash",
    calories: 380,
    protein_g: 32,
    carbs_g: 28,
    fats_g: 16,
    prep_time_min: 10,
    cook_time_min: 20,
    servings: 1,
    ingredients: [
      { item: "Turkey sausage", amount: "4 oz", notes: "links or patties, crumbled" },
      { item: "Sweet potato", amount: "1 small", notes: "diced 1/2 inch" },
      { item: "Bell pepper", amount: "1/2", notes: "diced" },
      { item: "Onion", amount: "1/4", notes: "diced" },
      { item: "Olive oil", amount: "1 tsp" },
      { item: "Eggs", amount: "2 large" }
    ],
    instructions: `1. DICE SWEET POTATO: Cut into 1/2 inch cubes. Uniform size = even cooking.

2. PAR-COOK POTATO: Microwave sweet potato cubes for 3 minutes. This speeds up cooking time.

3. HEAT PAN: Large skillet, medium-high heat, add olive oil.

4. BROWN SAUSAGE: Add crumbled sausage. Cook until browned, 5-6 minutes. Remove and set aside.

5. COOK VEGGIES: Same pan, add potatoes, peppers, onions. Cook 8-10 minutes, stirring occasionally, until crispy.

6. COMBINE: Add sausage back. Stir to combine. Season with salt and pepper.

7. MAKE WELLS: Create 2 small wells in the hash. Crack an egg into each.

8. COVER AND COOK: Put lid on. Cook 3-4 minutes until egg whites set, yolks still runny.

9. SERVE: Scoop directly from pan to plate. Eat immediately.

PRO TIP: Prep the hash without eggs on Sunday. Reheat portions all week, add fresh eggs each morning.`,
    notes: "One-pan wonder. Complex carbs, lean protein, vegetables. Complete meal in a skillet."
  },
  {
    meal_type: "breakfast",
    meal_name: "Chocolate Protein Smoothie",
    calories: 380,
    protein_g: 40,
    carbs_g: 35,
    fats_g: 10,
    prep_time_min: 5,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Chocolate protein powder", amount: "1.5 scoops" },
      { item: "Banana", amount: "1 medium", notes: "frozen" },
      { item: "Almond butter", amount: "1 tbsp" },
      { item: "Unsweetened almond milk", amount: "1 cup" },
      { item: "Ice", amount: "1/2 cup" },
      { item: "Cocoa powder", amount: "1 tsp", notes: "optional for extra chocolate" }
    ],
    instructions: `1. LIQUID FIRST: Add almond milk to blender. Always liquid first to help blades spin.

2. ADD PROTEIN: Scoop protein powder on top of liquid.

3. ADD FRUIT: Drop in frozen banana. Frozen is key - makes it thick like a milkshake.

4. ADD FAT: Spoon in almond butter. This adds healthy fats and creaminess.

5. OPTIONAL COCOA: Add cocoa powder if you want it extra chocolatey.

6. ADD ICE: Ice goes in last for best blending.

7. BLEND: Start on low, increase to high. Blend 30-60 seconds until completely smooth.

8. CHECK CONSISTENCY: Too thick? Add more milk. Too thin? Add more ice.

9. SERVE: Pour and drink immediately. Don't let it separate.

PRO TIP: Prep smoothie bags - banana + measured ingredients in freezer bags. Just dump, add liquid, blend. 2-minute breakfast.`,
    notes: "Portable, fast, delicious. Tastes like a milkshake, performs like fuel."
  },
  {
    meal_type: "breakfast",
    meal_name: "Veggie Egg Muffins",
    calories: 250,
    protein_g: 24,
    carbs_g: 8,
    fats_g: 14,
    prep_time_min: 15,
    cook_time_min: 25,
    servings: 3,
    ingredients: [
      { item: "Whole eggs", amount: "6 large" },
      { item: "Egg whites", amount: "4 large" },
      { item: "Spinach", amount: "1 cup", notes: "chopped" },
      { item: "Cherry tomatoes", amount: "6", notes: "halved" },
      { item: "Turkey bacon", amount: "2 strips", notes: "cooked and crumbled" },
      { item: "Cheese", amount: "1/4 cup", notes: "shredded" }
    ],
    instructions: `1. PREHEAT: Oven to 350°F. This is non-negotiable.

2. PREP MUFFIN TIN: Spray 12-cup muffin tin with cooking spray. Every cup needs coverage.

3. COOK BACON: Crisp turkey bacon in microwave or pan. Crumble when cool.

4. WHISK EGGS: Combine whole eggs and egg whites in large bowl. Whisk until uniform.

5. SEASON: Add salt and pepper to eggs. Whisk again.

6. DISTRIBUTE VEGGIES: Divide spinach, tomatoes, and bacon evenly among 12 cups.

7. POUR EGGS: Fill each cup about 3/4 full with egg mixture.

8. TOP WITH CHEESE: Sprinkle cheese on top of each cup.

9. BAKE: 22-25 minutes until eggs are set and tops are golden.

10. COOL: Let sit in pan 5 minutes. Run knife around edges. Pop out.

PRO TIP: These keep 5 days refrigerated. Reheat 30 seconds in microwave. Prep Sunday, eat all week.`,
    notes: "Make once, eat all week. Grab-and-go protein. Meal prep mastery."
  },
  {
    meal_type: "breakfast",
    meal_name: "Chia Protein Pudding",
    calories: 320,
    protein_g: 28,
    carbs_g: 30,
    fats_g: 12,
    prep_time_min: 5,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Chia seeds", amount: "3 tbsp" },
      { item: "Protein powder", amount: "1 scoop", notes: "vanilla" },
      { item: "Unsweetened almond milk", amount: "1 cup" },
      { item: "Maple syrup", amount: "1 tsp" },
      { item: "Berries", amount: "1/4 cup", notes: "for topping" }
    ],
    instructions: `1. COMBINE: In a jar or container, add almond milk, protein powder, and maple syrup.

2. WHISK: Stir vigorously or shake with lid on until protein is dissolved.

3. ADD CHIA: Pour in chia seeds. Stir immediately.

4. STIR AGAIN: After 5 minutes, stir again. Chia seeds tend to clump.

5. REFRIGERATE: Cover and refrigerate at least 4 hours, preferably overnight.

6. CHECK TEXTURE: Should be thick and pudding-like. Add more milk if too thick.

7. TOP: Add fresh berries before serving.

8. SERVE: Can be eaten cold straight from the fridge. Grab and go.

PRO TIP: Make 5 jars on Sunday. You have breakfast ready for the whole week. This is how winners operate.`,
    notes: "Prep the night before. Fiber + protein + omega-3s. Zero morning effort."
  },
  {
    meal_type: "breakfast",
    meal_name: "Peanut Butter Banana Toast",
    calories: 420,
    protein_g: 18,
    carbs_g: 52,
    fats_g: 18,
    prep_time_min: 5,
    cook_time_min: 3,
    servings: 1,
    ingredients: [
      { item: "Whole grain bread", amount: "2 slices" },
      { item: "Natural peanut butter", amount: "2 tbsp" },
      { item: "Banana", amount: "1 medium", notes: "sliced" },
      { item: "Honey", amount: "1 tsp" },
      { item: "Cinnamon", amount: "pinch" }
    ],
    instructions: `1. TOAST: Golden brown. Not too light, not burnt. Find the balance.

2. SPREAD PB: While toast is hot, spread peanut butter. Heat makes it melt and spread easy.

3. SLICE BANANA: Cut into 1/4 inch rounds. Uniform thickness matters.

4. ARRANGE: Layer banana slices over peanut butter. Cover edge to edge.

5. DRIZZLE: Honey in thin lines back and forth across the bananas.

6. SEASON: Light dusting of cinnamon over everything.

7. SERVE: Cut diagonally if you want to feel fancy. Eat immediately.

PRO TIP: For extra protein, drizzle with chocolate protein powder mixed with a splash of water. Dessert for breakfast.`,
    notes: "Simple, satisfying, sustainable. Good carbs + healthy fats + potassium. Classic for a reason."
  },
  {
    meal_type: "breakfast",
    meal_name: "High Protein French Toast",
    calories: 480,
    protein_g: 38,
    carbs_g: 48,
    fats_g: 14,
    prep_time_min: 10,
    cook_time_min: 10,
    servings: 1,
    ingredients: [
      { item: "Whole wheat bread", amount: "2 thick slices" },
      { item: "Whole eggs", amount: "2 large" },
      { item: "Egg whites", amount: "2 large" },
      { item: "Vanilla protein powder", amount: "1/2 scoop" },
      { item: "Cinnamon", amount: "1/2 tsp" },
      { item: "Vanilla extract", amount: "1/2 tsp" },
      { item: "Almond milk", amount: "1/4 cup" }
    ],
    instructions: `1. MAKE EGG MIXTURE: Whisk eggs, egg whites, protein powder, cinnamon, vanilla, and milk. Beat until smooth.

2. POUR INTO DISH: Use a shallow dish so bread can lay flat and soak.

3. SOAK BREAD: Dip each slice, letting it absorb for 15 seconds per side. Not too long or it falls apart.

4. HEAT PAN: Medium heat, non-stick pan with light butter or spray.

5. COOK: Place soaked bread in pan. Cook 3-4 minutes per side until golden brown.

6. TEST DONENESS: Press center gently. Should feel set, not wet.

7. SERVE: Top with fresh berries, a drizzle of maple syrup, or sugar-free syrup.

PRO TIP: Use day-old bread - it absorbs better without falling apart. Stale bread = better French toast.`,
    notes: "Comfort food made functional. High protein version of the breakfast classic."
  },
  {
    meal_type: "breakfast",
    meal_name: "Breakfast Quesadilla",
    calories: 450,
    protein_g: 32,
    carbs_g: 35,
    fats_g: 20,
    prep_time_min: 5,
    cook_time_min: 10,
    servings: 1,
    ingredients: [
      { item: "Low-carb tortilla", amount: "1 large" },
      { item: "Whole eggs", amount: "2 large", notes: "scrambled" },
      { item: "Turkey sausage", amount: "2 oz", notes: "crumbled and cooked" },
      { item: "Cheese", amount: "1/4 cup", notes: "shredded Mexican blend" },
      { item: "Salsa", amount: "2 tbsp", notes: "for dipping" }
    ],
    instructions: `1. SCRAMBLE EGGS: Quick scramble in a small pan. Slightly undercook - they'll cook more in the quesadilla.

2. COOK SAUSAGE: Brown crumbled sausage until cooked through. Drain any fat.

3. HEAT LARGE PAN: Dry pan, medium heat. No oil needed.

4. LAY TORTILLA: Place tortilla flat in pan.

5. ADD CHEESE: Sprinkle half the cheese on one half of tortilla.

6. ADD FILLING: Layer eggs, then sausage, then remaining cheese.

7. FOLD: Fold empty half over the filled side. Press down gently.

8. COOK: 2-3 minutes per side until tortilla is crispy and cheese is melted.

9. SLICE AND SERVE: Cut into triangles. Serve with salsa for dipping.

PRO TIP: Add sliced jalapeños inside for heat. Capsaicin boosts metabolism. Fire inside and out.`,
    notes: "Handheld breakfast. Crispy, cheesy, protein-packed. Eat on the go."
  },
  {
    meal_type: "breakfast",
    meal_name: "Overnight Protein Oats",
    calories: 380,
    protein_g: 30,
    carbs_g: 48,
    fats_g: 10,
    prep_time_min: 5,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Rolled oats", amount: "1/2 cup" },
      { item: "Greek yogurt", amount: "1/2 cup" },
      { item: "Protein powder", amount: "1/2 scoop" },
      { item: "Almond milk", amount: "1/2 cup" },
      { item: "Chia seeds", amount: "1 tbsp" },
      { item: "Honey", amount: "1 tsp" }
    ],
    instructions: `1. COMBINE DRY: In a jar or container, add oats and chia seeds.

2. ADD WET: Pour in almond milk and stir.

3. ADD PROTEIN: Scoop in protein powder and stir until dissolved.

4. ADD YOGURT: Spoon in Greek yogurt and fold in gently.

5. SWEETEN: Add honey and stir everything together.

6. SEAL: Cover tightly with lid.

7. REFRIGERATE: At least 6 hours, ideally overnight. Oats need time to soften.

8. MORNING: Stir well. Add more milk if too thick.

9. TOP: Fresh fruit, nuts, or more honey as desired.

PRO TIP: Mason jars work perfectly. Make 5 on Sunday, grab one each morning. Zero excuses.`,
    notes: "Zero cooking, maximum nutrition. Prep once, eat all week."
  },
  {
    meal_type: "breakfast",
    meal_name: "Egg White & Spinach Wrap",
    calories: 280,
    protein_g: 26,
    carbs_g: 24,
    fats_g: 10,
    prep_time_min: 5,
    cook_time_min: 8,
    servings: 1,
    ingredients: [
      { item: "Egg whites", amount: "6 large" },
      { item: "Spinach", amount: "1 cup" },
      { item: "Whole wheat wrap", amount: "1 medium" },
      { item: "Feta cheese", amount: "1 oz", notes: "crumbled" },
      { item: "Hot sauce", amount: "to taste" }
    ],
    instructions: `1. HEAT PAN: Medium heat, light oil spray.

2. WILT SPINACH: Add spinach to pan, cook 1-2 minutes until wilted. Remove and set aside.

3. COOK EGG WHITES: Pour egg whites into same pan. Season with salt and pepper.

4. SCRAMBLE: Stir gently until just set. Don't overcook.

5. WARM WRAP: Microwave wrap for 10 seconds or heat in dry pan.

6. ASSEMBLE: Lay wrap flat. Add eggs in a line in the center.

7. TOP: Add spinach, crumbled feta, and hot sauce.

8. WRAP: Fold bottom up, sides in, roll tight.

9. SERVE: Cut in half if desired. Eat immediately.

PRO TIP: Skip the feta to save 80 calories on aggressive cut days. Every calorie counts in a deficit.`,
    notes: "Low calorie, high protein. Perfect for aggressive fat loss. Clean and lean."
  },
  {
    meal_type: "breakfast",
    meal_name: "Muscle Builder Shake",
    calories: 550,
    protein_g: 50,
    carbs_g: 55,
    fats_g: 14,
    prep_time_min: 5,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Protein powder", amount: "2 scoops" },
      { item: "Oats", amount: "1/2 cup", notes: "quick oats" },
      { item: "Banana", amount: "1 large" },
      { item: "Peanut butter", amount: "1.5 tbsp" },
      { item: "Whole milk", amount: "1.5 cups" },
      { item: "Honey", amount: "1 tbsp" }
    ],
    instructions: `1. LIQUID BASE: Add milk to blender first.

2. ADD OATS: Pour in oats. They'll blend smooth.

3. PROTEIN: Add both scoops of protein powder.

4. FRUIT: Drop in banana.

5. FAT: Add peanut butter and honey.

6. BLEND: Start low, go high. Blend until completely smooth, about 45 seconds.

7. TASTE: Check sweetness. Add more honey if needed.

8. POUR: Into a large glass or shaker bottle.

9. DRINK: Best consumed immediately post-workout or as a meal replacement when bulking.

PRO TIP: This is 550+ calories of quality nutrition. For mass gains, drink one in addition to solid meals.`,
    notes: "Mass gainer without the junk. Real food in liquid form. For serious size."
  },
];

// ============================================================
// LUNCH TEMPLATES (20 options, 400-800 cal range)
// ============================================================
const LUNCHES: MealTemplate[] = [
  {
    meal_type: "lunch",
    meal_name: "Grilled Chicken Power Bowl",
    calories: 520,
    protein_g: 45,
    carbs_g: 45,
    fats_g: 18,
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Chicken breast", amount: "6 oz" },
      { item: "Brown rice", amount: "1/2 cup", notes: "cooked" },
      { item: "Broccoli", amount: "1 cup", notes: "steamed" },
      { item: "Sweet potato", amount: "1/2 medium", notes: "cubed and roasted" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Lemon juice", amount: "1 tbsp" }
    ],
    instructions: `1. PREP CHICKEN: Pat chicken breast dry. Season both sides with salt, pepper, and your choice of spices.

2. HEAT GRILL/PAN: Get it hot. Medium-high heat. You want those grill marks or a good sear.

3. COOK CHICKEN: 6-7 minutes per side. Internal temp should hit 165°F. Don't guess - use a thermometer.

4. REST: Let chicken rest 5 minutes before slicing. Cutting too early = dry meat.

5. ROAST SWEET POTATO: Cube, toss with half the olive oil, roast at 400°F for 20 minutes.

6. STEAM BROCCOLI: 4-5 minutes until bright green and fork-tender. Don't overcook to mush.

7. PREP RICE: Use pre-cooked or make a batch at the start of the week.

8. ASSEMBLE: Rice as base. Arrange chicken, sweet potato, and broccoli on top.

9. DRESS: Drizzle remaining olive oil and lemon juice. Season with salt.

PRO TIP: Make 5 of these on Sunday. Store in containers. Grab and go all week. Prep is the difference between success and struggle.`,
    notes: "The classic bodybuilder bowl. Simple, effective, proven. This built champions."
  },
  {
    meal_type: "lunch",
    meal_name: "Turkey & Avocado Wrap",
    calories: 480,
    protein_g: 38,
    carbs_g: 35,
    fats_g: 22,
    prep_time_min: 10,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Turkey breast", amount: "6 oz", notes: "sliced deli-style" },
      { item: "Whole wheat wrap", amount: "1 large", notes: "10 inch" },
      { item: "Avocado", amount: "1/2", notes: "sliced" },
      { item: "Lettuce", amount: "1 cup", notes: "shredded" },
      { item: "Tomato", amount: "1/2", notes: "sliced" },
      { item: "Mustard", amount: "1 tbsp" }
    ],
    instructions: `1. LAY WRAP: Spread flat on a clean surface or plate.

2. SPREAD MUSTARD: Thin layer over entire wrap. This adds flavor and helps things stick.

3. ADD TURKEY: Layer deli slices in center of wrap, leaving 2 inches on each side.

4. SLICE AVOCADO: Cut in half, remove pit, slice thin. Fan out over turkey.

5. ADD VEGGIES: Layer lettuce and tomato on top.

6. SEASON: Light salt and pepper if desired.

7. FOLD BOTTOM: Bring bottom edge up over the filling.

8. FOLD SIDES: Bring left and right sides in.

9. ROLL: Roll from bottom to top, keeping it tight. Cut in half diagonally.

PRO TIP: Add pickles for extra crunch without calories. Crunch satisfies cravings.`,
    notes: "No cooking required. Perfect for busy days. Protein + healthy fats + fiber."
  },
  {
    meal_type: "lunch",
    meal_name: "Tuna Salad Stuffed Peppers",
    calories: 420,
    protein_g: 42,
    carbs_g: 25,
    fats_g: 18,
    prep_time_min: 15,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Canned tuna", amount: "2 cans", notes: "in water, drained" },
      { item: "Bell peppers", amount: "2 large", notes: "halved, seeds removed" },
      { item: "Greek yogurt", amount: "2 tbsp" },
      { item: "Celery", amount: "2 stalks", notes: "diced fine" },
      { item: "Red onion", amount: "2 tbsp", notes: "diced fine" },
      { item: "Dijon mustard", amount: "1 tsp" }
    ],
    instructions: `1. DRAIN TUNA: Open cans, press out all liquid. Dry tuna = better texture.

2. PREP PEPPERS: Cut in half lengthwise. Remove stem, seeds, and white membrane. These are your boats.

3. DICE VEGGIES: Celery and onion should be small dice. Uniformity matters for texture.

4. MIX FILLING: Combine tuna, yogurt, mustard, celery, and onion in a bowl.

5. SEASON: Salt and pepper to taste. Mix well.

6. STUFF PEPPERS: Divide mixture evenly among 4 pepper halves.

7. MOUND IT: Don't be shy. Pack it in and mound the top.

8. SERVE: Eat immediately or refrigerate for up to 24 hours.

PRO TIP: Use different color peppers for variety. Red, yellow, orange - they're all good. Green is more bitter.`,
    notes: "High protein, low carb. No cooking needed. Perfect for aggressive fat loss phases."
  },
  {
    meal_type: "lunch",
    meal_name: "Beef Stir-Fry",
    calories: 550,
    protein_g: 40,
    carbs_g: 42,
    fats_g: 24,
    prep_time_min: 15,
    cook_time_min: 12,
    servings: 1,
    ingredients: [
      { item: "Lean beef strips", amount: "6 oz", notes: "sirloin or flank, sliced thin" },
      { item: "Mixed vegetables", amount: "2 cups", notes: "broccoli, peppers, snap peas" },
      { item: "Brown rice", amount: "1/2 cup", notes: "cooked" },
      { item: "Low-sodium soy sauce", amount: "2 tbsp" },
      { item: "Sesame oil", amount: "1 tbsp" },
      { item: "Garlic", amount: "2 cloves", notes: "minced" },
      { item: "Ginger", amount: "1 tsp", notes: "minced" }
    ],
    instructions: `1. SLICE BEEF: Cut against the grain into thin strips. Thin = tender.

2. PREP VEGGIES: Cut all vegetables to similar sizes for even cooking.

3. HEAT WOK/PAN: High heat. Get it smoking hot. Stir-fry needs aggressive heat.

4. COOK BEEF: Add half the sesame oil, then beef. Don't crowd. Cook 2-3 minutes. Remove.

5. COOK AROMATICS: Add remaining oil, garlic, and ginger. 30 seconds until fragrant.

6. ADD VEGGIES: Hardest vegetables first (broccoli), then softer ones. Stir constantly. 3-4 minutes.

7. RETURN BEEF: Add beef back with soy sauce.

8. TOSS: Combine everything. Cook 1 more minute.

9. SERVE: Over rice immediately. Stir-fry waits for no one.

PRO TIP: Add red pepper flakes with the garlic for heat. Spice increases thermogenesis.`,
    notes: "Restaurant-quality at home. High protein, balanced macros. The wok is your weapon."
  },
  {
    meal_type: "lunch",
    meal_name: "Salmon Salad Bowl",
    calories: 480,
    protein_g: 38,
    carbs_g: 28,
    fats_g: 26,
    prep_time_min: 10,
    cook_time_min: 12,
    servings: 1,
    ingredients: [
      { item: "Salmon fillet", amount: "5 oz" },
      { item: "Mixed greens", amount: "3 cups" },
      { item: "Quinoa", amount: "1/3 cup", notes: "cooked" },
      { item: "Cucumber", amount: "1/2", notes: "sliced" },
      { item: "Cherry tomatoes", amount: "6", notes: "halved" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Lemon", amount: "1/2", notes: "juiced" }
    ],
    instructions: `1. SEASON SALMON: Salt, pepper, and a squeeze of lemon on both sides.

2. HEAT PAN: Medium-high heat, add a small amount of oil.

3. SEAR SALMON: Skin-side up first, 4 minutes. Flip. 3-4 more minutes. Should flake easily.

4. PREP BASE: Add mixed greens to a large bowl.

5. ADD GRAINS: Spoon quinoa in one section of the bowl.

6. ADD VEGGIES: Arrange cucumber and tomatoes in sections.

7. TOP WITH SALMON: Break into chunks or place fillet whole.

8. DRESS: Whisk olive oil and lemon juice. Drizzle over everything.

9. SEASON: Finish with salt and pepper. Toss lightly or eat as arranged.

PRO TIP: Cook salmon to 125°F for medium-rare center. Carry-over heat finishes it. Pink center = maximum moisture.`,
    notes: "Omega-3s for brain and recovery. Complete protein. Eat this and feel elite."
  },
  {
    meal_type: "lunch",
    meal_name: "Chicken Caesar Salad",
    calories: 460,
    protein_g: 42,
    carbs_g: 18,
    fats_g: 26,
    prep_time_min: 10,
    cook_time_min: 12,
    servings: 1,
    ingredients: [
      { item: "Chicken breast", amount: "6 oz" },
      { item: "Romaine lettuce", amount: "3 cups", notes: "chopped" },
      { item: "Parmesan cheese", amount: "2 tbsp", notes: "shaved" },
      { item: "Caesar dressing", amount: "2 tbsp", notes: "light" },
      { item: "Croutons", amount: "1/4 cup", notes: "optional" },
      { item: "Lemon wedge", amount: "1" }
    ],
    instructions: `1. SEASON CHICKEN: Salt, pepper, and Italian seasoning.

2. GRILL OR PAN: Cook chicken 6-7 minutes per side until 165°F internal.

3. REST: 5 minutes off heat before slicing.

4. PREP LETTUCE: Wash, dry thoroughly, chop into bite-size pieces.

5. TOSS: Add lettuce to bowl with dressing. Toss to coat evenly.

6. SLICE CHICKEN: Cut against the grain into strips.

7. TOP: Arrange chicken on top. Add parmesan shavings.

8. CROUTONS: Add if your macros allow. Skip on strict cuts.

9. FINISH: Squeeze lemon over top. Serve immediately.

PRO TIP: Make your own dressing: Greek yogurt + lemon + garlic + anchovy paste + parmesan. Less fat, more protein.`,
    notes: "The classic, done right. Skip croutons for lower carb. Protein on greens."
  },
  {
    meal_type: "lunch",
    meal_name: "Shrimp Tacos",
    calories: 420,
    protein_g: 35,
    carbs_g: 38,
    fats_g: 16,
    prep_time_min: 15,
    cook_time_min: 8,
    servings: 1,
    ingredients: [
      { item: "Shrimp", amount: "6 oz", notes: "peeled and deveined" },
      { item: "Corn tortillas", amount: "3 small" },
      { item: "Cabbage", amount: "1 cup", notes: "shredded" },
      { item: "Greek yogurt", amount: "2 tbsp" },
      { item: "Lime", amount: "1", notes: "juiced" },
      { item: "Cumin", amount: "1/2 tsp" },
      { item: "Garlic powder", amount: "1/2 tsp" }
    ],
    instructions: `1. SEASON SHRIMP: Toss with cumin, garlic powder, salt, pepper, and half the lime juice.

2. HEAT PAN: High heat, light oil. Get it smoking.

3. COOK SHRIMP: 2 minutes per side. They curl into a C shape when done. Remove immediately.

4. MAKE CREMA: Mix Greek yogurt with remaining lime juice and a pinch of salt.

5. WARM TORTILLAS: Char in dry pan 30 seconds per side. Or microwave wrapped in damp towel.

6. SHRED CABBAGE: Thin slices add crunch without many calories.

7. ASSEMBLE: Tortilla, cabbage, shrimp, drizzle of crema.

8. GARNISH: Fresh cilantro and extra lime if desired.

9. SERVE: Eat immediately. Tacos don't wait.

PRO TIP: Use double tortillas if they're thin. Or go bowl-style over rice for easier eating.`,
    notes: "Light, fresh, high protein. Seafood tacos done the healthy way."
  },
  {
    meal_type: "lunch",
    meal_name: "Mediterranean Chicken Plate",
    calories: 520,
    protein_g: 44,
    carbs_g: 38,
    fats_g: 22,
    prep_time_min: 15,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Chicken thigh", amount: "6 oz", notes: "boneless, skinless" },
      { item: "Hummus", amount: "3 tbsp" },
      { item: "Cucumber", amount: "1/2", notes: "diced" },
      { item: "Cherry tomatoes", amount: "8", notes: "halved" },
      { item: "Feta cheese", amount: "1 oz", notes: "crumbled" },
      { item: "Pita bread", amount: "1 small" },
      { item: "Olive oil", amount: "1 tsp" },
      { item: "Oregano", amount: "1 tsp" }
    ],
    instructions: `1. SEASON CHICKEN: Coat with olive oil, oregano, salt, pepper, and a squeeze of lemon.

2. GRILL OR PAN: Cook thigh 5-6 minutes per side. Thighs are done at 175°F. They can handle more heat.

3. REST AND SLICE: Let rest 5 minutes. Slice into strips.

4. SPREAD HUMMUS: On one side of plate, make a smear of hummus.

5. DICE VEGGIES: Combine cucumber and tomatoes. Season lightly with salt.

6. ARRANGE: Place chicken, veggie mix, and feta on plate.

7. WARM PITA: Toast lightly or heat in microwave.

8. SERVE: Cut pita into triangles for dipping. This is a plate of champions.

PRO TIP: Make a big batch of chicken. Slice and use for wraps, salads, and plates all week.`,
    notes: "Mediterranean diet = longevity. Fresh, flavorful, functional."
  },
  {
    meal_type: "lunch",
    meal_name: "Turkey Meatball Sub",
    calories: 550,
    protein_g: 42,
    carbs_g: 52,
    fats_g: 18,
    prep_time_min: 15,
    cook_time_min: 20,
    servings: 1,
    ingredients: [
      { item: "Ground turkey", amount: "6 oz", notes: "93% lean" },
      { item: "Sub roll", amount: "1", notes: "whole wheat" },
      { item: "Marinara sauce", amount: "1/2 cup" },
      { item: "Mozzarella", amount: "2 oz", notes: "shredded" },
      { item: "Italian seasoning", amount: "1 tsp" },
      { item: "Garlic powder", amount: "1/2 tsp" },
      { item: "Egg", amount: "1 small" }
    ],
    instructions: `1. PREHEAT OVEN: 400°F. Get it hot.

2. MIX MEATBALLS: Combine turkey, Italian seasoning, garlic powder, egg, and a pinch of salt. Don't overmix.

3. FORM: Roll into 5-6 equal sized balls. About golf ball size.

4. BAKE: Place on lined baking sheet. Bake 18-20 minutes until 165°F internal.

5. SIMMER: Last 5 minutes, add meatballs to a pan with marinara. Coat well.

6. PREP ROLL: Slice sub roll, open it up.

7. ASSEMBLE: Place meatballs in roll. Spoon extra sauce over.

8. CHEESE: Top with mozzarella.

9. BROIL: Put open sub under broiler 1-2 minutes until cheese melts and bubbles.

PRO TIP: Make a double batch of meatballs. Freeze individually. Reheat for quick meals anytime.`,
    notes: "Comfort food made lean. Turkey instead of beef = less fat, same satisfaction."
  },
  {
    meal_type: "lunch",
    meal_name: "Asian Chicken Lettuce Wraps",
    calories: 380,
    protein_g: 38,
    carbs_g: 18,
    fats_g: 18,
    prep_time_min: 10,
    cook_time_min: 10,
    servings: 1,
    ingredients: [
      { item: "Ground chicken", amount: "6 oz" },
      { item: "Butter lettuce", amount: "6 leaves", notes: "cups for wrapping" },
      { item: "Water chestnuts", amount: "1/4 cup", notes: "diced" },
      { item: "Green onions", amount: "2", notes: "sliced" },
      { item: "Low-sodium soy sauce", amount: "2 tbsp" },
      { item: "Sesame oil", amount: "1 tsp" },
      { item: "Garlic", amount: "2 cloves", notes: "minced" },
      { item: "Ginger", amount: "1 tsp", notes: "minced" }
    ],
    instructions: `1. PREP LETTUCE: Separate leaves, wash, pat dry. These are your low-carb taco shells.

2. HEAT PAN: Medium-high heat, add sesame oil.

3. COOK AROMATICS: Add garlic and ginger. 30 seconds until fragrant.

4. BROWN CHICKEN: Add ground chicken, break apart. Cook until no longer pink, 5-6 minutes.

5. ADD CRUNCH: Stir in water chestnuts and most of the green onions.

6. SAUCE: Pour soy sauce over. Stir to coat. Cook 1 more minute.

7. TASTE: Adjust seasoning if needed.

8. ASSEMBLE: Spoon filling into lettuce cups.

9. GARNISH: Top with remaining green onions. Serve immediately.

PRO TIP: Add sriracha to the meat for heat. Spice accelerates metabolism and satisfies taste buds.`,
    notes: "Low carb, high protein. Crunchy, savory, satisfying. PF Chang's at home."
  },
  {
    meal_type: "lunch",
    meal_name: "Protein-Packed Buddha Bowl",
    calories: 520,
    protein_g: 35,
    carbs_g: 55,
    fats_g: 18,
    prep_time_min: 20,
    cook_time_min: 25,
    servings: 1,
    ingredients: [
      { item: "Chickpeas", amount: "1/2 cup", notes: "canned, drained" },
      { item: "Tofu", amount: "4 oz", notes: "extra firm, cubed" },
      { item: "Sweet potato", amount: "1 small", notes: "cubed" },
      { item: "Kale", amount: "2 cups", notes: "chopped" },
      { item: "Quinoa", amount: "1/2 cup", notes: "cooked" },
      { item: "Tahini", amount: "1 tbsp" },
      { item: "Lemon", amount: "1/2", notes: "juiced" }
    ],
    instructions: `1. PREHEAT OVEN: 400°F.

2. PREP SWEET POTATO: Cube, toss with oil and salt. Spread on one half of baking sheet.

3. PREP CHICKPEAS: Drain, rinse, pat very dry. Toss with oil and spices. Spread on other half.

4. ROAST: Bake everything 25-30 minutes, flipping halfway, until crispy.

5. PRESS TOFU: Drain and press tofu to remove water. Cut into cubes.

6. PAN-FRY TOFU: Medium-high heat, crisp all sides. 8-10 minutes total.

7. MASSAGE KALE: Add olive oil and salt to raw kale. Massage with hands until softened.

8. MAKE DRESSING: Whisk tahini, lemon juice, and water until smooth.

9. ASSEMBLE: Quinoa base, arrange toppings in sections. Drizzle with tahini dressing.

PRO TIP: This is a plant-based protein powerhouse. Chickpeas + tofu + quinoa = complete amino acids.`,
    notes: "Vegetarian muscle fuel. Proves you don't need meat every meal to hit protein goals."
  },
  {
    meal_type: "lunch",
    meal_name: "Spicy Ground Turkey Bowl",
    calories: 480,
    protein_g: 40,
    carbs_g: 45,
    fats_g: 16,
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Ground turkey", amount: "6 oz", notes: "93% lean" },
      { item: "Brown rice", amount: "1/2 cup", notes: "cooked" },
      { item: "Black beans", amount: "1/4 cup" },
      { item: "Corn", amount: "1/4 cup" },
      { item: "Salsa", amount: "1/4 cup" },
      { item: "Greek yogurt", amount: "2 tbsp", notes: "instead of sour cream" },
      { item: "Taco seasoning", amount: "1 tbsp" }
    ],
    instructions: `1. BROWN TURKEY: Cook ground turkey in a pan, breaking apart, until no longer pink.

2. SEASON: Add taco seasoning and 1/4 cup water. Simmer until liquid is absorbed.

3. WARM ADDITIONS: Add black beans and corn to the pan. Heat through.

4. PREP BOWL: Add rice as base in a bowl.

5. TOP: Spoon turkey mixture over rice.

6. GARNISH: Add salsa and a dollop of Greek yogurt.

7. OPTIONAL: Shredded lettuce, diced tomatoes, hot sauce.

8. MIX AND EAT: Stir everything together or eat layered.

PRO TIP: This is basically a deconstructed taco. All the flavor, better macros, easier to eat.`,
    notes: "Taco flavor, bowl format. High protein, moderate carbs. Mexican-inspired gains."
  },
  {
    meal_type: "lunch",
    meal_name: "Grilled Chicken Greek Salad",
    calories: 420,
    protein_g: 40,
    carbs_g: 18,
    fats_g: 22,
    prep_time_min: 15,
    cook_time_min: 12,
    servings: 1,
    ingredients: [
      { item: "Chicken breast", amount: "6 oz" },
      { item: "Cucumber", amount: "1/2", notes: "cubed" },
      { item: "Tomato", amount: "1 medium", notes: "cubed" },
      { item: "Red onion", amount: "1/4", notes: "thinly sliced" },
      { item: "Kalamata olives", amount: "8" },
      { item: "Feta cheese", amount: "1 oz" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Red wine vinegar", amount: "1 tbsp" },
      { item: "Oregano", amount: "1/2 tsp" }
    ],
    instructions: `1. SEASON CHICKEN: Salt, pepper, oregano, olive oil. Let marinate if you have time.

2. GRILL: Cook chicken 6-7 minutes per side. Rest before slicing.

3. CHOP VEGGIES: Cube cucumber and tomato. Slice onion thin.

4. COMBINE VEGGIES: Toss cucumber, tomato, onion, and olives in a bowl.

5. DRESS: Add olive oil, vinegar, and oregano. Toss to coat.

6. PLATE: Add dressed vegetables to a plate or bowl.

7. TOP: Arrange sliced chicken on top.

8. FINISH: Crumble feta over everything.

PRO TIP: Let the salad sit 10 minutes before adding chicken. The veggies marinate and get better.`,
    notes: "Classic Greek salad + protein. Mediterranean diet done right. Fresh and satisfying."
  },
  {
    meal_type: "lunch",
    meal_name: "BBQ Chicken Sandwich",
    calories: 520,
    protein_g: 42,
    carbs_g: 48,
    fats_g: 16,
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Chicken breast", amount: "6 oz" },
      { item: "Whole wheat bun", amount: "1" },
      { item: "BBQ sauce", amount: "2 tbsp", notes: "low sugar" },
      { item: "Coleslaw mix", amount: "1/2 cup" },
      { item: "Greek yogurt", amount: "1 tbsp" },
      { item: "Apple cider vinegar", amount: "1 tsp" }
    ],
    instructions: `1. SEASON CHICKEN: Salt and pepper both sides.

2. GRILL/PAN: Cook 6-7 minutes per side until done.

3. BRUSH WITH BBQ: Last minute of cooking, brush BBQ sauce on top and let it caramelize.

4. MAKE SLAW: Mix coleslaw with yogurt and vinegar. Season with salt.

5. REST CHICKEN: 5 minutes off heat.

6. TOAST BUN: Lightly toast for structure.

7. ASSEMBLE: Bottom bun, chicken, more BBQ sauce, slaw, top bun.

8. SERVE: With extra napkins. This gets messy.

PRO TIP: Pound chicken to even thickness before cooking. Even thickness = even cooking = no dry spots.`,
    notes: "BBQ joint vibes, home-cooked nutrition. Creamy slaw, tangy sauce, lean protein."
  },
  {
    meal_type: "lunch",
    meal_name: "Egg Salad Sandwich",
    calories: 420,
    protein_g: 28,
    carbs_g: 32,
    fats_g: 22,
    prep_time_min: 15,
    cook_time_min: 12,
    servings: 1,
    ingredients: [
      { item: "Eggs", amount: "3 large", notes: "hard-boiled" },
      { item: "Egg whites", amount: "2 large", notes: "hard-boiled" },
      { item: "Greek yogurt", amount: "2 tbsp" },
      { item: "Dijon mustard", amount: "1 tsp" },
      { item: "Celery", amount: "1 stalk", notes: "diced fine" },
      { item: "Whole wheat bread", amount: "2 slices" },
      { item: "Lettuce", amount: "2 leaves" }
    ],
    instructions: `1. BOIL EGGS: Place eggs in cold water. Bring to boil. Cover, remove from heat, let sit 12 minutes.

2. ICE BATH: Transfer eggs to ice water. Let cool 5 minutes. This stops cooking and makes peeling easy.

3. PEEL AND CHOP: Peel all eggs. Chop into small pieces.

4. MIX: Combine with yogurt, mustard, celery. Season with salt and pepper.

5. MASH: Use a fork to mash to desired texture. Some like it chunky, some smooth.

6. ASSEMBLE: Toast bread if desired. Add lettuce, then egg salad.

7. TOP: Second slice of bread. Cut in half.

PRO TIP: Using Greek yogurt instead of mayo cuts fat in half and adds protein. Smart substitution.`,
    notes: "Old school lunch, upgraded. Greek yogurt > mayo. Classic comfort, modern macros."
  },
  {
    meal_type: "lunch",
    meal_name: "Teriyaki Salmon Rice Bowl",
    calories: 550,
    protein_g: 38,
    carbs_g: 52,
    fats_g: 20,
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Salmon fillet", amount: "5 oz" },
      { item: "White rice", amount: "3/4 cup", notes: "cooked" },
      { item: "Teriyaki sauce", amount: "2 tbsp", notes: "low sodium" },
      { item: "Broccoli", amount: "1 cup", notes: "steamed" },
      { item: "Edamame", amount: "1/4 cup", notes: "shelled" },
      { item: "Sesame seeds", amount: "1 tsp" },
      { item: "Green onion", amount: "1", notes: "sliced" }
    ],
    instructions: `1. PREP SALMON: Pat dry. Season with salt and pepper.

2. HEAT PAN: Medium-high heat with a small amount of oil.

3. COOK SALMON: Skin-side up, 4 minutes. Flip, 3-4 more minutes.

4. GLAZE: Last minute, pour teriyaki over salmon. Let it bubble and thicken.

5. STEAM BROCCOLI: While salmon cooks, steam broccoli until bright green.

6. WARM EDAMAME: Microwave or pan-warm the edamame.

7. ASSEMBLE: Rice as base. Arrange salmon, broccoli, edamame in sections.

8. DRIZZLE: Extra teriyaki if desired.

9. GARNISH: Sesame seeds and green onions on top.

PRO TIP: Buy teriyaki sauce with less than 5g sugar per serving. Many are sugar bombs.`,
    notes: "Japanese-inspired bowl. Omega-3s, complete protein, and satisfying umami."
  },
  {
    meal_type: "lunch",
    meal_name: "Burrito Bowl",
    calories: 580,
    protein_g: 42,
    carbs_g: 55,
    fats_g: 22,
    prep_time_min: 15,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Chicken breast", amount: "6 oz", notes: "or steak" },
      { item: "Cilantro lime rice", amount: "1/2 cup", notes: "cooked" },
      { item: "Black beans", amount: "1/4 cup" },
      { item: "Corn", amount: "1/4 cup" },
      { item: "Pico de gallo", amount: "1/4 cup" },
      { item: "Guacamole", amount: "2 tbsp" },
      { item: "Cheese", amount: "1 oz", notes: "shredded" }
    ],
    instructions: `1. SEASON PROTEIN: Cumin, chili powder, garlic powder, salt.

2. GRILL: Cook chicken or steak to preferred doneness.

3. REST AND SLICE: Let rest 5 minutes. Slice into strips.

4. MAKE CILANTRO RICE: Mix cooked rice with chopped cilantro and lime juice.

5. WARM BEANS AND CORN: Quick heat in microwave or pan.

6. BUILD BOWL: Rice base, arrange protein, beans, corn in sections.

7. TOP: Add pico de gallo, guacamole, cheese.

8. OPTIONAL: Sour cream or Greek yogurt, hot sauce.

PRO TIP: This is Chipotle at home. Better portion control, fresher ingredients, cheaper cost.`,
    notes: "Chipotle-style at home. All the flavor, you control the portions."
  },
  {
    meal_type: "lunch",
    meal_name: "Cobb Salad",
    calories: 520,
    protein_g: 44,
    carbs_g: 15,
    fats_g: 32,
    prep_time_min: 20,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Grilled chicken", amount: "5 oz", notes: "diced" },
      { item: "Romaine lettuce", amount: "3 cups", notes: "chopped" },
      { item: "Hard-boiled egg", amount: "1", notes: "sliced" },
      { item: "Bacon", amount: "2 strips", notes: "turkey bacon for leaner option" },
      { item: "Avocado", amount: "1/4", notes: "sliced" },
      { item: "Blue cheese", amount: "1 oz", notes: "crumbled" },
      { item: "Cherry tomatoes", amount: "6", notes: "halved" },
      { item: "Red wine vinaigrette", amount: "2 tbsp" }
    ],
    instructions: `1. COOK CHICKEN: Season and grill. Dice into bite-sized pieces.

2. BOIL EGG: Hard boil, cool, peel, slice.

3. COOK BACON: Crisp in pan or oven. Chop.

4. PREP VEGGIES: Chop lettuce, halve tomatoes, slice avocado.

5. ARRANGE: Bed of lettuce. Arrange each ingredient in neat rows across the top.

6. ORDER: Chicken, egg, bacon, tomatoes, avocado, blue cheese.

7. DRESS: Drizzle vinaigrette over everything.

8. SERVE: Present it beautifully, then toss and enjoy.

PRO TIP: Classic presentation is rows of ingredients. Take a photo, then mix it all up.`,
    notes: "The original protein salad. Everything you need, nothing you don't."
  },
  {
    meal_type: "lunch",
    meal_name: "Grilled Fish Tacos",
    calories: 450,
    protein_g: 38,
    carbs_g: 42,
    fats_g: 16,
    prep_time_min: 15,
    cook_time_min: 10,
    servings: 1,
    ingredients: [
      { item: "White fish", amount: "6 oz", notes: "cod, mahi, or tilapia" },
      { item: "Corn tortillas", amount: "3 small" },
      { item: "Cabbage", amount: "1 cup", notes: "shredded" },
      { item: "Lime crema", amount: "2 tbsp", notes: "Greek yogurt + lime juice" },
      { item: "Cilantro", amount: "2 tbsp", notes: "chopped" },
      { item: "Lime wedges", amount: "2" },
      { item: "Cumin", amount: "1/2 tsp" },
      { item: "Chili powder", amount: "1/2 tsp" }
    ],
    instructions: `1. SEASON FISH: Coat with cumin, chili powder, salt, pepper, and a drizzle of oil.

2. HEAT GRILL/PAN: High heat. You want those char marks.

3. COOK FISH: 3-4 minutes per side depending on thickness. Fish should flake easily.

4. MAKE CREMA: Mix Greek yogurt with lime juice and a pinch of salt.

5. WARM TORTILLAS: Char in dry pan 30 seconds per side.

6. SHRED CABBAGE: Thin slices. Toss with a squeeze of lime.

7. ASSEMBLE: Tortilla, cabbage, flaked fish, crema, cilantro.

8. SERVE: With lime wedges for squeezing.

PRO TIP: Fish tacos > beef tacos for protein per calorie. Leaner, lighter, still delicious.`,
    notes: "Light, fresh, high protein. Taste like vacation, feel like fuel."
  },
  {
    meal_type: "lunch",
    meal_name: "Quinoa Chicken Salad",
    calories: 480,
    protein_g: 42,
    carbs_g: 42,
    fats_g: 16,
    prep_time_min: 15,
    cook_time_min: 20,
    servings: 1,
    ingredients: [
      { item: "Chicken breast", amount: "5 oz", notes: "grilled and diced" },
      { item: "Quinoa", amount: "1/2 cup", notes: "cooked" },
      { item: "Cucumber", amount: "1/2", notes: "diced" },
      { item: "Bell pepper", amount: "1/2", notes: "diced" },
      { item: "Cherry tomatoes", amount: "6", notes: "halved" },
      { item: "Feta cheese", amount: "1 oz" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Lemon juice", amount: "1 tbsp" }
    ],
    instructions: `1. COOK QUINOA: Follow package instructions. Fluff with fork and let cool.

2. GRILL CHICKEN: Season and cook. Let rest, then dice.

3. CHOP VEGGIES: Dice cucumber and pepper. Halve tomatoes.

4. COMBINE: In a large bowl, add quinoa, vegetables, and chicken.

5. DRESS: Drizzle olive oil and lemon juice over everything.

6. TOSS: Mix gently to combine all ingredients.

7. TOP: Crumble feta over the top.

8. SEASON: Salt and pepper to taste.

PRO TIP: This travels well. Make Sunday, portion into containers. Cold quinoa salad is refreshing.`,
    notes: "Complete protein from quinoa + chicken. Meal prep champion."
  },
];

// ============================================================
// DINNER TEMPLATES (20 options, 400-900 cal range)  
// ============================================================
const DINNERS: MealTemplate[] = [
  {
    meal_type: "dinner",
    meal_name: "Baked Salmon with Asparagus",
    calories: 520,
    protein_g: 45,
    carbs_g: 25,
    fats_g: 28,
    prep_time_min: 10,
    cook_time_min: 20,
    servings: 1,
    ingredients: [
      { item: "Salmon fillet", amount: "6 oz" },
      { item: "Asparagus", amount: "1 bunch", notes: "trimmed" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Lemon", amount: "1", notes: "half for juice, half for slices" },
      { item: "Garlic powder", amount: "1/2 tsp" },
      { item: "Quinoa", amount: "1/2 cup", notes: "cooked" }
    ],
    instructions: `1. PREHEAT: Oven to 400°F. This is non-negotiable.

2. LINE PAN: Use parchment paper or foil for easy cleanup. Discipline is in the details.

3. PREP ASPARAGUS: Snap off woody ends. They break naturally at the right spot.

4. ARRANGE: Place salmon in center of pan. Spread asparagus around it.

5. SEASON: Drizzle everything with olive oil. Add garlic powder, salt, pepper.

6. LEMON: Squeeze half over salmon. Place lemon slices on top of the fish.

7. BAKE: 15-18 minutes. Salmon should flake easily but still be moist.

8. CHECK ASPARAGUS: Should be bright green and tender-crisp. Fork should pierce but with resistance.

9. SERVE: Plate salmon and asparagus over quinoa. Drizzle any pan juices over top.

PRO TIP: 125°F internal temp = perfectly cooked salmon. Carry-over cooking finishes it. Pink center is the goal.`,
    notes: "Omega-3 bomb. Brain food meets muscle food. One pan, huge nutrition."
  },
  {
    meal_type: "dinner",
    meal_name: "Grilled Steak with Sweet Potato",
    calories: 580,
    protein_g: 45,
    carbs_g: 40,
    fats_g: 26,
    prep_time_min: 15,
    cook_time_min: 25,
    servings: 1,
    ingredients: [
      { item: "Sirloin steak", amount: "6 oz" },
      { item: "Sweet potato", amount: "1 medium" },
      { item: "Green beans", amount: "1 cup" },
      { item: "Butter", amount: "1 tbsp" },
      { item: "Olive oil", amount: "1 tsp" },
      { item: "Salt and pepper", amount: "to taste" }
    ],
    instructions: `1. PREP POTATO: Pierce sweet potato all over with fork. Microwave 8 minutes or bake at 400°F for 45 min.

2. TEMPER STEAK: Take out of fridge 30 minutes before cooking. Room temp = even cooking.

3. SEASON: Pat steak dry. Season generously with salt and pepper. Don't be shy.

4. HEAT PAN: Cast iron or grill. Get it ripping hot. Smoking hot. That's the commitment.

5. SEAR: Place steak in pan. Don't touch it for 4 minutes. Listen to that sizzle.

6. FLIP: One time only. Another 4 minutes for medium-rare (130°F internal).

7. REST: Remove from heat. Let rest 5 minutes. This is essential. Cutting too early = dry steak.

8. STEAM GREEN BEANS: While steak rests, steam until bright green, 4-5 minutes.

9. PLATE: Split sweet potato, add butter. Arrange steak (sliced or whole) and green beans.

PRO TIP: The sear is everything. Don't move the steak. Trust the process. Let the crust develop.`,
    notes: "The king's meal. Steak + complex carbs + vegetables. Primal and complete."
  },
  {
    meal_type: "dinner",
    meal_name: "Lean Ground Turkey Tacos",
    calories: 480,
    protein_g: 40,
    carbs_g: 35,
    fats_g: 20,
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 2,
    ingredients: [
      { item: "Ground turkey", amount: "8 oz", notes: "93% lean" },
      { item: "Corn tortillas", amount: "4 small" },
      { item: "Taco seasoning", amount: "2 tbsp" },
      { item: "Lettuce", amount: "1 cup", notes: "shredded" },
      { item: "Tomato", amount: "1", notes: "diced" },
      { item: "Greek yogurt", amount: "2 tbsp", notes: "instead of sour cream" },
      { item: "Cheese", amount: "1/4 cup", notes: "shredded, optional" }
    ],
    instructions: `1. BROWN TURKEY: Add to hot pan, break apart with wooden spoon. Cook until no pink remains.

2. DRAIN FAT: Even 93% lean releases some fat. Tilt pan and spoon it out.

3. SEASON: Add taco seasoning and 1/4 cup water. Stir well.

4. SIMMER: Cook 3-4 minutes until liquid is mostly absorbed.

5. WARM TORTILLAS: In dry pan 30 seconds per side. Or stack wrapped in damp paper towel, microwave 30 seconds.

6. PREP TOPPINGS: Shred lettuce, dice tomato.

7. ASSEMBLE: Meat on tortilla. Top with lettuce, tomato, cheese, yogurt.

8. SERVE: Two tacos per serving. Squeeze lime if you have it.

PRO TIP: Double the meat batch. Use extras for nachos, salads, or burrito bowls later in the week.`,
    notes: "Taco Tuesday, every day. Turkey keeps it lean. Tradition meets transformation."
  },
  {
    meal_type: "dinner",
    meal_name: "Chicken Breast with Rice and Veggies",
    calories: 500,
    protein_g: 48,
    carbs_g: 45,
    fats_g: 14,
    prep_time_min: 10,
    cook_time_min: 20,
    servings: 1,
    ingredients: [
      { item: "Chicken breast", amount: "7 oz" },
      { item: "Jasmine rice", amount: "1/2 cup", notes: "cooked" },
      { item: "Mixed vegetables", amount: "1.5 cups", notes: "broccoli, carrots, peppers" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Italian seasoning", amount: "1 tsp" },
      { item: "Lemon wedge", amount: "1" }
    ],
    instructions: `1. PREP CHICKEN: Pound to even thickness if needed. Season with Italian seasoning, salt, pepper.

2. HEAT PAN: Medium-high heat, add olive oil.

3. COOK CHICKEN: 6-7 minutes per side. Internal temp 165°F. Juices run clear.

4. REST: Remove from pan, let rest 5 minutes before slicing.

5. SAME PAN: Add vegetables to the chicken pan. Sauté in leftover chicken juices.

6. COOK VEGGIES: 5-6 minutes, stirring occasionally, until tender-crisp.

7. PREP RICE: Use pre-cooked or microwave rice pouches for speed.

8. PLATE: Rice as base, sliced chicken on top, vegetables on side.

9. FINISH: Squeeze lemon over everything. Salt to taste.

PRO TIP: This is THE meal of bodybuilding. Simple, effective, proven. Millions of physiques built on this.`,
    notes: "The bodybuilder's staple. Simple, effective, proven. This is how champions eat."
  },
  {
    meal_type: "dinner",
    meal_name: "Shrimp Stir-Fry",
    calories: 420,
    protein_g: 38,
    carbs_g: 40,
    fats_g: 14,
    prep_time_min: 15,
    cook_time_min: 10,
    servings: 1,
    ingredients: [
      { item: "Shrimp", amount: "8 oz", notes: "peeled and deveined" },
      { item: "Brown rice", amount: "1/2 cup", notes: "cooked" },
      { item: "Mixed vegetables", amount: "2 cups", notes: "snap peas, peppers, broccoli" },
      { item: "Soy sauce", amount: "2 tbsp", notes: "low sodium" },
      { item: "Sesame oil", amount: "1 tbsp" },
      { item: "Garlic", amount: "3 cloves", notes: "minced" },
      { item: "Ginger", amount: "1 tbsp", notes: "minced" }
    ],
    instructions: `1. PREP SHRIMP: Pat dry, season with salt.

2. HEAT WOK: High heat until smoking. Add sesame oil.

3. COOK SHRIMP: 1-2 minutes per side. They curl and turn pink when done. Remove immediately.

4. ADD AROMATICS: Garlic and ginger in the wok. 30 seconds until fragrant.

5. ADD VEGGIES: Stir constantly, cook 3-4 minutes until tender-crisp.

6. RETURN SHRIMP: Add shrimp back, pour soy sauce over everything.

7. TOSS: 30 seconds more to combine and coat.

8. SERVE: Immediately over rice. Stir-fry waits for no one.

PRO TIP: Have everything prepped before you start cooking. Stir-fry happens fast. No time to chop.`,
    notes: "Quick-cooking protein powerhouse. Shrimp cooks in minutes. Wok mastery."
  },
  {
    meal_type: "dinner",
    meal_name: "Baked Chicken Thighs",
    calories: 520,
    protein_g: 42,
    carbs_g: 35,
    fats_g: 24,
    prep_time_min: 10,
    cook_time_min: 35,
    servings: 1,
    ingredients: [
      { item: "Chicken thighs", amount: "8 oz", notes: "bone-in, skin-on" },
      { item: "Baby potatoes", amount: "6 oz", notes: "halved" },
      { item: "Brussels sprouts", amount: "1 cup", notes: "halved" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Paprika", amount: "1 tsp" },
      { item: "Garlic powder", amount: "1/2 tsp" },
      { item: "Rosemary", amount: "1 tsp", notes: "dried" }
    ],
    instructions: `1. PREHEAT: Oven to 425°F. High heat = crispy skin.

2. PREP VEGETABLES: Halve potatoes and Brussels sprouts. Toss with half the oil and seasonings.

3. SEASON CHICKEN: Pat dry. Rub with remaining oil, paprika, garlic powder, rosemary, salt, pepper.

4. ARRANGE: Spread vegetables on sheet pan. Nestle chicken thighs on top, skin-side up.

5. BAKE: 35-40 minutes until chicken reaches 175°F and skin is crispy.

6. CHECK VEGGIES: Should be golden and fork-tender. Stir halfway through if needed.

7. REST: Let chicken rest 5 minutes.

8. SERVE: Plate together. Drizzle any pan juices over top.

PRO TIP: Don't skip the skin. Yes it's higher calorie, but it keeps the meat moist and flavor is unmatched.`,
    notes: "One pan, hands-off cooking. Crispy skin, juicy meat, roasted vegetables."
  },
  {
    meal_type: "dinner",
    meal_name: "Turkey Meatloaf",
    calories: 480,
    protein_g: 42,
    carbs_g: 32,
    fats_g: 20,
    prep_time_min: 15,
    cook_time_min: 45,
    servings: 4,
    ingredients: [
      { item: "Ground turkey", amount: "1.5 lbs", notes: "93% lean" },
      { item: "Oats", amount: "1/2 cup", notes: "as binder" },
      { item: "Egg", amount: "1 large" },
      { item: "Onion", amount: "1/2", notes: "diced fine" },
      { item: "Garlic", amount: "2 cloves", notes: "minced" },
      { item: "Ketchup", amount: "1/4 cup", notes: "for glaze" },
      { item: "Worcestershire sauce", amount: "1 tbsp" }
    ],
    instructions: `1. PREHEAT: Oven to 375°F.

2. SAUTÉ AROMATICS: Cook onion and garlic until soft. Let cool slightly.

3. COMBINE: In large bowl, mix turkey, oats, egg, cooled onion, garlic, Worcestershire, salt, and pepper.

4. MIX BY HAND: Use your hands. Mix until just combined. Don't overwork or it gets tough.

5. SHAPE: Form into a loaf on a lined baking sheet. Make it compact.

6. GLAZE: Spread ketchup over the top.

7. BAKE: 45 minutes until internal temp is 165°F.

8. REST: Let sit 10 minutes before slicing. It will hold together better.

9. SLICE AND SERVE: 4 thick slices. Pair with mashed potatoes or vegetables.

PRO TIP: Make a double batch. Slice extras for next-day sandwiches. Cold meatloaf is underrated.`,
    notes: "Comfort food made lean. Feeds the family or preps the week. Home cooking at its best."
  },
  {
    meal_type: "dinner",
    meal_name: "Cod with Lemon Butter",
    calories: 380,
    protein_g: 40,
    carbs_g: 18,
    fats_g: 18,
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Cod fillet", amount: "6 oz" },
      { item: "Butter", amount: "1.5 tbsp" },
      { item: "Lemon", amount: "1", notes: "juiced and zested" },
      { item: "Capers", amount: "1 tbsp" },
      { item: "Fresh parsley", amount: "2 tbsp", notes: "chopped" },
      { item: "Zucchini", amount: "1 medium", notes: "sliced" }
    ],
    instructions: `1. PAT FISH DRY: Moisture is the enemy of a good sear. Season with salt and pepper.

2. HEAT PAN: Medium-high heat, add half the butter.

3. SEAR COD: Place presentation-side down first. Cook 4 minutes without moving.

4. FLIP CAREFULLY: Fish is delicate. Use a spatula. Cook 3-4 more minutes.

5. REMOVE FISH: Set aside on plate.

6. MAKE SAUCE: Same pan, add remaining butter, lemon juice, zest, and capers.

7. SIMMER: Let bubble 1 minute. Add parsley.

8. SAUTÉ ZUCCHINI: Quick sear in any remaining sauce, 2-3 minutes.

9. PLATE: Fish on zucchini, spoon lemon butter sauce over top.

PRO TIP: Don't move the fish during cooking. Let the crust develop. Patience creates perfection.`,
    notes: "Light, elegant, restaurant-quality. Delicate fish, rich butter sauce."
  },
  {
    meal_type: "dinner",
    meal_name: "Pork Tenderloin",
    calories: 450,
    protein_g: 42,
    carbs_g: 35,
    fats_g: 16,
    prep_time_min: 15,
    cook_time_min: 25,
    servings: 2,
    ingredients: [
      { item: "Pork tenderloin", amount: "12 oz" },
      { item: "Apple", amount: "1", notes: "sliced" },
      { item: "Butternut squash", amount: "1 cup", notes: "cubed" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Dijon mustard", amount: "1 tbsp" },
      { item: "Maple syrup", amount: "1 tbsp" },
      { item: "Thyme", amount: "1 tsp", notes: "dried" }
    ],
    instructions: `1. PREHEAT: Oven to 400°F.

2. PREP SQUASH: Cube butternut squash. Toss with half the oil and salt.

3. ROAST SQUASH: Start it first - 20 minutes while you prep the rest.

4. MAKE GLAZE: Mix mustard, maple syrup, and thyme.

5. SEASON PORK: Salt and pepper all over.

6. SEAR: Hot pan, remaining oil. Sear tenderloin on all sides, 2-3 minutes total.

7. GLAZE AND ROAST: Brush glaze on pork. Add to oven with squash. Roast 15-18 minutes until 145°F.

8. ADD APPLES: Last 8 minutes, add apple slices to the pan.

9. REST AND SLICE: Rest pork 5 minutes. Slice into medallions.

PRO TIP: Pork tenderloin is as lean as chicken breast. Same protein, more flavor. Underrated cut.`,
    notes: "Lean as chicken, more flavorful. Fall flavors year-round."
  },
  {
    meal_type: "dinner",
    meal_name: "Stuffed Bell Peppers",
    calories: 480,
    protein_g: 35,
    carbs_g: 45,
    fats_g: 18,
    prep_time_min: 20,
    cook_time_min: 40,
    servings: 2,
    ingredients: [
      { item: "Bell peppers", amount: "4 large" },
      { item: "Lean ground beef", amount: "8 oz", notes: "90% lean" },
      { item: "Brown rice", amount: "1 cup", notes: "cooked" },
      { item: "Diced tomatoes", amount: "1 can", notes: "14 oz" },
      { item: "Italian seasoning", amount: "1 tsp" },
      { item: "Mozzarella cheese", amount: "1/2 cup", notes: "shredded" }
    ],
    instructions: `1. PREHEAT: Oven to 375°F.

2. PREP PEPPERS: Cut off tops, remove seeds and membranes. Save tops for lids if desired.

3. BROWN BEEF: Cook in pan until no longer pink. Drain excess fat.

4. COMBINE FILLING: Mix beef, cooked rice, half the tomatoes, Italian seasoning, salt.

5. STUFF PEPPERS: Pack filling tightly into each pepper.

6. ARRANGE: Stand peppers in baking dish. Pour remaining tomatoes around base.

7. COVER: Foil over the dish. Bake 30 minutes.

8. UNCOVER: Remove foil. Top each pepper with cheese.

9. FINISH: Bake uncovered 10 more minutes until cheese melts and peppers are tender.

PRO TIP: Make on Sunday. Reheat individual peppers all week. Perfect meal prep vessel.`,
    notes: "Edible container. Built-in portion control. Classic comfort, complete nutrition."
  },
  {
    meal_type: "dinner",
    meal_name: "Herb Roasted Chicken",
    calories: 480,
    protein_g: 52,
    carbs_g: 8,
    fats_g: 28,
    prep_time_min: 15,
    cook_time_min: 45,
    servings: 1,
    ingredients: [
      { item: "Chicken leg quarter", amount: "10 oz", notes: "thigh and drumstick" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Rosemary", amount: "1 tbsp", notes: "fresh, chopped" },
      { item: "Thyme", amount: "1 tbsp", notes: "fresh" },
      { item: "Garlic", amount: "4 cloves", notes: "whole" },
      { item: "Lemon", amount: "1/2" }
    ],
    instructions: `1. PREHEAT: Oven to 425°F.

2. PREP CHICKEN: Pat dry. Loosen skin gently without removing.

3. HERB BUTTER: Mix soft olive oil with rosemary, thyme, salt.

4. SEASON UNDER SKIN: Push herb mixture under the skin directly onto meat.

5. SEASON OUTSIDE: More salt and pepper on the skin.

6. ARRANGE: Place on sheet pan with garlic cloves around it.

7. ROAST: 40-45 minutes until skin is crispy and internal temp is 175°F.

8. REST: 5 minutes before serving.

9. SERVE: Squeeze lemon over. Eat the roasted garlic spread on the chicken.

PRO TIP: Dry skin = crispy skin. Leave chicken uncovered in fridge overnight before roasting.`,
    notes: "Whole leg quarter. Economical, flavorful, feeds the soul."
  },
  {
    meal_type: "dinner",
    meal_name: "Black Bean and Quinoa Bowl",
    calories: 450,
    protein_g: 22,
    carbs_g: 68,
    fats_g: 12,
    prep_time_min: 10,
    cook_time_min: 20,
    servings: 1,
    ingredients: [
      { item: "Quinoa", amount: "3/4 cup", notes: "cooked" },
      { item: "Black beans", amount: "1/2 cup", notes: "canned, drained" },
      { item: "Corn", amount: "1/3 cup" },
      { item: "Avocado", amount: "1/4" },
      { item: "Salsa", amount: "1/4 cup" },
      { item: "Lime", amount: "1/2", notes: "juiced" },
      { item: "Cilantro", amount: "2 tbsp", notes: "chopped" },
      { item: "Cumin", amount: "1/2 tsp" }
    ],
    instructions: `1. COOK QUINOA: Follow package directions. Fluff with fork.

2. SEASON QUINOA: Stir in cumin, lime juice, and salt while warm.

3. WARM BEANS AND CORN: Heat in microwave or small pan.

4. SEASON BEANS: Add a pinch of cumin and salt.

5. BUILD BOWL: Quinoa as base, then beans and corn.

6. TOP: Add salsa and sliced avocado.

7. GARNISH: Fresh cilantro on top.

8. SQUEEZE LIME: Extra lime over everything.

PRO TIP: Quinoa + black beans = complete plant protein. All essential amino acids covered.`,
    notes: "Plant-based power bowl. Complete protein without meat. Mexican-inspired comfort."
  },
  {
    meal_type: "dinner",
    meal_name: "Garlic Butter Shrimp Pasta",
    calories: 550,
    protein_g: 38,
    carbs_g: 55,
    fats_g: 18,
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Shrimp", amount: "6 oz", notes: "peeled and deveined" },
      { item: "Whole wheat pasta", amount: "2 oz", notes: "dry" },
      { item: "Butter", amount: "1.5 tbsp" },
      { item: "Garlic", amount: "4 cloves", notes: "minced" },
      { item: "White wine", amount: "1/4 cup", notes: "or chicken broth" },
      { item: "Lemon juice", amount: "1 tbsp" },
      { item: "Parsley", amount: "2 tbsp", notes: "chopped" },
      { item: "Red pepper flakes", amount: "1/4 tsp" }
    ],
    instructions: `1. BOIL PASTA: Salt water generously. Cook until al dente. Save 1/2 cup pasta water.

2. SEASON SHRIMP: Salt and pepper. Pat dry.

3. SEAR SHRIMP: Hot pan, half the butter. Cook 2 minutes per side. Remove and set aside.

4. COOK GARLIC: Same pan, remaining butter, add garlic. 30 seconds until fragrant.

5. DEGLAZE: Add wine or broth. Scrape up any brown bits. Let reduce by half.

6. ADD LEMON: Squeeze in lemon juice, add red pepper flakes.

7. TOSS PASTA: Add drained pasta to sauce. Add pasta water if needed to loosen.

8. RETURN SHRIMP: Toss shrimp with pasta.

9. FINISH: Fresh parsley over top. Serve immediately.

PRO TIP: Don't overcook shrimp. They're done when they curl into a C. An O means overdone.`,
    notes: "Restaurant-quality in 20 minutes. Garlic butter makes everything better."
  },
  {
    meal_type: "dinner",
    meal_name: "Chicken Fajita Bowl",
    calories: 520,
    protein_g: 45,
    carbs_g: 48,
    fats_g: 18,
    prep_time_min: 15,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Chicken breast", amount: "6 oz", notes: "sliced thin" },
      { item: "Bell peppers", amount: "2", notes: "sliced" },
      { item: "Onion", amount: "1/2", notes: "sliced" },
      { item: "Brown rice", amount: "1/2 cup", notes: "cooked" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Fajita seasoning", amount: "2 tbsp" },
      { item: "Lime", amount: "1" },
      { item: "Sour cream or Greek yogurt", amount: "2 tbsp" }
    ],
    instructions: `1. SLICE CHICKEN: Thin strips against the grain for tenderness.

2. SEASON: Toss chicken with fajita seasoning and half the lime juice.

3. HEAT PAN: Large skillet or griddle, high heat, add oil.

4. COOK CHICKEN: Spread in single layer. Don't stir for 3 minutes. Get that char.

5. FLIP AND FINISH: Stir, cook 2-3 more minutes until done. Remove.

6. COOK VEGETABLES: Same pan, add peppers and onions. Cook 4-5 minutes until charred but still crisp.

7. SEASON VEGGIES: Light salt, remaining lime juice.

8. BUILD BOWL: Rice base, arrange chicken and vegetables.

9. GARNISH: Sour cream or yogurt, fresh cilantro, extra lime.

PRO TIP: High heat is key for fajitas. You want that sizzle and char. Restaurant-style at home.`,
    notes: "Sizzling fajita flavor without the tortillas. Bowl format = better portions."
  },
  {
    meal_type: "dinner",
    meal_name: "Honey Garlic Salmon",
    calories: 480,
    protein_g: 42,
    carbs_g: 28,
    fats_g: 22,
    prep_time_min: 10,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Salmon fillet", amount: "6 oz" },
      { item: "Honey", amount: "2 tbsp" },
      { item: "Soy sauce", amount: "2 tbsp", notes: "low sodium" },
      { item: "Garlic", amount: "3 cloves", notes: "minced" },
      { item: "Rice", amount: "1/2 cup", notes: "cooked" },
      { item: "Bok choy", amount: "2 heads", notes: "halved" }
    ],
    instructions: `1. MAKE GLAZE: Whisk honey, soy sauce, and garlic together.

2. MARINATE: Pour half over salmon. Let sit while pan heats.

3. HEAT PAN: Medium-high heat, add a small amount of oil.

4. SEAR SALMON: Place marinated side down. Cook 4 minutes.

5. FLIP AND GLAZE: Flip salmon, brush with remaining glaze.

6. FINISH: Cook 3-4 more minutes, basting with glaze that collects in pan.

7. SAUTÉ BOK CHOY: Same pan or separate. Quick sear with garlic and soy.

8. SERVE: Salmon over rice with bok choy on side.

PRO TIP: Don't skip the final basting. Building layers of glaze = restaurant-quality result.`,
    notes: "Sweet and savory glazed salmon. Asian-inspired, omega-3 rich."
  },
  {
    meal_type: "dinner",
    meal_name: "Lean Beef Burger",
    calories: 550,
    protein_g: 42,
    carbs_g: 38,
    fats_g: 26,
    prep_time_min: 10,
    cook_time_min: 12,
    servings: 1,
    ingredients: [
      { item: "Ground beef", amount: "6 oz", notes: "90% lean" },
      { item: "Whole wheat bun", amount: "1" },
      { item: "Lettuce", amount: "2 leaves" },
      { item: "Tomato", amount: "2 slices" },
      { item: "Onion", amount: "2 slices" },
      { item: "Cheese", amount: "1 slice", notes: "optional" },
      { item: "Mustard", amount: "1 tbsp" },
      { item: "Pickles", amount: "3 slices" }
    ],
    instructions: `1. FORM PATTY: Shape beef into patty slightly larger than bun (shrinks while cooking).

2. SEASON: Generously salt and pepper both sides. Press a dimple in center.

3. HEAT GRILL/PAN: High heat. Get it ripping hot.

4. COOK: 4 minutes first side. Flip once. 3-4 more minutes for medium.

5. CHEESE: Last minute, add cheese if using. Cover to melt.

6. REST: Let patty rest 2 minutes.

7. TOAST BUN: Lightly toast for structure and flavor.

8. ASSEMBLE: Bottom bun, mustard, patty, lettuce, tomato, onion, pickles, top bun.

9. SERVE: With a side salad instead of fries to keep it lean.

PRO TIP: Don't press the burger while cooking. You're pushing out the juices. Let it be.`,
    notes: "The American classic, done lean. 90% lean beef still has plenty of flavor."
  },
  {
    meal_type: "dinner",
    meal_name: "Chicken Tikka Masala",
    calories: 520,
    protein_g: 45,
    carbs_g: 40,
    fats_g: 18,
    prep_time_min: 20,
    cook_time_min: 30,
    servings: 2,
    ingredients: [
      { item: "Chicken thighs", amount: "12 oz", notes: "boneless, cubed" },
      { item: "Greek yogurt", amount: "1/2 cup" },
      { item: "Tomato sauce", amount: "1 cup" },
      { item: "Heavy cream", amount: "1/4 cup", notes: "or coconut cream" },
      { item: "Garam masala", amount: "2 tbsp" },
      { item: "Basmati rice", amount: "1 cup", notes: "cooked" },
      { item: "Garlic", amount: "4 cloves" },
      { item: "Ginger", amount: "1 tbsp" }
    ],
    instructions: `1. MARINATE: Mix chicken with half the yogurt and 1 tbsp garam masala. 30 min minimum.

2. COOK CHICKEN: Hot pan, sear marinated chicken until browned and cooked. Set aside.

3. SAUTÉ AROMATICS: Same pan, add garlic and ginger. Cook 1 minute.

4. ADD SPICES: Remaining garam masala, cook 30 seconds until fragrant.

5. ADD TOMATOES: Pour in tomato sauce. Simmer 10 minutes.

6. ADD CREAM: Stir in cream and remaining yogurt. Simmer 5 minutes.

7. RETURN CHICKEN: Add chicken to sauce. Cook 5 more minutes.

8. SEASON: Salt to taste. Adjust spices if needed.

9. SERVE: Over basmati rice. Garnish with fresh cilantro.

PRO TIP: Marinating is not optional. The yogurt tenderizes. The spices penetrate. Respect the process.`,
    notes: "Indian restaurant favorite, homemade. Creamy, spiced, satisfying. Feeds the soul."
  },
  {
    meal_type: "dinner",
    meal_name: "Blackened Fish Tacos",
    calories: 420,
    protein_g: 36,
    carbs_g: 42,
    fats_g: 14,
    prep_time_min: 15,
    cook_time_min: 10,
    servings: 1,
    ingredients: [
      { item: "White fish", amount: "6 oz", notes: "tilapia or cod" },
      { item: "Corn tortillas", amount: "3 small" },
      { item: "Blackening seasoning", amount: "2 tbsp" },
      { item: "Cabbage slaw", amount: "1 cup" },
      { item: "Lime crema", amount: "2 tbsp" },
      { item: "Cilantro", amount: "for garnish" },
      { item: "Lime wedges", amount: "2" }
    ],
    instructions: `1. COAT FISH: Pat fish dry. Press blackening seasoning onto both sides generously.

2. HEAT PAN: Cast iron preferred. Get it smoking hot. Add a small amount of oil.

3. BLACKEN: Cook fish 3-4 minutes per side. Spices should char and create a crust.

4. REST AND FLAKE: Let fish rest 2 minutes, then flake into chunks.

5. WARM TORTILLAS: Char in dry pan 30 seconds per side.

6. PREP SLAW: Toss cabbage with lime juice and a pinch of salt.

7. ASSEMBLE: Tortilla, slaw, flaked fish, crema, cilantro.

8. SERVE: With lime wedges for squeezing.

PRO TIP: Blackening creates smoke. Turn on your vent. Open a window. Worth it.`,
    notes: "Cajun-spiced fish tacos. Smoky, spicy, fresh. Louisiana meets Mexico."
  },
  {
    meal_type: "dinner",
    meal_name: "Mediterranean Lamb Chops",
    calories: 520,
    protein_g: 40,
    carbs_g: 18,
    fats_g: 32,
    prep_time_min: 15,
    cook_time_min: 15,
    servings: 1,
    ingredients: [
      { item: "Lamb chops", amount: "8 oz", notes: "2-3 chops" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Garlic", amount: "3 cloves", notes: "minced" },
      { item: "Rosemary", amount: "2 sprigs" },
      { item: "Lemon", amount: "1/2", notes: "juiced" },
      { item: "Greek salad", amount: "1.5 cups", notes: "cucumber, tomato, feta, olives" }
    ],
    instructions: `1. TEMPER LAMB: Remove from fridge 30 minutes before cooking.

2. SEASON: Generously salt and pepper both sides.

3. HEAT PAN: Cast iron, high heat, add olive oil.

4. SEAR: Place chops in pan. Don't touch for 3-4 minutes.

5. FLIP: Turn once. Add garlic and rosemary to pan. Cook 3-4 more minutes.

6. BASTE: Tilt pan, spoon hot oil and aromatics over lamb.

7. CHECK TEMP: 130°F for medium-rare, 140°F for medium.

8. REST: 5 minutes off heat. Tent with foil.

9. SERVE: Squeeze lemon over lamb. Serve with Greek salad.

PRO TIP: Lamb is best medium-rare to medium. Overcooked lamb = gamey taste. Respect the meat.`,
    notes: "Elegant yet primal. Lamb is underrated protein. Greek flavors complement perfectly."
  },
  {
    meal_type: "dinner",
    meal_name: "Sheet Pan Chicken Sausage and Vegetables",
    calories: 450,
    protein_g: 35,
    carbs_g: 35,
    fats_g: 20,
    prep_time_min: 10,
    cook_time_min: 30,
    servings: 1,
    ingredients: [
      { item: "Chicken sausage", amount: "2 links", notes: "pre-cooked" },
      { item: "Bell peppers", amount: "2", notes: "chunked" },
      { item: "Zucchini", amount: "1 medium", notes: "chunked" },
      { item: "Red onion", amount: "1/2", notes: "chunked" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Italian seasoning", amount: "1 tsp" },
      { item: "Garlic powder", amount: "1/2 tsp" }
    ],
    instructions: `1. PREHEAT: Oven to 425°F.

2. PREP VEGETABLES: Cut peppers, zucchini, and onion into similar sized chunks.

3. SEASON VEGGIES: Toss with olive oil, Italian seasoning, garlic powder, salt, pepper.

4. SLICE SAUSAGE: Cut into 1/2 inch coins.

5. ARRANGE: Spread vegetables and sausage on sheet pan in single layer.

6. ROAST: 25-30 minutes, stirring halfway, until vegetables are charred and sausage is crispy.

7. SERVE: Directly from pan or transfer to plate.

PRO TIP: Single layer = even browning. Crowded pan = steaming. Space is essential.`,
    notes: "Minimal prep, minimal cleanup. Roasted everything. Weeknight warrior meal."
  },
];

// ============================================================
// SNACK TEMPLATES (15 options, 150-350 cal range)
// ============================================================
const SNACKS: MealTemplate[] = [
  {
    meal_type: "snack",
    meal_name: "Protein Shake",
    calories: 200,
    protein_g: 25,
    carbs_g: 15,
    fats_g: 5,
    prep_time_min: 2,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Protein powder", amount: "1 scoop" },
      { item: "Banana", amount: "1/2 small" },
      { item: "Unsweetened almond milk", amount: "1 cup" },
      { item: "Ice", amount: "1/2 cup" }
    ],
    instructions: `1. LIQUID FIRST: Add almond milk to blender.

2. PROTEIN: Add protein powder on top.

3. FRUIT: Add banana.

4. ICE: Add ice last.

5. BLEND: 30-45 seconds until smooth.

6. POUR AND DRINK: Immediately. Don't let it separate.

PRO TIP: Freeze banana slices for thicker, colder shake. Tastes like a milkshake.`,
    notes: "The classic post-workout shake. Fast, effective, tastes good."
  },
  {
    meal_type: "snack",
    meal_name: "Hard Boiled Eggs & Almonds",
    calories: 220,
    protein_g: 18,
    carbs_g: 5,
    fats_g: 16,
    prep_time_min: 1,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Hard boiled eggs", amount: "2 large" },
      { item: "Almonds", amount: "15", notes: "raw or roasted" },
      { item: "Salt", amount: "pinch" }
    ],
    instructions: `1. GRAB EGGS: Already prepped in your fridge (if you're disciplined).

2. PEEL: Quick, efficient.

3. SALT: Light sprinkle on eggs.

4. PAIR WITH ALMONDS: Eat together or alternate.

5. DONE: 220 calories, 18g protein, takes 2 minutes.

PRO TIP: Boil a dozen eggs on Sunday. Store in fridge. Grab-and-go protein all week.`,
    notes: "Protein + healthy fats. Portable. The ultimate on-the-go snack."
  },
  {
    meal_type: "snack",
    meal_name: "Cottage Cheese & Fruit",
    calories: 180,
    protein_g: 20,
    carbs_g: 18,
    fats_g: 3,
    prep_time_min: 2,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Cottage cheese", amount: "1 cup", notes: "2% fat" },
      { item: "Pineapple chunks", amount: "1/2 cup" },
      { item: "Cinnamon", amount: "dash" }
    ],
    instructions: `1. SCOOP: Add cottage cheese to bowl.

2. TOP: Add pineapple chunks.

3. SEASON: Dust with cinnamon.

4. MIX OR EAT LAYERED: Your preference.

PRO TIP: Great before bed. Casein protein feeds muscles slowly while you sleep.`,
    notes: "Casein protein for slow digestion. Sweet and savory. Gut-healthy."
  },
  {
    meal_type: "snack",
    meal_name: "Apple with Peanut Butter",
    calories: 250,
    protein_g: 8,
    carbs_g: 30,
    fats_g: 14,
    prep_time_min: 2,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Apple", amount: "1 medium" },
      { item: "Natural peanut butter", amount: "2 tbsp" }
    ],
    instructions: `1. SLICE APPLE: Wedges or rounds, your call.

2. DIP: Each slice into peanut butter.

3. ENJOY: Simple, satisfying, effective.

PRO TIP: Keep peanut butter packets in your bag. Apples travel well. Snack anywhere.`,
    notes: "Classic combination. Fiber + healthy fats + natural sweetness."
  },
  {
    meal_type: "snack",
    meal_name: "Greek Yogurt with Honey",
    calories: 180,
    protein_g: 17,
    carbs_g: 22,
    fats_g: 3,
    prep_time_min: 1,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Greek yogurt", amount: "1 cup", notes: "plain, 0%" },
      { item: "Honey", amount: "1 tbsp" },
      { item: "Walnuts", amount: "5", notes: "chopped, optional" }
    ],
    instructions: `1. SCOOP: Greek yogurt into bowl.

2. DRIZZLE: Honey over top.

3. ADD CRUNCH: Chopped walnuts if using.

4. EAT: Pure, simple protein.

PRO TIP: Buy large tubs of plain yogurt. Add your own honey. Way cheaper than flavored.`,
    notes: "High protein, natural sweetness. Control the sugar, maximize the gains."
  },
  {
    meal_type: "snack",
    meal_name: "Turkey Roll-Ups",
    calories: 150,
    protein_g: 22,
    carbs_g: 5,
    fats_g: 5,
    prep_time_min: 5,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Turkey breast slices", amount: "4 oz" },
      { item: "Cheese", amount: "1 slice" },
      { item: "Mustard", amount: "1 tsp" },
      { item: "Spinach leaves", amount: "handful" }
    ],
    instructions: `1. LAY TURKEY: Spread slices flat, overlapping slightly.

2. SPREAD MUSTARD: Thin layer across turkey.

3. ADD CHEESE: Cut slice to fit across turkey.

4. ADD SPINACH: Layer of greens.

5. ROLL: Tight roll from one end.

6. SECURE: Toothpicks if needed. Or just eat immediately.

PRO TIP: Make several, store in container. Grab them all week.`,
    notes: "No carbs, pure protein. Like a sandwich without the bread."
  },
  {
    meal_type: "snack",
    meal_name: "Protein Energy Balls",
    calories: 180,
    protein_g: 10,
    carbs_g: 20,
    fats_g: 8,
    prep_time_min: 15,
    cook_time_min: 0,
    servings: 4,
    ingredients: [
      { item: "Rolled oats", amount: "1 cup" },
      { item: "Peanut butter", amount: "1/2 cup" },
      { item: "Honey", amount: "3 tbsp" },
      { item: "Protein powder", amount: "1/2 scoop" },
      { item: "Mini chocolate chips", amount: "2 tbsp" }
    ],
    instructions: `1. COMBINE: Mix all ingredients in a bowl.

2. MIX WELL: Use hands if needed. Should form a dough.

3. REFRIGERATE: 15 minutes to firm up.

4. ROLL: Form into 8-10 balls, about 1 inch each.

5. STORE: Fridge for up to 1 week.

6. GRAB: 2-3 balls per serving.

PRO TIP: Freeze them. They last longer and have a great texture cold.`,
    notes: "Meal prep snack. Make once, eat all week. Natural energy."
  },
  {
    meal_type: "snack",
    meal_name: "Edamame",
    calories: 190,
    protein_g: 17,
    carbs_g: 14,
    fats_g: 8,
    prep_time_min: 2,
    cook_time_min: 3,
    servings: 1,
    ingredients: [
      { item: "Edamame", amount: "1 cup", notes: "in pods, frozen" },
      { item: "Sea salt", amount: "to taste" }
    ],
    instructions: `1. COOK: Microwave frozen edamame 2-3 minutes. Or boil 4 minutes.

2. DRAIN: Shake off excess water.

3. SEASON: Sprinkle generously with sea salt.

4. EAT: Pop beans out of pods with your teeth.

5. DISCARD PODS: They're not edible.

PRO TIP: Keep frozen bags in your freezer. Ready in minutes. Complete plant protein.`,
    notes: "Complete plant protein. Fun to eat. Japanese snack wisdom."
  },
  {
    meal_type: "snack",
    meal_name: "Beef Jerky",
    calories: 180,
    protein_g: 24,
    carbs_g: 6,
    fats_g: 6,
    prep_time_min: 0,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Beef jerky", amount: "2 oz", notes: "low sodium preferred" }
    ],
    instructions: `1. OPEN: Package.

2. EAT: Chew thoroughly. Enjoy.

3. HYDRATE: Jerky is salty. Drink water.

PRO TIP: Read labels. Some jerkies are loaded with sugar. Find ones with <5g sugar.`,
    notes: "Portable protein. No prep needed. Ancient snack technology."
  },
  {
    meal_type: "snack",
    meal_name: "Celery with Almond Butter",
    calories: 200,
    protein_g: 6,
    carbs_g: 10,
    fats_g: 18,
    prep_time_min: 3,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Celery stalks", amount: "4 large" },
      { item: "Almond butter", amount: "2 tbsp" }
    ],
    instructions: `1. WASH CELERY: Clean and dry.

2. CUT: Into 4-inch pieces if desired, or leave whole.

3. FILL: Spread almond butter in the celery channel.

4. EAT: The crunch + creamy combo is satisfying.

PRO TIP: "Ants on a log" if you add raisins. Skip the raisins to cut sugar.`,
    notes: "Crunchy, creamy, low carb. Childhood snack, adult nutrition."
  },
  {
    meal_type: "snack",
    meal_name: "Tuna Packet with Crackers",
    calories: 220,
    protein_g: 28,
    carbs_g: 15,
    fats_g: 6,
    prep_time_min: 2,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Tuna packet", amount: "1", notes: "flavored or plain" },
      { item: "Whole wheat crackers", amount: "6-8" }
    ],
    instructions: `1. OPEN PACKET: Tear open. No draining needed with packets.

2. SCOOP: Use crackers to scoop tuna.

3. EAT: Repeat until gone.

PRO TIP: Keep tuna packets in your desk, car, gym bag. Emergency protein anywhere.`,
    notes: "No prep protein. Packets are convenient. Desk drawer essential."
  },
  {
    meal_type: "snack",
    meal_name: "Chocolate Protein Pudding",
    calories: 180,
    protein_g: 25,
    carbs_g: 12,
    fats_g: 4,
    prep_time_min: 5,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Chocolate protein powder", amount: "1 scoop" },
      { item: "Greek yogurt", amount: "1/2 cup" },
      { item: "Unsweetened cocoa powder", amount: "1 tbsp" },
      { item: "Almond milk", amount: "2-3 tbsp" }
    ],
    instructions: `1. COMBINE: Add protein, yogurt, and cocoa to bowl.

2. MIX: Add almond milk slowly while stirring.

3. ADJUST: Add more milk for thinner, less for thicker.

4. EAT: Immediately or refrigerate 1 hour for firmer texture.

PRO TIP: Add a few chocolate chips on top. Small indulgence, big satisfaction.`,
    notes: "Tastes like dessert, performs like protein. Sweet tooth satisfied."
  },
  {
    meal_type: "snack",
    meal_name: "Mixed Nuts",
    calories: 200,
    protein_g: 6,
    carbs_g: 8,
    fats_g: 18,
    prep_time_min: 0,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Mixed nuts", amount: "1/4 cup", notes: "unsalted" }
    ],
    instructions: `1. MEASURE: This is important. Nuts are calorie-dense.

2. POUR: Into hand or small bowl.

3. EAT: Mindfully. Not from the container.

PRO TIP: Pre-portion into small bags. Never eat from the container. Easy to overeat.`,
    notes: "Healthy fats, easy fuel. Portion control is key. Measure, don't guess."
  },
  {
    meal_type: "snack",
    meal_name: "Rice Cakes with Avocado",
    calories: 180,
    protein_g: 4,
    carbs_g: 22,
    fats_g: 10,
    prep_time_min: 3,
    cook_time_min: 0,
    servings: 1,
    ingredients: [
      { item: "Rice cakes", amount: "2" },
      { item: "Avocado", amount: "1/4" },
      { item: "Salt", amount: "pinch" },
      { item: "Red pepper flakes", amount: "optional" }
    ],
    instructions: `1. MASH AVOCADO: In small bowl with fork.

2. SEASON: Salt and pepper.

3. SPREAD: Divide between rice cakes.

4. TOP: Red pepper flakes if you like heat.

5. EAT: Crunchy, creamy, satisfying.

PRO TIP: Add a poached egg on top for extra protein. Breakfast or snack.`,
    notes: "Light, crunchy, healthy fats. Like avocado toast but lighter."
  },
  {
    meal_type: "snack",
    meal_name: "Protein Bar (DIY)",
    calories: 220,
    protein_g: 20,
    carbs_g: 22,
    fats_g: 8,
    prep_time_min: 20,
    cook_time_min: 0,
    servings: 8,
    ingredients: [
      { item: "Rolled oats", amount: "1.5 cups" },
      { item: "Protein powder", amount: "2 scoops" },
      { item: "Peanut butter", amount: "3/4 cup" },
      { item: "Honey", amount: "1/3 cup" },
      { item: "Chocolate chips", amount: "1/4 cup" }
    ],
    instructions: `1. MIX DRY: Combine oats and protein powder in large bowl.

2. HEAT WET: Microwave peanut butter and honey 30 seconds until pourable.

3. COMBINE: Pour wet into dry. Mix until uniform.

4. ADD CHIPS: Fold in chocolate chips.

5. PRESS: Into 8x8 lined pan. Press firmly and evenly.

6. REFRIGERATE: 2 hours until firm.

7. CUT: Into 8 bars.

8. STORE: Fridge up to 1 week, freezer up to 1 month.

PRO TIP: Cheaper than store-bought. Better macros. You control everything.`,
    notes: "Make your own bars. Better ingredients, better price. Prep once, snack all week."
  },
];

// ============================================================
// TEMPLATE CONFIGURATIONS (100 total)
// ============================================================
const TEMPLATE_CONFIGS = [
  // FAT LOSS - AGGRESSIVE (30 templates, 1200-1800 cal)
  { name: "Iron Discipline 1200", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1200, max: 1300, p: 130, c: 80, f: 40 },
  { name: "Lockdown Lean 1300", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1300, max: 1400, p: 140, c: 85, f: 42 },
  { name: "Cell Block Cut 1350", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1350, max: 1450, p: 145, c: 90, f: 45 },
  { name: "Hard Time Shred 1400", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1400, max: 1500, p: 150, c: 95, f: 47 },
  { name: "Solitary Slim 1450", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1450, max: 1550, p: 155, c: 100, f: 48 },
  { name: "Maximum Security 1500", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1500, max: 1600, p: 160, c: 105, f: 50 },
  { name: "Yard Work 1550", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1550, max: 1650, p: 165, c: 110, f: 52 },
  { name: "Commissary Cut 1600", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1600, max: 1700, p: 170, c: 115, f: 53 },
  { name: "Warden's Watch 1650", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1650, max: 1750, p: 175, c: 118, f: 55 },
  { name: "No Excuses 1700", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1700, max: 1800, p: 180, c: 120, f: 57 },
  { name: "Ketogenic Lockdown 1250", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1250, max: 1350, p: 100, c: 25, f: 100 },
  { name: "Low Carb Protocol 1350", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1350, max: 1450, p: 135, c: 50, f: 85 },
  { name: "High Protein Shred 1400", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1400, max: 1500, p: 175, c: 75, f: 45 },
  { name: "PSMF Extreme 1200", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1200, max: 1300, p: 200, c: 30, f: 25 },
  { name: "Warrior Cut 1500", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1500, max: 1600, p: 175, c: 80, f: 52 },
  { name: "Fighter's Diet 1450", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1450, max: 1550, p: 165, c: 85, f: 50 },
  { name: "Stage Ready 1300", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1300, max: 1400, p: 160, c: 60, f: 45 },
  { name: "Contest Prep 1400", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1400, max: 1500, p: 180, c: 70, f: 42 },
  { name: "Stripped Down 1350", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1350, max: 1450, p: 155, c: 75, f: 48 },
  { name: "Zero Compromise 1500", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1500, max: 1600, p: 170, c: 90, f: 50 },
  { name: "Clean Eating 1550", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1550, max: 1650, p: 160, c: 120, f: 48 },
  { name: "Mediterranean Cut 1600", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1600, max: 1700, p: 155, c: 125, f: 55 },
  { name: "Intermittent Shred 1400", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1400, max: 1500, p: 150, c: 100, f: 50 },
  { name: "Time Restricted 1500", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1500, max: 1600, p: 155, c: 110, f: 52 },
  { name: "Whole30 Style 1450", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1450, max: 1550, p: 145, c: 120, f: 50 },
  { name: "Paleo Shred 1500", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1500, max: 1600, p: 150, c: 100, f: 60 },
  { name: "Carnivore Lite 1400", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1400, max: 1500, p: 175, c: 15, f: 80 },
  { name: "Fish & Veggie 1450", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1450, max: 1550, p: 140, c: 110, f: 55 },
  { name: "Asian Fusion Cut 1500", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1500, max: 1600, p: 145, c: 130, f: 45 },
  { name: "Plant Forward 1400", goal: "Lose fat", category: "Fat Loss - Aggressive", min: 1400, max: 1500, p: 100, c: 160, f: 45 },

  // FAT LOSS - MODERATE (25 templates, 1800-2400 cal)
  { name: "Steady Burn 1800", goal: "Lose fat", category: "Fat Loss - Moderate", min: 1800, max: 1900, p: 180, c: 150, f: 60 },
  { name: "Active Cut 1900", goal: "Lose fat", category: "Fat Loss - Moderate", min: 1900, max: 2000, p: 185, c: 160, f: 62 },
  { name: "Sustainable Shred 2000", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2000, max: 2100, p: 190, c: 170, f: 65 },
  { name: "Long Game 2100", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2100, max: 2200, p: 195, c: 180, f: 68 },
  { name: "Marathon Cut 2200", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2200, max: 2300, p: 200, c: 190, f: 70 },
  { name: "Lifestyle Lean 2300", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2300, max: 2400, p: 205, c: 200, f: 72 },
  { name: "Balanced Deficit 1850", goal: "Lose fat", category: "Fat Loss - Moderate", min: 1850, max: 1950, p: 175, c: 165, f: 58 },
  { name: "Training Days 2000", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2000, max: 2100, p: 185, c: 180, f: 62 },
  { name: "Performance Cut 2100", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2100, max: 2200, p: 200, c: 175, f: 65 },
  { name: "Athlete's Diet 2200", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2200, max: 2300, p: 210, c: 185, f: 67 },
  { name: "High Volume 2300", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2300, max: 2400, p: 200, c: 220, f: 68 },
  { name: "Endurance Focus 2000", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2000, max: 2100, p: 165, c: 230, f: 55 },
  { name: "CrossFit Cut 2200", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2200, max: 2300, p: 190, c: 210, f: 65 },
  { name: "HIIT Fuel 2100", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2100, max: 2200, p: 185, c: 200, f: 62 },
  { name: "Strength Training 2150", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2150, max: 2250, p: 210, c: 175, f: 65 },
  { name: "Powerlifting Prep 2250", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2250, max: 2350, p: 220, c: 180, f: 70 },
  { name: "Bodybuilder Cut 2100", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2100, max: 2200, p: 225, c: 160, f: 62 },
  { name: "Physique Prep 2000", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2000, max: 2100, p: 215, c: 150, f: 60 },
  { name: "Model Diet 1900", goal: "Lose fat", category: "Fat Loss - Moderate", min: 1900, max: 2000, p: 180, c: 160, f: 58 },
  { name: "Beach Body 2050", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2050, max: 2150, p: 190, c: 180, f: 60 },
  { name: "Summer Shred 2150", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2150, max: 2250, p: 195, c: 190, f: 62 },
  { name: "Wedding Ready 1950", goal: "Lose fat", category: "Fat Loss - Moderate", min: 1950, max: 2050, p: 185, c: 165, f: 58 },
  { name: "Reunion Prep 2000", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2000, max: 2100, p: 180, c: 180, f: 60 },
  { name: "Vacation Bod 2100", goal: "Lose fat", category: "Fat Loss - Moderate", min: 2100, max: 2200, p: 185, c: 195, f: 60 },
  { name: "New Year Resolution 1900", goal: "Lose fat", category: "Fat Loss - Moderate", min: 1900, max: 2000, p: 175, c: 170, f: 58 },

  // RECOMPOSITION (15 templates, 2000-2600 cal)
  { name: "Body Forge 2000", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2000, max: 2100, p: 185, c: 175, f: 62 },
  { name: "Recomp Standard 2200", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2200, max: 2300, p: 195, c: 195, f: 68 },
  { name: "Transform Protocol 2300", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2300, max: 2400, p: 200, c: 210, f: 70 },
  { name: "Evolution Diet 2400", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2400, max: 2500, p: 210, c: 220, f: 72 },
  { name: "Metamorphosis 2500", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2500, max: 2600, p: 215, c: 235, f: 75 },
  { name: "Carb Cycling Base 2200", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2200, max: 2300, p: 200, c: 185, f: 70 },
  { name: "Nutrient Timing 2300", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2300, max: 2400, p: 205, c: 205, f: 68 },
  { name: "Performance Balance 2400", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2400, max: 2500, p: 210, c: 225, f: 70 },
  { name: "Maintenance Plus 2250", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2250, max: 2350, p: 195, c: 210, f: 68 },
  { name: "Strategic Surplus 2350", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2350, max: 2450, p: 200, c: 225, f: 70 },
  { name: "Lean Mass Protocol 2450", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2450, max: 2550, p: 215, c: 230, f: 72 },
  { name: "High Protein Recomp 2200", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2200, max: 2300, p: 230, c: 170, f: 65 },
  { name: "Athlete Maintenance 2350", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2350, max: 2450, p: 210, c: 215, f: 68 },
  { name: "Active Lifestyle 2150", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2150, max: 2250, p: 190, c: 200, f: 65 },
  { name: "Functional Fitness 2300", goal: "Both - lose fat and build muscle", category: "Recomposition", min: 2300, max: 2400, p: 200, c: 215, f: 68 },

  // MUSCLE BUILDING - LEAN (15 templates, 2400-3200 cal)
  { name: "Clean Gains 2400", goal: "Build muscle", category: "Muscle Building - Lean", min: 2400, max: 2500, p: 190, c: 270, f: 70 },
  { name: "Lean Mass 2600", goal: "Build muscle", category: "Muscle Building - Lean", min: 2600, max: 2700, p: 200, c: 300, f: 75 },
  { name: "Quality Bulk 2700", goal: "Build muscle", category: "Muscle Building - Lean", min: 2700, max: 2800, p: 210, c: 315, f: 78 },
  { name: "Controlled Surplus 2800", goal: "Build muscle", category: "Muscle Building - Lean", min: 2800, max: 2900, p: 215, c: 330, f: 80 },
  { name: "Smart Bulk 2900", goal: "Build muscle", category: "Muscle Building - Lean", min: 2900, max: 3000, p: 220, c: 345, f: 82 },
  { name: "Progressive Gains 3000", goal: "Build muscle", category: "Muscle Building - Lean", min: 3000, max: 3100, p: 225, c: 360, f: 85 },
  { name: "Athlete Bulk 3100", goal: "Build muscle", category: "Muscle Building - Lean", min: 3100, max: 3200, p: 230, c: 375, f: 88 },
  { name: "High Carb Lean 2700", goal: "Build muscle", category: "Muscle Building - Lean", min: 2700, max: 2800, p: 195, c: 350, f: 72 },
  { name: "Moderate Macro 2600", goal: "Build muscle", category: "Muscle Building - Lean", min: 2600, max: 2700, p: 205, c: 290, f: 78 },
  { name: "Clean Eating Bulk 2800", goal: "Build muscle", category: "Muscle Building - Lean", min: 2800, max: 2900, p: 210, c: 320, f: 82 },
  { name: "Whole Foods Gain 2900", goal: "Build muscle", category: "Muscle Building - Lean", min: 2900, max: 3000, p: 215, c: 340, f: 85 },
  { name: "Performance Surplus 2750", goal: "Build muscle", category: "Muscle Building - Lean", min: 2750, max: 2850, p: 210, c: 310, f: 78 },
  { name: "Training Fuel 2850", goal: "Build muscle", category: "Muscle Building - Lean", min: 2850, max: 2950, p: 215, c: 330, f: 80 },
  { name: "Recovery Focus 2650", goal: "Build muscle", category: "Muscle Building - Lean", min: 2650, max: 2750, p: 205, c: 300, f: 75 },
  { name: "Strength Surplus 3050", goal: "Build muscle", category: "Muscle Building - Lean", min: 3050, max: 3150, p: 225, c: 365, f: 85 },

  // MUSCLE BUILDING - MASS (15 templates, 3000-4000 cal)
  { name: "Mass Protocol 3200", goal: "Build muscle", category: "Muscle Building - Mass", min: 3200, max: 3300, p: 230, c: 390, f: 90 },
  { name: "Beast Mode 3400", goal: "Build muscle", category: "Muscle Building - Mass", min: 3400, max: 3500, p: 240, c: 420, f: 95 },
  { name: "Maximum Muscle 3500", goal: "Build muscle", category: "Muscle Building - Mass", min: 3500, max: 3600, p: 250, c: 435, f: 98 },
  { name: "Hardcore Bulk 3600", goal: "Build muscle", category: "Muscle Building - Mass", min: 3600, max: 3700, p: 255, c: 450, f: 100 },
  { name: "Off-Season 3700", goal: "Build muscle", category: "Muscle Building - Mass", min: 3700, max: 3800, p: 260, c: 465, f: 105 },
  { name: "Winter Bulk 3800", goal: "Build muscle", category: "Muscle Building - Mass", min: 3800, max: 3900, p: 265, c: 480, f: 108 },
  { name: "Unlimited Gains 4000", goal: "Build muscle", category: "Muscle Building - Mass", min: 3900, max: 4000, p: 270, c: 500, f: 110 },
  { name: "Hardgainer Special 3500", goal: "Build muscle", category: "Muscle Building - Mass", min: 3500, max: 3600, p: 220, c: 470, f: 95 },
  { name: "Ectomorph Elite 3700", goal: "Build muscle", category: "Muscle Building - Mass", min: 3700, max: 3800, p: 230, c: 490, f: 100 },
  { name: "High Calorie Clean 3400", goal: "Build muscle", category: "Muscle Building - Mass", min: 3400, max: 3500, p: 245, c: 410, f: 98 },
  { name: "Power Building 3600", goal: "Build muscle", category: "Muscle Building - Mass", min: 3600, max: 3700, p: 260, c: 440, f: 100 },
  { name: "Strongman Fuel 3800", goal: "Build muscle", category: "Muscle Building - Mass", min: 3800, max: 3900, p: 270, c: 470, f: 105 },
  { name: "Football Season 3500", goal: "Build muscle", category: "Muscle Building - Mass", min: 3500, max: 3600, p: 250, c: 440, f: 95 },
  { name: "Wrestling Weight 3300", goal: "Build muscle", category: "Muscle Building - Mass", min: 3300, max: 3400, p: 240, c: 400, f: 92 },
  { name: "Rugby Fuel 3650", goal: "Build muscle", category: "Muscle Building - Mass", min: 3650, max: 3750, p: 255, c: 455, f: 100 },
];

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function scaleMeal(meal: MealTemplate, factor: number): MealTemplate {
  return {
    ...meal,
    calories: Math.round(meal.calories * factor),
    protein_g: Math.round(meal.protein_g * factor),
    carbs_g: Math.round(meal.carbs_g * factor),
    fats_g: Math.round(meal.fats_g * factor)
  };
}

function selectMealsForDay(
  targetCalories: number,
  targetProtein: number,
  usedMeals: Set<string>
): { breakfast: MealTemplate; lunch: MealTemplate; dinner: MealTemplate; snack: MealTemplate } {
  // Select meals that haven't been used yet this week
  const availableBreakfasts = BREAKFASTS.filter(m => !usedMeals.has(m.meal_name));
  const availableLunches = LUNCHES.filter(m => !usedMeals.has(m.meal_name));
  const availableDinners = DINNERS.filter(m => !usedMeals.has(m.meal_name));
  const availableSnacks = SNACKS.filter(m => !usedMeals.has(m.meal_name));

  // If we've used all, reset
  const breakfastPool = availableBreakfasts.length > 0 ? availableBreakfasts : BREAKFASTS;
  const lunchPool = availableLunches.length > 0 ? availableLunches : LUNCHES;
  const dinnerPool = availableDinners.length > 0 ? availableDinners : DINNERS;
  const snackPool = availableSnacks.length > 0 ? availableSnacks : SNACKS;

  // Random selection from each pool
  const breakfast = breakfastPool[Math.floor(Math.random() * breakfastPool.length)];
  const lunch = lunchPool[Math.floor(Math.random() * lunchPool.length)];
  const dinner = dinnerPool[Math.floor(Math.random() * dinnerPool.length)];
  const snack = snackPool[Math.floor(Math.random() * snackPool.length)];

  // Calculate base total
  const baseTotal = breakfast.calories + lunch.calories + dinner.calories + snack.calories;
  const scaleFactor = targetCalories / baseTotal;

  return {
    breakfast: scaleMeal(breakfast, scaleFactor),
    lunch: scaleMeal(lunch, scaleFactor),
    dinner: scaleMeal(dinner, scaleFactor),
    snack: scaleMeal(snack, scaleFactor),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get category IDs
    const { data: categories } = await supabase
      .from("nutrition_template_categories")
      .select("id, name");

    const categoryMap: Record<string, string> = {};
    for (const cat of categories || []) {
      categoryMap[cat.name] = cat.id;
    }

    // First, fix existing templates' category assignments
    const { data: existingTemplates } = await supabase
      .from("meal_plan_templates")
      .select("id, name, goal_type, calorie_range_min, category_id");

    for (const template of existingTemplates || []) {
      let correctCategory = "Recomposition";
      
      if (template.goal_type === "Lose fat") {
        correctCategory = template.calorie_range_min < 1800 ? "Fat Loss - Aggressive" : "Fat Loss - Moderate";
      } else if (template.goal_type === "Build muscle") {
        correctCategory = template.calorie_range_min < 3000 ? "Muscle Building - Lean" : "Muscle Building - Mass";
      }

      const correctCategoryId = categoryMap[correctCategory];
      if (correctCategoryId && template.category_id !== correctCategoryId) {
        await supabase
          .from("meal_plan_templates")
          .update({ category_id: correctCategoryId })
          .eq("id", template.id);
      }
    }

    let templatesCreated = 0;
    let daysCreated = 0;
    let mealsCreated = 0;

    for (const config of TEMPLATE_CONFIGS) {
      // Check if template already exists
      const { data: existingTemplate } = await supabase
        .from("meal_plan_templates")
        .select("id")
        .eq("name", config.name)
        .single();

      if (existingTemplate) {
        console.log(`Template "${config.name}" already exists, skipping...`);
        continue;
      }

      const categoryId = categoryMap[config.category];
      if (!categoryId) {
        console.error(`Category "${config.category}" not found, skipping template "${config.name}"`);
        continue;
      }

      // Create template
      const { data: template, error: templateError } = await supabase
        .from("meal_plan_templates")
        .insert({
          name: config.name,
          goal_type: config.goal,
          category_id: categoryId,
          calorie_range_min: config.min,
          calorie_range_max: config.max,
          daily_protein_g: config.p,
          daily_carbs_g: config.c,
          daily_fats_g: config.f,
          description: `${config.category} plan targeting ${config.min}-${config.max} calories/day with ${config.p}g protein. Designed for ${config.goal.toLowerCase()}.`,
          is_active: true,
          display_order: templatesCreated
        })
        .select()
        .single();

      if (templateError) {
        console.error(`Error creating template "${config.name}":`, templateError);
        continue;
      }

      templatesCreated++;

      // Track used meals for variety (reset each week for more variety)
      const targetCalories = (config.min + config.max) / 2;

      // Create 28 days (4 weeks)
      for (let dayNum = 1; dayNum <= 28; dayNum++) {
        const weekNum = Math.ceil(dayNum / 7);
        const dayOfWeek = ((dayNum - 1) % 7);
        const dayName = `Week ${weekNum} - ${DAY_NAMES[dayOfWeek]}`;
        
        // Reset used meals each week for variety within the week
        const usedMeals = new Set<string>();
        if (dayOfWeek === 0) {
          usedMeals.clear();
        }

        const { data: day, error: dayError } = await supabase
          .from("meal_plan_days")
          .insert({
            template_id: template.id,
            day_number: dayNum,
            day_name: dayName
          })
          .select()
          .single();

        if (dayError) {
          console.error(`Error creating day ${dayNum}:`, dayError);
          continue;
        }

        daysCreated++;

        // Select meals for this day
        const dayMeals = selectMealsForDay(targetCalories, config.p, usedMeals);

        // Track used meals within the week
        usedMeals.add(dayMeals.breakfast.meal_name);
        usedMeals.add(dayMeals.lunch.meal_name);
        usedMeals.add(dayMeals.dinner.meal_name);
        usedMeals.add(dayMeals.snack.meal_name);

        // Insert all 4 meals
        const mealsToInsert = [
          { ...dayMeals.breakfast, day_id: day.id, display_order: 1 },
          { ...dayMeals.lunch, day_id: day.id, display_order: 2 },
          { ...dayMeals.dinner, day_id: day.id, display_order: 3 },
          { ...dayMeals.snack, day_id: day.id, display_order: 4 },
        ];

        for (const meal of mealsToInsert) {
          const { error: mealError } = await supabase
            .from("meal_plan_meals")
            .insert({
              day_id: meal.day_id,
              meal_type: meal.meal_type,
              meal_name: meal.meal_name,
              calories: meal.calories,
              protein_g: meal.protein_g,
              carbs_g: meal.carbs_g,
              fats_g: meal.fats_g,
              prep_time_min: meal.prep_time_min,
              cook_time_min: meal.cook_time_min,
              servings: meal.servings,
              ingredients: meal.ingredients,
              instructions: meal.instructions,
              notes: meal.notes,
              display_order: meal.display_order
            });

          if (mealError) {
            console.error(`Error creating meal:`, mealError);
          } else {
            mealsCreated++;
          }
        }
      }

      console.log(`Created template "${config.name}" with 28 days (4 weeks) and 112 meals`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${templatesCreated} templates, ${daysCreated} days, and ${mealsCreated} meals`,
        details: {
          templatesCreated,
          daysCreated,
          mealsCreated
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
