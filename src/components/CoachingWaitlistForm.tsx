import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CoachingWaitlistFormProps {
  onSuccess?: () => void;
}

export function CoachingWaitlistForm({ onSuccess }: CoachingWaitlistFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("coaching_waitlist").insert({
        email: formData.email.trim().toLowerCase(),
        first_name: formData.first_name.trim() || null,
        phone: formData.phone.trim() || null,
        notes: formData.notes.trim() || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already on the list",
            description: "You're already on the waitlist. We'll reach out when a spot opens.",
          });
          setIsSubmitted(true);
        } else {
          throw error;
        }
      } else {
        toast({
          title: "You're on the list!",
          description: "We'll contact you when a coaching spot opens up.",
        });
        setIsSubmitted(true);
        onSuccess?.();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h3 className="headline-card mb-2">You're On The List</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          We'll reach out personally when a coaching spot opens up. In the meantime, 
          consider starting with Gen Pop to begin your transformation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg mb-6">
        <Clock className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm text-primary">
          All 10 coaching spots are currently filled. Join the waitlist to be notified first.
        </p>
      </div>

      <div>
        <Label htmlFor="waitlist-email">Email *</Label>
        <Input
          id="waitlist-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="bg-charcoal border-border mt-2"
          placeholder="your@email.com"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="waitlist-name">First Name</Label>
          <Input
            id="waitlist-name"
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="bg-charcoal border-border mt-2"
            placeholder="John"
          />
        </div>
        <div>
          <Label htmlFor="waitlist-phone">Phone</Label>
          <Input
            id="waitlist-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="bg-charcoal border-border mt-2"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="waitlist-notes">Why do you want 1:1 coaching?</Label>
        <Textarea
          id="waitlist-notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="bg-charcoal border-border mt-2 min-h-[100px]"
          placeholder="Tell us about your goals and why you're ready for the next level..."
        />
      </div>

      <Button
        type="submit"
        variant="gold"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Joining...
          </>
        ) : (
          "Join Waitlist"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        We'll only contact you about coaching availability.
      </p>
    </form>
  );
}

export default CoachingWaitlistForm;
