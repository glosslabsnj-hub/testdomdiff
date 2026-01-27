import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ArrowRight, ArrowLeft, Loader2, User, Target, Cross, Dumbbell, Activity, Shield, Camera, SkipForward } from "lucide-react";
import StickyMobileFooter from "@/components/StickyMobileFooter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProgressPhotos } from "@/hooks/useProgressPhotos";
import { cn } from "@/lib/utils";
import PhotoUploadCard from "@/components/progress/PhotoUploadCard";
import { z } from "zod";

// Validation schemas for each step
const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  phone: z.string().min(7, "Please enter a valid phone number").max(20, "Phone number is too long"),
  age: z.string().refine(val => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 13 && num <= 120;
  }, "Please enter a valid age (13-120)"),
  height: z.string().min(1, "Height is required"),
  weight: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num < 1000;
  }, "Please enter a valid weight"),
});

const step2Schema = z.object({
  goal: z.string().min(1, "Please select a goal"),
  experience: z.string().min(1, "Please select your experience level"),
});

const step3Schema = z.object({
  faithCommitment: z.literal(true, {
    errorMap: () => ({ message: "Please acknowledge the faith commitment to continue" }),
  }),
});

const Intake = () => {
  const navigate = useNavigate();
  const { user, profile, subscription, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { uploadPhoto, getPhotosByType } = useProgressPhotos();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skippedPhotos, setSkippedPhotos] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const totalSteps = 4;
  const isCoaching = subscription?.plan_type === "coaching";
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
        injuries: profile.injuries || prev.injuries,
        faithCommitment: profile.faith_commitment || prev.faithCommitment,
      }));
    }
  }, [profile]);

  const updateForm = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
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
        title: isCoaching ? "Welcome Aboard!" : "Processing Complete!",
        description: isCoaching 
          ? "You're ready to begin. Let's get to work."
          : "Welcome to the program. Your sentence begins now.",
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
      title: "Profile", 
      subtitle: "Your Profile",
      icon: User,
      description: "We need these basics to personalize your experience"
    },
    { 
      title: "Mission", 
      subtitle: "Your Mission",
      icon: Target,
      description: "This helps us match you with the right program"
    },
    { 
      title: "Foundation", 
      subtitle: "The Foundation",
      icon: Cross,
      description: "Your commitment seals the deal"
    },
    { 
      title: "Photos", 
      subtitle: isCoaching ? "Starting Point" : "Day 1 Mugshot",
      icon: Camera,
      description: "Document where you're starting (optional but encouraged)"
    },
  ];

  // Get existing before photos
  const beforePhotos = getPhotosByType("before");

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


  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">First Name <span className="text-destructive">*</span></Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateForm("firstName", e.target.value)}
                  className={cn(
                    "h-12 bg-background border-border focus:border-primary",
                    errors.firstName && "border-destructive focus:border-destructive"
                  )}
                  placeholder="John"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? "firstName-error" : undefined}
                />
                {errors.firstName && (
                  <p id="firstName-error" className="text-sm text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name <span className="text-destructive">*</span></Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateForm("lastName", e.target.value)}
                  className={cn(
                    "h-12 bg-background border-border focus:border-primary",
                    errors.lastName && "border-destructive focus:border-destructive"
                  )}
                  placeholder="Doe"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? "lastName-error" : undefined}
                />
                {errors.lastName && (
                  <p id="lastName-error" className="text-sm text-destructive">{errors.lastName}</p>
                )}
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
              <Label htmlFor="phone" className="text-sm font-medium">Phone <span className="text-destructive">*</span></Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                className={cn(
                  "h-12 bg-background border-border focus:border-primary",
                  errors.phone && "border-destructive focus:border-destructive"
                )}
                placeholder="(555) 123-4567"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <p id="phone-error" className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">Age <span className="text-destructive">*</span></Label>
                <Input
                  id="age"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.age}
                  onChange={(e) => updateForm("age", e.target.value)}
                  className={cn(
                    "h-12 bg-background border-border focus:border-primary",
                    errors.age && "border-destructive focus:border-destructive"
                  )}
                  placeholder="30"
                  aria-invalid={!!errors.age}
                  aria-describedby={errors.age ? "age-error" : undefined}
                />
                {errors.age && (
                  <p id="age-error" className="text-sm text-destructive">{errors.age}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="height" className="text-sm font-medium">Height <span className="text-destructive">*</span></Label>
                <Input
                  id="height"
                  placeholder="5'10"
                  value={formData.height}
                  onChange={(e) => updateForm("height", e.target.value)}
                  className={cn(
                    "h-12 bg-background border-border focus:border-primary",
                    errors.height && "border-destructive focus:border-destructive"
                  )}
                  aria-invalid={!!errors.height}
                  aria-describedby={errors.height ? "height-error" : undefined}
                />
                {errors.height && (
                  <p id="height-error" className="text-sm text-destructive">{errors.height}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm font-medium">Weight <span className="text-destructive">*</span></Label>
                <Input
                  id="weight"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                  value={formData.weight}
                  onChange={(e) => updateForm("weight", e.target.value)}
                  className={cn(
                    "h-12 bg-background border-border focus:border-primary",
                    errors.weight && "border-destructive focus:border-destructive"
                  )}
                  placeholder="180"
                  aria-invalid={!!errors.weight}
                  aria-describedby={errors.weight ? "weight-error" : undefined}
                />
                {errors.weight && (
                  <p id="weight-error" className="text-sm text-destructive">{errors.weight}</p>
                )}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

              <div className={cn(
                "flex items-start gap-4 p-4 rounded-lg bg-background/50",
                errors.faithCommitment && "ring-2 ring-destructive"
              )}>
                <Checkbox
                  id="faithCommitment"
                  checked={formData.faithCommitment}
                  onCheckedChange={(checked) => updateForm("faithCommitment", checked as boolean)}
                  className="mt-1 min-w-[20px] min-h-[20px]"
                  aria-invalid={!!errors.faithCommitment}
                  aria-describedby={errors.faithCommitment ? "faithCommitment-error" : undefined}
                />
                <Label htmlFor="faithCommitment" className="cursor-pointer leading-relaxed font-medium">
                  I understand and embrace that faith is the foundation of this program. 
                  I'm ready to integrate spiritual disciplines alongside physical training.
                </Label>
              </div>
              {errors.faithCommitment && (
                <p id="faithCommitment-error" className="text-sm text-destructive mt-2">{errors.faithCommitment}</p>
              )}
            </div>

            {formData.faithCommitment && (
              <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/30">
                <Check className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-primary font-medium">
                  {isCoaching ? "You're ready to begin your journey." : "You're ready to begin your sentence."}
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isCoaching ? "Document Your Starting Point" : "Day 1 Mugshot"}
              </h3>
              <p className="text-muted-foreground">
                {isCoaching 
                  ? "Take photos now to compare with your results later. These are private by default."
                  : "Your transformation starts with proof. Upload your Day 1 photos for comparison later."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PhotoUploadCard
                photoType="before"
                existingPhotoUrl={beforePhotos[0]?.url}
                onUpload={(file, options) => uploadPhoto(file, "before", options)}
              />
              <PhotoUploadCard
                photoType="before"
                existingPhotoUrl={beforePhotos[1]?.url}
                onUpload={(file, options) => uploadPhoto(file, "before", options)}
              />
              <PhotoUploadCard
                photoType="before"
                existingPhotoUrl={beforePhotos[2]?.url}
                onUpload={(file, options) => uploadPhoto(file, "before", options)}
              />
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Privacy:</strong> These photos are private by default. Only you can see them unless you choose to share later.
              </p>
            </div>

            {(beforePhotos.length > 0 || skippedPhotos) && (
              <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/30">
                <Check className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-primary font-medium">
                  {beforePhotos.length > 0 
                    ? `${beforePhotos.length} photo${beforePhotos.length > 1 ? 's' : ''} uploaded. You're ready to complete intake.`
                    : "You can always add photos later in the Progress section."}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const validateStep = (stepNum: number): boolean => {
    setErrors({});
    
    try {
      switch (stepNum) {
        case 1:
          step1Schema.parse({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            age: formData.age,
            height: formData.height,
            weight: formData.weight,
          });
          return true;
        case 2:
          step2Schema.parse({
            goal: formData.goal,
            experience: formData.experience,
          });
          return true;
        case 3:
          step3Schema.parse({
            faithCommitment: formData.faithCommitment,
          });
          return true;
        case 4:
          return true;
        default:
          return false;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        
        toast({
          title: "Please fix the errors",
          description: "Some required fields need attention",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.phone && formData.age && formData.height && formData.weight;
      case 2:
        return formData.goal && formData.experience;
      case 3:
        return formData.faithCommitment;
      case 4:
        // Photo step is optional - can always proceed
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
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
              {isCoaching ? "Client" : "Inmate"} <span className="text-primary">{isCoaching ? "Onboarding" : "Processing"}</span>
            </h1>
            <p className="text-muted-foreground">
              {isCoaching 
                ? "Complete your profile to begin your coaching journey."
                : "Complete your intake to access your program."}
            </p>
          </div>
        </div>
      </div>

      <section className="pb-20 -mt-2 sm:-mt-4">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            {/* Step Indicators */}
            <div className="flex items-center justify-center mb-8 pt-4 sm:pt-0">
              {stepConfig.map((s, index) => {
                const Icon = s.icon;
                const stepNum = index + 1;
                const isActive = step === stepNum;
                const isCompleted = step > stepNum;
                
                return (
                  <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all",
                        isCompleted ? "bg-primary text-primary-foreground" :
                        isActive ? "bg-primary/20 text-primary border-2 border-primary" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </div>
                      <span className={cn(
                        "text-xs mt-2 font-medium whitespace-nowrap",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}>
                        {s.title}
                      </span>
                    </div>
                    {index < stepConfig.length - 1 && (
                      <div className={cn(
                        "h-0.5 flex-1 min-w-8 max-w-24 mx-2 sm:mx-4",
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

              {/* Navigation - Desktop only (mobile uses sticky footer) */}
              <div className="hidden md:flex items-center justify-between p-6 border-t border-border bg-muted/30">
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>

                {step < totalSteps ? (
                  <div className="flex gap-2">
                    {step === 4 && beforePhotos.length === 0 && !skippedPhotos && (
                      <Button
                        variant="ghost"
                        onClick={() => setSkippedPhotos(true)}
                        className="gap-2 text-muted-foreground"
                      >
                        <SkipForward className="w-4 h-4" /> Skip for now
                      </Button>
                    )}
                    <Button
                      variant="gold"
                      onClick={handleNextStep}
                      disabled={!canProceed()}
                      className="gap-2"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="gold"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {isCoaching ? "Complete Onboarding" : "Complete Processing"} <Check className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Sticky Navigation */}
            <StickyMobileFooter className="md:hidden">
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="gap-2 flex-shrink-0"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden xs:inline">Back</span>
                </Button>

                <div className="flex gap-2 flex-1 justify-end">
                  {step === 4 && beforePhotos.length === 0 && !skippedPhotos && (
                    <Button
                      variant="ghost"
                      onClick={() => setSkippedPhotos(true)}
                      className="gap-1 text-muted-foreground"
                      size="lg"
                    >
                      <SkipForward className="w-4 h-4" />
                      <span className="hidden xs:inline">Skip</span>
                    </Button>
                  )}
                  {step < totalSteps ? (
                    <Button
                      variant="gold"
                      onClick={handleNextStep}
                      disabled={!canProceed()}
                      className="gap-2 flex-1 max-w-[200px]"
                      size="lg"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="gold"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="gap-2 flex-1"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden xs:inline">Processing...</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden xs:inline">{isCoaching ? "Complete" : "Complete"}</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </StickyMobileFooter>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Intake;