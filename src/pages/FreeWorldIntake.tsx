import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Activity,
  Dumbbell,
  Heart,
  Target,
  Cross,
  Camera,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const STEPS = [
  { id: 1, title: "Profile", icon: User },
  { id: 2, title: "Body Assessment", icon: Activity },
  { id: 3, title: "Training Readiness", icon: Dumbbell },
  { id: 4, title: "Health & Lifestyle", icon: Heart },
  { id: 5, title: "Goals & Mindset", icon: Target },
  { id: 6, title: "Faith Commitment", icon: Cross },
  { id: 7, title: "Progress Photos", icon: Camera },
];

const BODY_FAT_OPTIONS = [
  { value: "lean", label: "Lean", description: "Visible abs, low body fat" },
  { value: "average", label: "Average", description: "Some body fat, no visible abs" },
  { value: "overweight", label: "Overweight", description: "Excess body fat" },
  { value: "obese", label: "Obese", description: "Significant excess body fat" },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary", description: "Desk job, minimal movement" },
  { value: "lightly_active", label: "Lightly Active", description: "Occasional walks, light activity" },
  { value: "moderately_active", label: "Moderately Active", description: "Regular exercise 2-3x/week" },
  { value: "very_active", label: "Very Active", description: "Intense exercise 4+ days/week" },
];

const EQUIPMENT_OPTIONS = [
  "Bodyweight only",
  "Dumbbells",
  "Barbell & weights",
  "Pull-up bar",
  "Resistance bands",
  "Full gym access",
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner (0-1 years)" },
  { value: "intermediate", label: "Intermediate (1-3 years)" },
  { value: "advanced", label: "Advanced (3+ years)" },
];

const SLEEP_OPTIONS = ["Poor", "Fair", "Good", "Excellent"];
const STRESS_OPTIONS = ["Low", "Moderate", "High"];

const GOAL_TYPE_OPTIONS = [
  { value: "Lose fat", label: "Lose Fat", description: "Primary focus on fat loss" },
  { value: "Build muscle", label: "Build Muscle", description: "Primary focus on muscle gain" },
  { value: "Both - lose fat and build muscle", label: "Recomposition", description: "Lose fat while building muscle" },
];

const DIETARY_RESTRICTIONS = [
  "No restrictions",
  "Gluten-free",
  "Dairy-free",
  "Vegetarian",
  "Keto/Low-carb",
  "Other",
];

const MEAL_PREP_OPTIONS = [
  { value: "fresh", label: "Fresh meals daily", description: "I can cook fresh each day" },
  { value: "batch", label: "Batch cooking", description: "I prefer cooking 2-3 times per week" },
  { value: "quick", label: "Quick meals", description: "I need 15-minute meals" },
];

const TRAINING_STYLE_OPTIONS = [
  "Strength/Powerlifting",
  "Bodybuilding/Hypertrophy",
  "Functional Fitness",
  "Cardio/Conditioning",
  "Mixed",
];

const SESSION_LENGTH_OPTIONS = [
  { value: "30-45", label: "30-45 minutes" },
  { value: "45-60", label: "45-60 minutes" },
  { value: "60-90", label: "60-90 minutes" },
];

interface FormData {
  // Step 1: Profile
  first_name: string;
  last_name: string;
  phone: string;
  age: string;
  height: string;
  weight: string;
  // Step 2: Body Assessment
  body_fat_estimate: string;
  activity_level: string;
  equipment: string[];
  // Step 3: Training Readiness
  training_days_per_week: number;
  experience: string;
  previous_training: string;
  injuries: string;
  training_style: string[];
  session_length_preference: string;
  // Step 4: Health & Lifestyle
  sleep_quality: string;
  stress_level: string;
  medical_conditions: string;
  nutrition_style: string;
  dietary_restrictions: string[];
  meal_prep_preference: string;
  food_dislikes: string;
  // Step 5: Goals & Mindset
  goal_type: string;
  goal: string;
  short_term_goals: string;
  long_term_goals: string;
  biggest_obstacle: string;
  motivation: string;
  // Step 6: Faith
  faith_commitment: boolean;
}

