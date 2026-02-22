import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CancelSubscriptionDialogProps {
  trigger?: React.ReactNode;
}

export function CancelSubscriptionDialog({ trigger }: CancelSubscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"confirm" | "reason">("confirm");
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { subscription, refreshSubscription } = useAuth();

  const handleCancel = async () => {
    if (!subscription) return;

    setIsProcessing(true);
    try {
      // Cancel via Stripe edge function (handles both Stripe API + DB update)
      const { data, error } = await supabase.functions.invoke("stripe-cancel-subscription", {
        body: {
          subscriptionId: subscription.id,
          reason: reason.trim() || undefined,
        },
      });

      if (error) throw new Error(error.message || "Failed to cancel subscription");
      if (data?.error) throw new Error(data.error);

      await refreshSubscription();

      toast({
        title: "Subscription cancelled",
        description: "Your access will continue until the end of your billing period.",
      });

      setOpen(false);
      setStep("confirm");
      setReason("");
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to cancel subscription. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    setStep("reason");
  };

  const handleBack = () => {
    setStep("confirm");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setStep("confirm");
      setReason("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="text-destructive hover:text-destructive">
            Cancel Subscription
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-charcoal border-border">
        {step === "confirm" ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Are you sure you want to leave?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 text-muted-foreground">
                <p>
                  Cancelling your subscription means you'll lose access to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Your personalized training program</li>
                  <li>Faith and discipline content</li>
                  <li>Community access</li>
                  <li>Progress tracking</li>
                </ul>
                <p className="text-primary font-medium pt-2">
                  Your progress and data will be saved if you decide to return.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border">Stay Strong</AlertDialogCancel>
              <Button 
                variant="destructive" 
                onClick={handleContinue}
              >
                Continue to Cancel
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">
                Help us improve
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Before you go, please tell us why you're leaving. Your feedback helps us serve our community better.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="py-4">
              <Label htmlFor="cancel-reason" className="text-sm text-muted-foreground">
                Reason for cancelling (optional)
              </Label>
              <Textarea
                id="cancel-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let us know what we could do better..."
                className="mt-2 bg-charcoal-dark border-border"
                rows={3}
              />
            </div>

            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleBack} className="border-border">
                Go Back
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancel}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Confirm Cancellation"
                )}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
