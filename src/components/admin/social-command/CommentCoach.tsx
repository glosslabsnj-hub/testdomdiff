import { useState } from "react";
import {
  MessageCircle,
  Loader2,
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Users,
  Zap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CommentResponse {
  reply: string;
  strategy: string;
  engagement_tip: string;
  alternative: string;
}

const COMMENT_TYPES = [
  { value: "supporter", label: "Supporter / Fan", icon: ThumbsUp, color: "text-green-400", description: "Someone showing love, praising your content" },
  { value: "hater", label: "Hater / Troll", icon: ThumbsDown, color: "text-red-400", description: "Someone talking shit, being negative" },
  { value: "question", label: "Question", icon: HelpCircle, color: "text-blue-400", description: "Someone asking about training, your story, etc." },
  { value: "creator", label: "Other Creator", icon: Users, color: "text-purple-400", description: "Another content creator commenting" },
  { value: "generic", label: "Generic (fire emoji, etc.)", icon: Zap, color: "text-yellow-400", description: "Quick reactions — emojis, one-word comments" },
];

const QUICK_COMMENTS = [
  { comment: "This is so fake 😂", type: "hater" },
  { comment: "Bro you're an inspiration 🔥💪", type: "supporter" },
  { comment: "How do I start working out if I've never done it?", type: "question" },
  { comment: "🔥🔥🔥", type: "generic" },
  { comment: "Let's collab bro 💯", type: "creator" },
  { comment: "You're not even that big lol", type: "hater" },
  { comment: "How long did the transformation take?", type: "question" },
  { comment: "Needed this today 🙏", type: "supporter" },
];

export default function CommentCoach() {
  const [comment, setComment] = useState("");
  const [commentType, setCommentType] = useState("supporter");
  const [postContext, setPostContext] = useState("");
  const [response, setResponse] = useState<CommentResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [history, setHistory] = useState<Array<{ comment: string; response: CommentResponse }>>([]);

  const handleGenerate = async () => {
    if (!comment.trim()) {
      toast.error("Paste the comment first!");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("social-engagement-coach", {
        body: {
          mode: "comment_reply",
          comment: comment.trim(),
          context: postContext || undefined,
          comment_type: commentType,
        },
      });
      if (error) throw error;

      const result = data.result as CommentResponse;
      setResponse(result);
      setHistory((prev) => [{ comment: comment.trim(), response: result }, ...prev].slice(0, 20));
    } catch (err) {
      toast.error("Failed to generate response");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
    toast.success("Copied — go paste it!");
  };

  const useQuickComment = (c: { comment: string; type: string }) => {
    setComment(c.comment);
    setCommentType(c.type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-green-400" />
        <div>
          <h3 className="text-lg font-bold">Comment Coach</h3>
          <p className="text-xs text-muted-foreground">
            Paste any comment. Get the perfect reply in your voice. Every comment is a growth opportunity.
          </p>
        </div>
      </div>

      {/* How This Works */}
      <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
        <p className="text-xs font-bold text-green-400 mb-1">How This Works (Simple Version):</p>
        <ol className="text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
          <li><span className="font-medium text-foreground">Paste a comment</span> someone left on your post</li>
          <li><span className="font-medium text-foreground">Pick the type</span> — is it a fan, hater, question, or another creator?</li>
          <li><span className="font-medium text-foreground">Hit Generate</span> and I'll write the perfect reply in YOUR voice</li>
          <li><span className="font-medium text-foreground">Copy and paste</span> it right into Instagram. Done.</li>
        </ol>
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          Why this matters: Every reply you leave boosts engagement. The algorithm LOVES when you reply to comments quickly.
          Plus, a fire reply can go viral on its own. This is how you turn commenters into followers.
        </p>
      </div>

      {/* Input Form */}
      <div className="rounded-lg bg-charcoal border-2 border-green-500/30 p-4 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">The Comment</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={"Paste the comment here... e.g., \"Bro you're not even that big, stop the cap\""}
            className="bg-background min-h-[80px] text-sm resize-none"
            rows={3}
          />
        </div>

        {/* Quick Comment Examples */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase text-muted-foreground font-medium">Or try an example:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_COMMENTS.map((qc, i) => (
              <button
                key={i}
                onClick={() => useQuickComment(qc)}
                className="text-[10px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-green-500/50 transition-colors"
              >
                {qc.comment.length > 35 ? qc.comment.slice(0, 35) + "..." : qc.comment}
              </button>
            ))}
          </div>
        </div>

        {/* Comment Type */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">What kind of comment is it?</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {COMMENT_TYPES.map((ct) => {
              const Icon = ct.icon;
              return (
                <button
                  key={ct.value}
                  onClick={() => setCommentType(ct.value)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border text-left transition-colors",
                    commentType === ct.value
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-border hover:border-green-500/30"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", ct.color)} />
                  <div>
                    <p className="text-xs font-medium">{ct.label}</p>
                    <p className="text-[10px] text-muted-foreground">{ct.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Post Context (optional) */}
        <div className="space-y-1.5">
          <Label className="text-xs">What was the post about? (optional — helps me write a better reply)</Label>
          <Input
            value={postContext}
            onChange={(e) => setPostContext(e.target.value)}
            placeholder="e.g., Morning workout reel, hot take about lazy people, faith post"
            className="bg-background"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !comment.trim()}
          className="w-full bg-green-500 hover:bg-green-600 text-white gap-2 h-11 text-sm font-bold"
        >
          {isGenerating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Crafting Reply...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Generate Reply</>
          )}
        </Button>
      </div>

      {/* Response */}
      {response && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            Your Reply
          </h4>

          {/* Main Reply */}
          <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-green-400">Best Reply:</p>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] gap-1"
                onClick={() => copyText(response.reply, "reply")}
              >
                {copiedField === "reply" ? <Check className="h-2.5 w-2.5 text-green-400" /> : <Copy className="h-2.5 w-2.5" />}
                Copy
              </Button>
            </div>
            <p className="text-sm font-medium bg-charcoal rounded p-2">{response.reply}</p>
          </div>

          {/* Alternative */}
          {response.alternative && (
            <div className="rounded-lg bg-background/50 border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground">Alternative Reply:</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] gap-1"
                  onClick={() => copyText(response.alternative, "alt")}
                >
                  {copiedField === "alt" ? <Check className="h-2.5 w-2.5 text-green-400" /> : <Copy className="h-2.5 w-2.5" />}
                  Copy
                </Button>
              </div>
              <p className="text-sm bg-charcoal rounded p-2">{response.alternative}</p>
            </div>
          )}

          {/* Strategy */}
          {response.strategy && (
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
              <p className="text-xs font-bold text-blue-400 mb-1">Why this reply works:</p>
              <p className="text-xs">{response.strategy}</p>
            </div>
          )}

          {/* Engagement Tip */}
          {response.engagement_tip && (
            <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-3">
              <p className="text-xs font-bold text-yellow-400 mb-1">Pro Tip:</p>
              <p className="text-xs">{response.engagement_tip}</p>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Recent Replies ({history.length})</h4>
          {history.slice(1).map((item, i) => (
            <div key={i} className="rounded bg-charcoal border border-border p-2">
              <p className="text-[10px] text-muted-foreground truncate">Comment: "{item.comment}"</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs truncate flex-1">{item.response.reply}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 text-[10px] gap-1 shrink-0 ml-2"
                  onClick={() => copyText(item.response.reply, `history-${i}`)}
                >
                  {copiedField === `history-${i}` ? <Check className="h-2 w-2 text-green-400" /> : <Copy className="h-2 w-2" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