export default function FreeWorldIntake() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    phone: "",
    age: "",
    height: "",
    weight: "",
    body_fat_estimate: "",
    activity_level: "",
    equipment: [],
    training_days_per_week: 4,
    experience: "",
    previous_training: "",
    injuries: "",
    training_style: [],
    session_length_preference: "",
    sleep_quality: "",
    stress_level: "",
    medical_conditions: "",
    nutrition_style: "",
    dietary_restrictions: [],
    meal_prep_preference: "",
    food_dislikes: "",
    goal_type: "",
    goal: "",
    short_term_goals: "",
    long_term_goals: "",
    biggest_obstacle: "",
    motivation: "",
    faith_commitment: false,
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEquipment = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter((e) => e !== item)
        : [...prev.equipment, item],
    }));
  };

  const toggleTrainingStyle = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      training_style: prev.training_style.includes(item)
        ? prev.training_style.filter((e) => e !== item)
        : [...prev.training_style, item],
    }));
  };

  const toggleDietaryRestriction = (item: string) => {
    setFormData((prev) => {
      // If "No restrictions" is selected, clear other selections
      if (item === "No restrictions") {
        return { ...prev, dietary_restrictions: [item] };
      }
      // If another option is selected, remove "No restrictions"
      const filtered = prev.dietary_restrictions.filter((e) => e !== "No restrictions");
      return {
        ...prev,
        dietary_restrictions: filtered.includes(item)
          ? filtered.filter((e) => e !== item)
          : [...filtered, item],
      };
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.first_name && formData.phone;
      case 2:
        return formData.body_fat_estimate && formData.activity_level;
      case 3:
        return formData.training_days_per_week >= 3 && formData.experience;
      case 4:
        return formData.sleep_quality && formData.stress_level;
      case 5:
        return formData.goal_type && formData.goal && formData.motivation;
      case 6:
        return true;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to continue");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          age: formData.age ? parseInt(formData.age) : null,
          height: formData.height,
          weight: formData.weight,
          body_fat_estimate: formData.body_fat_estimate,
          activity_level: formData.activity_level,
          equipment: formData.equipment.join(", "),
          training_days_per_week: formData.training_days_per_week,
          experience: formData.experience,
          previous_training: formData.previous_training,
          injuries: formData.injuries,
          training_style: formData.training_style.join(", "),
          session_length_preference: formData.session_length_preference,
          sleep_quality: formData.sleep_quality,
          stress_level: formData.stress_level,
          medical_conditions: formData.medical_conditions,
          nutrition_style: formData.nutrition_style,
          dietary_restrictions: formData.dietary_restrictions.join(", "),
          meal_prep_preference: formData.meal_prep_preference,
          food_dislikes: formData.food_dislikes,
          goal_type: formData.goal_type,
          goal: formData.goal,
          short_term_goals: formData.short_term_goals,
          long_term_goals: formData.long_term_goals,
          biggest_obstacle: formData.biggest_obstacle,
          motivation: formData.motivation,
          faith_commitment: formData.faith_commitment,
          intake_completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Intake completed! Welcome to Free World.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving intake:", error);
      toast.error("Failed to save intake. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-charcoal/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary">Free World Intake</h1>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id === currentStep
                    ? "text-primary"
                    : step.id < currentStep
                    ? "text-primary/60"
                    : "text-muted-foreground"
                }`}
              >
                <step.icon className="w-4 h-4" />
                <span className="text-[10px] mt-1 hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Profile */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
                  <p className="text-muted-foreground">
                    Let's start with the basics so Dom knows who you are.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => updateField("first_name", e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => updateField("last_name", e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => updateField("age", e.target.value)}
                      placeholder="32"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      value={formData.height}
                      onChange={(e) => updateField("height", e.target.value)}
                      placeholder='5&apos;11"'
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => updateField("weight", e.target.value)}
                      placeholder="185"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Body Assessment */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Body Assessment</h2>
                  <p className="text-muted-foreground">
                    This helps us design a safe and effective starting point.
                  </p>
                </div>

                <div>
                  <Label className="text-base">Current Body Composition *</Label>
                  <RadioGroup
                    value={formData.body_fat_estimate}
                    onValueChange={(val) => updateField("body_fat_estimate", val)}
                    className="grid grid-cols-2 gap-3 mt-2"
                  >
                    {BODY_FAT_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-colors ${
                          formData.body_fat_estimate === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        onClick={() => updateField("body_fat_estimate", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                        <Label htmlFor={option.value} className="ml-3 cursor-pointer">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base">Current Activity Level *</Label>
                  <RadioGroup
                    value={formData.activity_level}
                    onValueChange={(val) => updateField("activity_level", val)}
                    className="space-y-2 mt-2"
                  >
                    {ACTIVITY_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.activity_level === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        onClick={() => updateField("activity_level", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={`activity-${option.value}`} />
                        <Label htmlFor={`activity-${option.value}`} className="ml-3 flex-1 cursor-pointer">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-muted-foreground"> - {option.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base">Equipment Access</Label>
                  <p className="text-sm text-muted-foreground mb-2">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-2">
                    {EQUIPMENT_OPTIONS.map((item) => (
                      <div
                        key={item}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.equipment.includes(item)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        onClick={() => toggleEquipment(item)}
                      >
                        <Checkbox
                          checked={formData.equipment.includes(item)}
                          onCheckedChange={() => toggleEquipment(item)}
                        />
                        <span className="ml-2 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Training Readiness */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Training Readiness</h2>
                  <p className="text-muted-foreground">
                    Tell us about your training background and availability.
                  </p>
                </div>

                <div>
                  <Label className="text-base">Training Days Per Week *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Minimum 3 days required for results
                  </p>
                  <div className="flex gap-2">
                    {[3, 4, 5, 6, 7].map((days) => (
                      <Button
                        key={days}
                        type="button"
                        variant={formData.training_days_per_week === days ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => updateField("training_days_per_week", days)}
                      >
                        {days}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base">Experience Level *</Label>
                  <RadioGroup
                    value={formData.experience}
                    onValueChange={(val) => updateField("experience", val)}
                    className="space-y-2 mt-2"
                  >
                    {EXPERIENCE_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.experience === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        onClick={() => updateField("experience", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={`exp-${option.value}`} />
                        <Label htmlFor={`exp-${option.value}`} className="ml-3 cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="previous_training">Previous Training History</Label>
                  <Textarea
                    id="previous_training"
                    value={formData.previous_training}
                    onChange={(e) => updateField("previous_training", e.target.value)}
                    placeholder="What programs have you tried? What worked or didn't work?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="injuries">Injuries or Limitations</Label>
                  <Textarea
                    id="injuries"
                    value={formData.injuries}
                    onChange={(e) => updateField("injuries", e.target.value)}
                    placeholder="Any injuries, joint issues, or physical limitations we should know about?"
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="text-base">Preferred Training Style</Label>
                  <p className="text-sm text-muted-foreground mb-2">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TRAINING_STYLE_OPTIONS.map((item) => (
                      <div
                        key={item}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.training_style.includes(item)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        onClick={() => toggleTrainingStyle(item)}
                      >
                        <Checkbox
                          checked={formData.training_style.includes(item)}
                          onCheckedChange={() => toggleTrainingStyle(item)}
                        />
                        <span className="ml-2 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base">Preferred Session Length</Label>
                  <RadioGroup
                    value={formData.session_length_preference}
                    onValueChange={(val) => updateField("session_length_preference", val)}
                    className="grid grid-cols-3 gap-2 mt-2"
                  >
                    {SESSION_LENGTH_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.session_length_preference === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        onClick={() => updateField("session_length_preference", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={`session-${option.value}`} className="sr-only" />
                        <Label htmlFor={`session-${option.value}`} className="cursor-pointer text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 4: Health & Lifestyle */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Health & Lifestyle</h2>
                  <p className="text-muted-foreground">
                    Understanding your lifestyle helps us build a sustainable program.
                  </p>
                </div>

                <div>
                  <Label className="text-base">Sleep Quality *</Label>
                  <div className="flex gap-2 mt-2">
                    {SLEEP_OPTIONS.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={formData.sleep_quality === option.toLowerCase() ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => updateField("sleep_quality", option.toLowerCase())}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base">Stress Level *</Label>
                  <div className="flex gap-2 mt-2">
                    {STRESS_OPTIONS.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={formData.stress_level === option.toLowerCase() ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => updateField("stress_level", option.toLowerCase())}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="medical_conditions">Medical Conditions</Label>
                  <Textarea
                    id="medical_conditions"
                    value={formData.medical_conditions}
                    onChange={(e) => updateField("medical_conditions", e.target.value)}
                    placeholder="Diabetes, heart conditions, blood pressure, etc."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="nutrition_style">Current Eating Habits</Label>
                  <Textarea
                    id="nutrition_style"
                    value={formData.nutrition_style}
                    onChange={(e) => updateField("nutrition_style", e.target.value)}
                    placeholder="Describe your typical meals, eating schedule, and any dietary challenges"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-base">Dietary Restrictions</Label>
                  <p className="text-sm text-muted-foreground mb-2">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-2">
                    {DIETARY_RESTRICTIONS.map((item) => (
                      <div
                        key={item}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.dietary_restrictions.includes(item)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        onClick={() => toggleDietaryRestriction(item)}
                      >
                        <Checkbox
                          checked={formData.dietary_restrictions.includes(item)}
                          onCheckedChange={() => toggleDietaryRestriction(item)}
                        />
                        <span className="ml-2 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base">Meal Prep Preference</Label>
                  <RadioGroup
                    value={formData.meal_prep_preference}
                    onValueChange={(val) => updateField("meal_prep_preference", val)}
                    className="space-y-2 mt-2"
                  >
                    {MEAL_PREP_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.meal_prep_preference === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        onClick={() => updateField("meal_prep_preference", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={`meal-${option.value}`} />
                        <Label htmlFor={`meal-${option.value}`} className="ml-3 cursor-pointer flex-1">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-muted-foreground"> - {option.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="food_dislikes">Foods You Won't Eat</Label>
                  <Textarea
                    id="food_dislikes"
                    value={formData.food_dislikes}
                    onChange={(e) => updateField("food_dislikes", e.target.value)}
                    placeholder="Any foods you absolutely won't eat? (allergies, texture issues, strong dislikes)"
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Goals & Mindset */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Goals & Mindset</h2>
                  <p className="text-muted-foreground">
                    Your "why" is just as important as your goals.
                  </p>
                </div>

                <div>
                  <Label className="text-base">Primary Goal Type *</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    This helps us select the right program and nutrition plan
                  </p>
                  <RadioGroup
                    value={formData.goal_type}
                    onValueChange={(val) => updateField("goal_type", val)}
                    className="space-y-2 mt-2"
                  >
                    {GOAL_TYPE_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                          formData.goal_type === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        onClick={() => updateField("goal_type", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={`goal-type-${option.value}`} />
                        <Label htmlFor={`goal-type-${option.value}`} className="ml-3 cursor-pointer flex-1">
                          <span className="font-bold">{option.label}</span>
                          <span className="text-muted-foreground ml-2">- {option.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="goal">Goal Details *</Label>
                  <Input
                    id="goal"
                    value={formData.goal}
                    onChange={(e) => updateField("goal", e.target.value)}
                    placeholder="Be specific: lose 30 lbs, bench 225, run a 5K..."
                  />
                </div>

                <div>
                  <Label htmlFor="short_term_goals">4-Week Goals</Label>
                  <Textarea
                    id="short_term_goals"
                    value={formData.short_term_goals}
                    onChange={(e) => updateField("short_term_goals", e.target.value)}
                    placeholder="What specific results do you want in the first month?"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="long_term_goals">3-6 Month Vision</Label>
                  <Textarea
                    id="long_term_goals"
                    value={formData.long_term_goals}
                    onChange={(e) => updateField("long_term_goals", e.target.value)}
                    placeholder="Where do you see yourself in a few months?"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="biggest_obstacle">Biggest Obstacle</Label>
                  <Textarea
                    id="biggest_obstacle"
                    value={formData.biggest_obstacle}
                    onChange={(e) => updateField("biggest_obstacle", e.target.value)}
                    placeholder="What's held you back before? Time, motivation, knowledge, consistency..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="motivation">Why Now? *</Label>
                  <Textarea
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => updateField("motivation", e.target.value)}
                    placeholder="What made you decide to start now? This helps Dom understand your 'why'"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 6: Faith Commitment */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Faith Commitment</h2>
                  <p className="text-muted-foreground">
                    Redeemed Strength is built on faith-based principles.
                  </p>
                </div>

                <div
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.faith_commitment
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  onClick={() => updateField("faith_commitment", !formData.faith_commitment)}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={formData.faith_commitment}
                      onCheckedChange={(checked) => updateField("faith_commitment", checked === true)}
                      className="mt-1"
                    />
                    <div>
                      <h3 className="font-bold text-lg">I commit to faith-based training</h3>
                      <p className="text-muted-foreground mt-2">
                        I understand that Redeemed Strength integrates biblical principles with
                        physical training. I'm open to incorporating faith lessons, scripture, and
                        spiritual discipline alongside my workout program.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center text-muted-foreground text-sm">
                  <Cross className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p>"Iron sharpens iron, and one man sharpens another."</p>
                  <p className="text-xs mt-1">- Proverbs 27:17</p>
                </div>
              </div>
            )}

            {/* Step 7: Progress Photos */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Progress Photos</h2>
                  <p className="text-muted-foreground">
                    Photos help track your transformation. You can add these later from your
                    dashboard if you prefer.
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-8 text-center border-2 border-dashed border-muted">
                  <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Photo Upload Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">
                    You can upload progress photos from your dashboard after completing the intake.
                  </p>
                </div>

                <div className="bg-primary/10 rounded-lg p-4">
                  <h4 className="font-medium text-primary mb-2">📸 Photo Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Take photos in consistent lighting</li>
                    <li>• Use the same location each time</li>
                    <li>• Front, side, and back views recommended</li>
                    <li>• Morning photos before eating work best</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Footer */}
      <footer className="sticky bottom-0 bg-charcoal/95 backdrop-blur border-t border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            onClick={nextStep}
            disabled={!canProceed() || isSubmitting}
            className="gap-2 min-w-32"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : currentStep === 7 ? (
              <>
                <Check className="w-4 h-4" />
                Complete Intake
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
