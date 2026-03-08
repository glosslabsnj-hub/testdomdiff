import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  User,
  Target,
  Shield,
  ClipboardCheck,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { label: "About You", icon: User },
  { label: "Training Goals", icon: Target },
  { label: "Commitment", icon: Shield },
  { label: "Review & Submit", icon: ClipboardCheck },
];

type Experience = "beginner" | "intermediate" | "advanced" | "athlete";
type TrainingPreference = "in-person" | "online" | "hybrid";
type CommitmentLevel = "all-in" | "serious" | "exploring";

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  instagram: string;
  age: string;
  goals: string;
  experience: Experience | "";
  training_preference: TrainingPreference | "";
  location: string;
  current_workout: string;
  why_coaching: string;
  commitment_level: CommitmentLevel | "";
  injuries_limitations: string;
  budget_confirmed: boolean;
}

const initialFormData: FormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  instagram: "",
  age: "",
  goals: "",
  experience: "",
  training_preference: "",
  location: "",
  current_workout: "",
  why_coaching: "",
  commitment_level: "",
  injuries_limitations: "",
  budget_confirmed: false,
};

const CoachingApplication = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Auto-fill email from auth
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData((prev) => ({ ...prev, email: user.email! }));
    }
  }, [user]);

  const update = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (s: number): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};

    if (s === 0) {
      if (!formData.first_name.trim()) errs.first_name = "Required";
      if (!formData.last_name.trim()) errs.last_name = "Required";
      if (!formData.email.trim()) errs.email = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
        errs.email = "Invalid email";
    }

    if (s === 1) {
      if (!formData.goals.trim()) errs.goals = "Required";
      if (!formData.experience) errs.experience = "Required";
      if (!formData.training_preference) errs.training_preference = "Required";
      if (
        (formData.training_preference === "in-person" ||
          formData.training_preference === "hybrid") &&
        !formData.location.trim()
      )
        errs.location = "Required for in-person/hybrid";
    }

    if (s === 2) {
      if (!formData.why_coaching.trim()) errs.why_coaching = "Required";
      if (!formData.commitment_level) errs.commitment_level = "Required";
      if (!formData.budget_confirmed) errs.budget_confirmed = "You must confirm the investment";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("coaching_applications" as any).insert({
        user_id: user?.id || null,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        instagram: formData.instagram.trim() || null,
        age: formData.age ? parseInt(formData.age, 10) : null,
        goals: formData.goals.trim(),
        experience: formData.experience,
        training_preference: formData.training_preference,
        location: formData.location.trim() || null,
        current_workout: formData.current_workout.trim() || null,
        why_coaching: formData.why_coaching.trim(),
        commitment_level: formData.commitment_level,
        injuries_limitations: formData.injuries_limitations.trim() || null,
        budget_confirmed: formData.budget_confirmed,
      } as any);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Dom will review your application within 48 hours.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success state ──
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="pt-32 pb-20">
          <div className="section-container">
            <div className="max-w-lg mx-auto text-center animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h1 className="headline-section mb-4">Application Received</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Dom will personally review your application and get back to you within 48 hours.
                Keep an eye on your email for next steps.
              </p>
              <div className="bg-charcoal p-6 rounded-lg border border-border mb-8 text-left">
                <h3 className="font-semibold mb-3">What happens next:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Dom reviews your application (within 48 hours)
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <p className="text-sm text-muted-foreground">
                      If approved, you'll receive an email with payment instructions
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete payment and get started with your custom coaching program
                    </p>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gold" asChild>
                  <Link to="/programs">Browse Programs</Link>
                </Button>
                <Button variant="goldOutline" asChild>
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            {/* Title */}
            <div className="text-center mb-10">
              <h1 className="headline-section mb-2">
                Apply for <span className="text-primary">1:1 Coaching</span>
              </h1>
              <p className="text-muted-foreground">
                $499/month &middot; Limited spots &middot; Application required
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-between mb-10 px-2">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === step;
                const isDone = i < step;
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isDone
                          ? "bg-primary border-primary text-primary-foreground"
                          : isActive
                          ? "border-primary text-primary bg-primary/10"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span
                      className={`text-xs hidden sm:block ${
                        isActive ? "text-primary font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`hidden sm:block absolute h-0.5 ${
                          isDone ? "bg-primary" : "bg-border"
                        }`}
                        style={{ display: "none" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-border rounded-full mb-8">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>

            {/* Card */}
            <div className="bg-charcoal rounded-lg border border-border p-6 sm:p-8">
              {/* Step 1: About You */}
              {step === 0 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="headline-card mb-6">About You</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => update("first_name", e.target.value)}
                        className="bg-background border-border mt-2 h-11 min-h-[44px]"
                        placeholder="First name"
                      />
                      {errors.first_name && (
                        <p className="text-red-400 text-xs mt-1">{errors.first_name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => update("last_name", e.target.value)}
                        className="bg-background border-border mt-2 h-11 min-h-[44px]"
                        placeholder="Last name"
                      />
                      {errors.last_name && (
                        <p className="text-red-400 text-xs mt-1">{errors.last_name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="bg-background border-border mt-2 h-11 min-h-[44px]"
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        className="bg-background border-border mt-2 h-11 min-h-[44px]"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram">Instagram Handle</Label>
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => update("instagram", e.target.value)}
                        className="bg-background border-border mt-2 h-11 min-h-[44px]"
                        placeholder="@yourhandle"
                      />
                    </div>
                  </div>

                  <div className="max-w-[200px]">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="13"
                      max="99"
                      value={formData.age}
                      onChange={(e) => update("age", e.target.value)}
                      className="bg-background border-border mt-2 h-11 min-h-[44px]"
                      placeholder="25"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Training Goals */}
              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="headline-card mb-6">Training Goals</h2>

                  <div>
                    <Label htmlFor="goals">What are your fitness goals? *</Label>
                    <Textarea
                      id="goals"
                      value={formData.goals}
                      onChange={(e) => update("goals", e.target.value)}
                      className="bg-background border-border mt-2 min-h-[100px]"
                      placeholder="Describe what you want to achieve..."
                    />
                    {errors.goals && (
                      <p className="text-red-400 text-xs mt-1">{errors.goals}</p>
                    )}
                  </div>

                  <div>
                    <Label>Experience Level *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                      {(
                        [
                          { value: "beginner", label: "Beginner" },
                          { value: "intermediate", label: "Intermediate" },
                          { value: "advanced", label: "Advanced" },
                          { value: "athlete", label: "Athlete" },
                        ] as { value: Experience; label: string }[]
                      ).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => update("experience", opt.value)}
                          className={`h-11 min-h-[44px] px-4 rounded-lg border text-sm font-medium transition-all ${
                            formData.experience === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {errors.experience && (
                      <p className="text-red-400 text-xs mt-1">{errors.experience}</p>
                    )}
                  </div>

                  <div>
                    <Label>Training Preference *</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {(
                        [
                          { value: "in-person", label: "In-Person" },
                          { value: "online", label: "Online" },
                          { value: "hybrid", label: "Hybrid" },
                        ] as { value: TrainingPreference; label: string }[]
                      ).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => update("training_preference", opt.value)}
                          className={`h-11 min-h-[44px] px-4 rounded-lg border text-sm font-medium transition-all ${
                            formData.training_preference === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {errors.training_preference && (
                      <p className="text-red-400 text-xs mt-1">{errors.training_preference}</p>
                    )}
                  </div>

                  {(formData.training_preference === "in-person" ||
                    formData.training_preference === "hybrid") && (
                    <div className="animate-fade-in">
                      <Label htmlFor="location">Your Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => update("location", e.target.value)}
                        className="bg-background border-border mt-2 h-11 min-h-[44px]"
                        placeholder="City, State"
                      />
                      {errors.location && (
                        <p className="text-red-400 text-xs mt-1">{errors.location}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="current_workout">Current Workout Routine</Label>
                    <Textarea
                      id="current_workout"
                      value={formData.current_workout}
                      onChange={(e) => update("current_workout", e.target.value)}
                      className="bg-background border-border mt-2 min-h-[80px]"
                      placeholder="What does your current training look like? (optional)"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Commitment */}
              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="headline-card mb-6">Commitment</h2>

                  <div>
                    <Label htmlFor="why_coaching">
                      Why do you want 1:1 coaching with Dom? *
                    </Label>
                    <Textarea
                      id="why_coaching"
                      value={formData.why_coaching}
                      onChange={(e) => update("why_coaching", e.target.value)}
                      className="bg-background border-border mt-2 min-h-[120px]"
                      placeholder="Tell Dom why you're ready to take this step..."
                    />
                    {errors.why_coaching && (
                      <p className="text-red-400 text-xs mt-1">{errors.why_coaching}</p>
                    )}
                  </div>

                  <div>
                    <Label>Commitment Level *</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {(
                        [
                          { value: "all-in", label: "All In", desc: "100% committed" },
                          { value: "serious", label: "Serious", desc: "Ready to work" },
                          { value: "exploring", label: "Exploring", desc: "Learning more" },
                        ] as { value: CommitmentLevel; label: string; desc: string }[]
                      ).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => update("commitment_level", opt.value)}
                          className={`h-auto min-h-[44px] px-4 py-3 rounded-lg border text-sm transition-all text-left ${
                            formData.commitment_level === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          <div className="font-medium">{opt.label}</div>
                          <div className="text-xs opacity-70">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                    {errors.commitment_level && (
                      <p className="text-red-400 text-xs mt-1">{errors.commitment_level}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="injuries">Injuries or Limitations</Label>
                    <Textarea
                      id="injuries"
                      value={formData.injuries_limitations}
                      onChange={(e) => update("injuries_limitations", e.target.value)}
                      className="bg-background border-border mt-2 min-h-[80px]"
                      placeholder="Any injuries, medical conditions, or limitations Dom should know about? (optional)"
                    />
                  </div>

                  <div
                    className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                      formData.budget_confirmed
                        ? "border-primary bg-primary/5"
                        : errors.budget_confirmed
                        ? "border-red-400 bg-red-400/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => update("budget_confirmed", !formData.budget_confirmed)}
                      className={`w-6 h-6 min-h-[44px] min-w-[24px] rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 ${
                        formData.budget_confirmed
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                      style={{ minHeight: "24px" }}
                    >
                      {formData.budget_confirmed && (
                        <Check className="w-4 h-4 text-primary-foreground" />
                      )}
                    </button>
                    <div>
                      <p className="text-sm font-medium">
                        I understand coaching is $499/month and I'm ready to invest in myself
                      </p>
                      {errors.budget_confirmed && (
                        <p className="text-red-400 text-xs mt-1">{errors.budget_confirmed}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="headline-card mb-6">Review Your Application</h2>

                  <div className="space-y-4">
                    {/* About You */}
                    <div className="p-4 bg-background rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                          About You
                        </h3>
                        <button
                          type="button"
                          onClick={() => setStep(0)}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>{" "}
                          {formData.first_name} {formData.last_name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span> {formData.email}
                        </div>
                        {formData.phone && (
                          <div>
                            <span className="text-muted-foreground">Phone:</span>{" "}
                            {formData.phone}
                          </div>
                        )}
                        {formData.instagram && (
                          <div>
                            <span className="text-muted-foreground">Instagram:</span>{" "}
                            {formData.instagram}
                          </div>
                        )}
                        {formData.age && (
                          <div>
                            <span className="text-muted-foreground">Age:</span> {formData.age}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Training Goals */}
                    <div className="p-4 bg-background rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                          Training Goals
                        </h3>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Goals:</span>{" "}
                          {formData.goals}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Experience:</span>{" "}
                          <span className="capitalize">{formData.experience}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Preference:</span>{" "}
                          <span className="capitalize">{formData.training_preference}</span>
                        </div>
                        {formData.location && (
                          <div>
                            <span className="text-muted-foreground">Location:</span>{" "}
                            {formData.location}
                          </div>
                        )}
                        {formData.current_workout && (
                          <div>
                            <span className="text-muted-foreground">Current Routine:</span>{" "}
                            {formData.current_workout}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Commitment */}
                    <div className="p-4 bg-background rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                          Commitment
                        </h3>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Why coaching:</span>{" "}
                          {formData.why_coaching}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Commitment:</span>{" "}
                          <span className="capitalize">
                            {formData.commitment_level.replace("-", " ")}
                          </span>
                        </div>
                        {formData.injuries_limitations && (
                          <div>
                            <span className="text-muted-foreground">
                              Injuries/Limitations:
                            </span>{" "}
                            {formData.injuries_limitations}
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Budget confirmed:</span>{" "}
                          <span className="text-green-400">Yes, $499/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={back}
                    className="h-11 min-h-[44px]"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    variant="gold"
                    onClick={next}
                    className="h-11 min-h-[44px]"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="gold"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-11 min-h-[44px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CoachingApplication;
