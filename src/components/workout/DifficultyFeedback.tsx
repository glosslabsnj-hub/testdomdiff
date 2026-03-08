import { useState } from "react";
import { TrendingUp, MessageCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { cn } from "@/lib/utils";

const DOM_USER_ID = "18e7960e-cc1d-4318-a2c5-443519a7cdba";

interface DifficultyFeedbackProps {
  currentWeek: number;
  trackName: string;
  planType: string;
}

const DifficultyFeedback = ({ currentWeek, trackName, planType }: DifficultyFeedbackProps) => {
  const { sendMessage } = useDirectMessages();
  const [upgradeSent, setUpgradeSent] = useState(false);
  const [helpSent, setHelpSent] = useState(false);
  const [upgradeSending, setUpgradeSending] = useState(false);
  const [helpSending, setHelpSending] = useState(false);

  const handleRequestUpgrade = async () => {
    setUpgradeSending(true);
    const message = `I'm in Week ${currentWeek} of ${trackName} (${planType} tier) and the program isn't challenging enough. I'd like to discuss upgrading my difficulty.`;
    const success = await sendMessage(DOM_USER_ID, message);
    if (success) setUpgradeSent(true);
    setUpgradeSending(false);
  };

  const handleTalkToDom = async () => {
    setHelpSending(true);
    const message = `I'm in Week ${currentWeek} of ${trackName} (${planType} tier) and I'm having difficulty with the program. I could use some guidance.`;
    const success = await sendMessage(DOM_USER_ID, message);
    if (success) setHelpSent(true);
    setHelpSending(false);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
      {/* Card 1: Not challenging enough */}
      <div className="p-4 sm:p-6 rounded-xl bg-charcoal border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display text-lg">Not challenging enough?</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Ready to level up? Let Dom know and he'll adjust your programming.
        </p>
        {upgradeSent ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <Check className="w-4 h-4 text-primary" />
            <p className="text-sm text-primary font-medium">Message sent! Dom will get back to you.</p>
          </div>
        ) : (
          <Button
            variant="gold"
            onClick={handleRequestUpgrade}
            disabled={upgradeSending}
            className="w-full gap-2 min-h-[44px]"
          >
            {upgradeSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            Request Upgrade
          </Button>
        )}
      </div>

      {/* Card 2: Need help */}
      <div className="p-4 sm:p-6 rounded-xl bg-charcoal border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg">Need help with the program?</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Struggling is part of growth. Don't quit — talk to Dom.
        </p>
        {helpSent ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <Check className="w-4 h-4 text-primary" />
            <p className="text-sm text-primary font-medium">
              Message sent! Remember — iron sharpens iron.
            </p>
          </div>
        ) : (
          <Button
            variant="goldOutline"
            onClick={handleTalkToDom}
            disabled={helpSending}
            className="w-full gap-2 min-h-[44px]"
          >
            {helpSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
            Talk to Dom
          </Button>
        )}
      </div>
    </div>
  );
};

export default DifficultyFeedback;
