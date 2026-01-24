import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Intake = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 3;
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    email: user?.email || "",
    phone: "",
    age: "",
    height: "",
    weight: "",
    // Step 2: Training
    goal: "",
    experience: "",
    equipment: "",
    injuries: "",
    // Step 3: Faith & Commitment
    faithCommitment: false,
  });

  const updateForm = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to complete the intake.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const profileData = {
        user_id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height,
        weight: formData.weight,
        goal: formData.goal,
        experience: formData.experience,
        equipment: formData.equipment,
        injuries: formData.injuries,
        faith_commitment: formData.faithCommitment,
        intake_completed_at: new Date().toISOString(),
      };

      let error;
      if (existingProfile) {
        // Update existing profile
        const result = await supabase
          .from("profiles")
          .update(profileData)
          .eq("user_id", user.id);
        error = result.error;
      } else {
        // Insert new profile
        const result = await supabase
          .from("profiles")
          .insert(profileData);
        error = result.error;
      }

      if (error) {
        throw error;
      }

      // Refresh the profile in context so ProtectedRoute sees the update
      await refreshProfile();

      toast({
        title: "Intake Complete!",
        description: "Your profile has been saved. Welcome to the program!",
      });

      navigate("/intake-complete");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateForm("firstName", e.target.value)}
                  className="bg-charcoal border-border"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateForm("lastName", e.target.value)}
                  className="bg-charcoal border-border"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateForm("email", e.target.value)}
                className="bg-charcoal border-border"
                required
                disabled={!!user?.email}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                className="bg-charcoal border-border"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateForm("age", e.target.value)}
                  className="bg-charcoal border-border"
                  required
                />
              </div>
              <div>
                <Label htmlFor="height">Height *</Label>
                <Input
                  id="height"
                  placeholder="5'10"
                  value={formData.height}
                  onChange={(e) => updateForm("height", e.target.value)}
                  className="bg-charcoal border-border"
                  required
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (lbs) *</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateForm("weight", e.target.value)}
                  className="bg-charcoal border-border"
                  required
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base">What's your primary goal? *</Label>
              <RadioGroup
                value={formData.goal}
                onValueChange={(value) => updateForm("goal", value)}
                className="mt-3 space-y-2"
              >
                {["Lose fat", "Build muscle", "Both - lose fat and build muscle"].map((option) => (
                  <div key={option} className="flex items-center space-x-3 p-3 rounded-lg bg-charcoal border border-border hover:border-primary/50">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer flex-1">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label className="text-base">Training Experience *</Label>
              <RadioGroup
                value={formData.experience}
                onValueChange={(value) => updateForm("experience", value)}
                className="mt-3 space-y-2"
              >
                {["Beginner (0-1 years)", "Intermediate (1-3 years)", "Advanced (3+ years)"].map((option) => (
                  <div key={option} className="flex items-center space-x-3 p-3 rounded-lg bg-charcoal border border-border hover:border-primary/50">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer flex-1">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label className="text-base">Available Equipment *</Label>
              <RadioGroup
                value={formData.equipment}
                onValueChange={(value) => updateForm("equipment", value)}
                className="mt-3 space-y-2"
              >
                {["Bodyweight Only", "Dumbbells Available", "Resistance Bands", "Full Gym Access"].map((option) => (
                  <div key={option} className="flex items-center space-x-3 p-3 rounded-lg bg-charcoal border border-border hover:border-primary/50">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer flex-1">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="injuries">Any injuries or limitations?</Label>
              <Textarea
                id="injuries"
                value={formData.injuries}
                onChange={(e) => updateForm("injuries", e.target.value)}
                placeholder="List any injuries, surgeries, or physical limitations..."
                className="bg-charcoal border-border mt-2"
                rows={3}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-charcoal border border-primary/30">
              <h3 className="headline-card mb-4 text-primary">Faith Commitment</h3>
              <p className="text-muted-foreground mb-6">
                This program is built on Christian faith principles. Scripture, prayer, 
                and God-led discipline are core components — not optional add-ons.
              </p>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="faithCommitment"
                  checked={formData.faithCommitment}
                  onCheckedChange={(checked) => updateForm("faithCommitment", checked as boolean)}
                />
                <Label htmlFor="faithCommitment" className="cursor-pointer leading-relaxed">
                  I understand and embrace that faith is the foundation of this program. 
                  I'm ready to integrate spiritual disciplines alongside physical training.
                </Label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const stepTitles = [
    "Basic Information",
    "Training Profile",
    "Faith & Commitment",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="headline-section mb-4">
                Complete Your <span className="text-primary">Intake</span>
              </h1>
              <p className="text-muted-foreground">
                This information helps us build your personalized framework.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
                <span className="text-sm text-primary">{stepTitles[step - 1]}</span>
              </div>
              <div className="h-2 bg-charcoal rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Form */}
            <div className="bg-card p-8 rounded-lg border border-border">
              {renderStep()}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                {step < totalSteps ? (
                  <Button
                    variant="gold"
                    onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
                    className="gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="gold"
                    onClick={handleSubmit}
                    disabled={!formData.faithCommitment || isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Complete Intake <Check className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Intake;
