import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ArrowRight, ArrowLeft, Loader2, User, Target, Cross, Dumbbell, Activity, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Intake = () => {
  const navigate = useNavigate();
  const { user, profile, subscription, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 3;
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    age: profile?.age?.toString() || "",
    height: profile?.height || "",
    weight: profile?.weight || "",
    goal: profile?.goal || "",
    experience: profile?.experience || "",
    equipment: profile?.equipment || "",
    injuries: profile?.injuries || "",
    faithCommitment: profile?.faith_commitment || false,
  });

  // Sync form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        firstName: profile.first_name || prev.firstName,
        lastName: profile.last_name || prev.lastName,
        phone: profile.phone || prev.phone,
        age: profile.age?.toString() || prev.age,
        height: profile.height || prev.height,
        weight: profile.weight || prev.weight,
        goal: profile.goal || prev.goal,
        experience: profile.experience || prev.experience,
        equipment: profile.equipment || prev.equipment,
        injuries: profile.injuries || prev.injuries,
        faithCommitment: profile.faith_commitment || prev.faithCommitment,
      }));
    }
  }, [profile]);

  const updateForm = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getTierName = () => {
    switch (subscription?.plan_type) {
      case "coaching": return "Free World";
      case "transformation": return "General Population";
      default: return "Solitary Confinement";
    }
  };

  const getTierColor = () => {
    switch (subscription?.plan_type) {
      case "coaching": return "text-green-400";
      case "transformation": return "text-primary";
      default: return "text-muted-foreground";
    }
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
        const result = await supabase
          .from("profiles")
          .update(profileData)
          .eq("user_id", user.id);
        error = result.error;
      } else {
        const result = await supabase.from("profiles").insert(profileData);
        error = result.error;
      }

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Processing Complete!",
        description: "Welcome to the program. Your sentence begins now.",
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

  const stepConfig = [
    { 
      title: "Booking", 
      subtitle: "Basic Information",
      icon: User,
      description: "Let's get you in the system"
    },
    { 
      title: "Assessment", 
      subtitle: "Training Profile",
      icon: Target,
      description: "Tell us about your goals and experience"
    },
    { 
      title: "Oath", 
      subtitle: "Faith Commitment",
      icon: Cross,
      description: "Commit to the foundation"
    },
  ];

  const goalOptions = [
    { value: "Lose fat", icon: Activity, description: "Burn fat, get lean" },
    { value: "Build muscle", icon: Dumbbell, description: "Pack on size and strength" },
    { value: "Both - lose fat and build muscle", icon: Target, description: "Complete body recomposition" },
  ];

  const experienceOptions = [
    { value: "Beginner (0-1 years)", label: "Beginner", description: "New to training" },
    { value: "Intermediate (1-3 years)", label: "Intermediate", description: "Consistent training experience" },
    { value: "Advanced (3+ years)", label: "Advanced", description: "Seasoned lifter" },
  ];

  const equipmentOptions = [
    { value: "Bodyweight Only", label: "Bodyweight", description: "No equipment needed" },
    { value: "Dumbbells Available", label: "Dumbbells", description: "Home setup" },
    { value: "Resistance Bands", label: "Bands", description: "Portable resistance" },
    { value: "Full Gym Access", label: "Full Gym", description: "Complete equipment" },
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateForm("firstName", e.target.value)}
                  className="h-12 bg-background border-border focus:border-primary"
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateForm("lastName", e.target.value)}
                  className="h-12 bg-background border-border focus:border-primary"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateForm("email", e.target.value)}
                className="h-12 bg-background border-border focus:border-primary"
                required
                disabled={!!user?.email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                className="h-12 bg-background border-border focus:border-primary"
                placeholder="(555) 123-4567"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateForm("age", e.target.value)}
                  className="h-12 bg-background border-border focus:border-primary"
                  placeholder="30"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height" className="text-sm font-medium">Height</Label>
                <Input
                  id="height"
                  placeholder="5'10&quot;"
                  value={formData.height}
                  onChange={(e) => updateForm("height", e.target.value)}
                  className="h-12 bg-background border-border focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm font-medium">Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateForm("weight", e.target.value)}
                  className="h-12 bg-background border-border focus:border-primary"
                  placeholder="180"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Goal Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">What's your mission?</Label>
              <div className="grid grid-cols-1 gap-3">
                {goalOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.goal === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateForm("goal", option.value)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border bg-background hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">{option.value}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Training Experience</Label>
              <div className="grid grid-cols-3 gap-3">
                {experienceOptions.map((option) => {
                  const isSelected = formData.experience === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateForm("experience", option.value)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-center",
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border bg-background hover:border-primary/50"
                      )}
                    >
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Equipment */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Available Equipment</Label>
              <div className="grid grid-cols-2 gap-3">
                {equipmentOptions.map((option) => {
                  const isSelected = formData.equipment === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateForm("equipment", option.value)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-left",
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border bg-background hover:border-primary/50"
                      )}
                    >
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Injuries */}
            <div className="space-y-2">
              <Label htmlFor="injuries" className="text-base font-semibold">Any limitations?</Label>
              <Textarea
                id="injuries"
                value={formData.injuries}
                onChange={(e) => updateForm("injuries", e.target.value)}
                placeholder="List any injuries, surgeries, or physical limitations we should know about..."
                className="bg-background border-border min-h-[100px]"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">The Foundation</h3>
              <p className="text-muted-foreground">
                This isn't just fitness. It's faith-led transformation.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/30">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Redeemed Strength is built on Christian faith principles. Scripture, prayer, 
                and God-led discipline are <strong>core components</strong> — not optional add-ons.
                Every workout, every discipline routine, every challenge is designed to strengthen 
                both body and spirit.
              </p>

              <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/80 mb-6">
                "I can do all things through Christ who strengthens me." — Philippians 4:13
              </blockquote>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50">
                <Checkbox
                  id="faithCommitment"
                  checked={formData.faithCommitment}
                  onCheckedChange={(checked) => updateForm("faithCommitment", checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="faithCommitment" className="cursor-pointer leading-relaxed font-medium">
                  I understand and embrace that faith is the foundation of this program. 
                  I'm ready to integrate spiritual disciplines alongside physical training.
                </Label>
              </div>
            </div>

            {formData.faithCommitment && (
              <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/30">
                <Check className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-primary font-medium">You're ready to begin your sentence.</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.phone && formData.age && formData.height && formData.weight;
      case 2:
        return formData.goal && formData.experience && formData.equipment;
      case 3:
        return formData.faithCommitment;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-charcoal to-background pt-20 pb-12">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
        <div className="section-container relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className={cn("inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 border", getTierColor(), "border-current/30 bg-current/10")}>
              Entering: {getTierName()}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Inmate <span className="text-primary">Processing</span>
            </h1>
            <p className="text-muted-foreground">
              Complete your intake to access your program.
            </p>
          </div>
        </div>
      </div>

      <section className="pb-20 -mt-4">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 px-4">
              {stepConfig.map((s, index) => {
                const Icon = s.icon;
                const stepNum = index + 1;
                const isActive = step === stepNum;
                const isCompleted = step > stepNum;
                
                return (
                  <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                        isCompleted ? "bg-primary text-primary-foreground" :
                        isActive ? "bg-primary/20 text-primary border-2 border-primary" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <span className={cn(
                        "text-xs mt-2 font-medium",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}>
                        {s.title}
                      </span>
                    </div>
                    {index < stepConfig.length - 1 && (
                      <div className={cn(
                        "h-0.5 w-16 sm:w-24 mx-2",
                        step > stepNum ? "bg-primary" : "bg-border"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form Card */}
            <div className="bg-card rounded-xl border border-border shadow-xl overflow-hidden">
              {/* Step Header */}
              <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex items-center gap-4">
                  {(() => {
                    const Icon = stepConfig[step - 1].icon;
                    return <Icon className="w-6 h-6 text-primary" />;
                  })()}
                  <div>
                    <h2 className="text-lg font-semibold">{stepConfig[step - 1].subtitle}</h2>
                    <p className="text-sm text-muted-foreground">{stepConfig[step - 1].description}</p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 md:p-8">
                {renderStep()}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
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
                    disabled={!canProceed()}
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
                        Processing...
                      </>
                    ) : (
                      <>
                        Complete Processing <Check className="w-4 h-4" />
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