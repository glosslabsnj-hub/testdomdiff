import { useState, useEffect } from "react";
import { Gift, Copy, Share2, Users, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReferralCompletion {
  id: string;
  referred_user_id: string;
  referred_plan: string | null;
  status: string;
  created_at: string;
  credited_at: string | null;
}

const ReferralCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [completions, setCompletions] = useState<ReferralCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchReferralData = async () => {
      setLoading(true);
      try {
        // Fetch referral code
        const { data: codeData } = await supabase
          .from("referral_codes")
          .select("code")
          .eq("user_id", user.id)
          .maybeSingle();

        if (codeData?.code) {
          setReferralCode(codeData.code);
        }

        // Fetch referral completions
        const { data: completionData } = await supabase
          .from("referral_completions")
          .select("*")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false });

        if (completionData) {
          setCompletions(completionData as ReferralCompletion[]);
        }
      } catch (err) {
        console.error("Error fetching referral data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [user]);

  const shareLink = referralCode
    ? `https://domdifferent.com/checkout?plan=transformation&ref=${referralCode}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({ title: "Copied!", description: "Referral link copied to clipboard." });
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = shareLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast({ title: "Copied!", description: "Referral link copied to clipboard." });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Dom Different",
          text: "Get the transformation program that changed my life. Use my referral link:",
          url: shareLink,
        });
      } catch {
        // User cancelled share — no-op
      }
    } else {
      handleCopy();
    }
  };

  const successfulReferrals = completions.filter(
    (c) => c.status === "completed" || c.status === "credited"
  ).length;
  const creditedReferrals = completions.filter((c) => c.status === "credited").length;
  const freeDaysEarned = creditedReferrals * 30;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!referralCode) {
    return (
      <div className="p-6 rounded-lg bg-charcoal border border-border">
        <div className="flex items-center gap-3 mb-3">
          <Gift className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Refer a Friend</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Your referral code will be generated once your subscription is active.
          Refer friends and earn a free month for every signup!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Share Link */}
      <div className="p-4 rounded-lg bg-background border border-primary/30">
        <p className="text-xs text-muted-foreground mb-2">Your referral link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-charcoal px-3 py-2 rounded border border-border truncate">
            {shareLink}
          </code>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant="gold"
            size="sm"
            className="flex-1 min-h-[44px]"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-h-[44px]"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-background border border-border text-center">
          <p className="text-2xl font-display text-primary">{completions.length}</p>
          <p className="text-xs text-muted-foreground">Referrals</p>
        </div>
        <div className="p-3 rounded-lg bg-background border border-border text-center">
          <p className="text-2xl font-display text-primary">{successfulReferrals}</p>
          <p className="text-xs text-muted-foreground">Signups</p>
        </div>
        <div className="p-3 rounded-lg bg-background border border-border text-center">
          <p className="text-2xl font-display text-primary">{freeDaysEarned}</p>
          <p className="text-xs text-muted-foreground">Free Days</p>
        </div>
      </div>

      {/* How it works */}
      <div className="p-4 rounded-lg bg-background border border-border">
        <p className="text-xs font-semibold mb-2 text-primary">How it works</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>1. Share your unique link with friends</li>
          <li>2. They sign up and pay for any plan</li>
          <li>3. You get 30 free days added to your subscription</li>
        </ul>
      </div>

      {/* Completed Referrals */}
      {completions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Recent Referrals</p>
          {completions.slice(0, 5).map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {c.referred_plan || "Unknown plan"}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {c.status === "credited" ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">+30 days</span>
                  </>
                ) : (
                  <span className="text-xs text-primary">Pending</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferralCard;
