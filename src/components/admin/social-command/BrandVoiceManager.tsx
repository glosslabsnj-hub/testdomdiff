import { useState } from "react";
import {
  Mic,
  RefreshCw,
  Save,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSocialCommand } from "@/hooks/useSocialCommand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function BrandVoiceManager() {
  const { config, upsertConfig } = useSocialCommand();
  const [editedPrompt, setEditedPrompt] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contentSamples, setContentSamples] = useState("");

  const currentPrompt = editedPrompt ?? config?.generated_master_prompt ?? null;
  const hasUnsavedChanges = editedPrompt !== null && editedPrompt !== (config?.generated_master_prompt ?? "");

  async function handleRegenerate() {
    setIsRegenerating(true);
    try {
      const response = await supabase.functions.invoke("social-generate-master-prompt", {
        body: {
          personality_data: config?.personality_answers,
          content_samples: contentSamples
            ? contentSamples.split("\n---\n").filter(Boolean)
            : config?.existing_content_samples,
        },
      });

      if (response.error) throw response.error;

      const { generated_prompt, version } = response.data;
      setEditedPrompt(generated_prompt);
      toast.success(`Master prompt regenerated (v${version})`);
    } catch (error) {
      console.error("Regenerate error:", error);
      toast.error("Failed to regenerate master prompt");
    } finally {
      setIsRegenerating(false);
    }
  }

  async function handleSave() {
    if (!editedPrompt) return;
    setIsSaving(true);
    try {
      await upsertConfig.mutateAsync({
        generated_master_prompt: editedPrompt,
        master_prompt_generated_at: new Date().toISOString(),
        master_prompt_version: (config?.master_prompt_version || 0) + 1,
      });
      setEditedPrompt(null);
      toast.success("Master prompt saved");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save master prompt");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCopy() {
    if (!currentPrompt) return;
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-orange-400" />
          <div>
            <h3 className="text-lg font-bold">Brand Voice Manager</h3>
            <p className="text-xs text-muted-foreground">
              View, edit, and regenerate the master brand voice prompt.
            </p>
          </div>
        </div>
        {config?.master_prompt_version ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            v{config.master_prompt_version}
            {config.master_prompt_generated_at && (
              <span>
                {" \u00b7 "}
                {new Date(config.master_prompt_generated_at).toLocaleDateString()}
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* Status */}
      {!currentPrompt && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">No custom prompt stored</p>
            <p className="text-xs text-muted-foreground mt-1">
              The system is using the hardcoded default prompt. Click "Regenerate" to create a
              personalized master prompt from your personality data, or paste one manually below.
            </p>
          </div>
        </div>
      )}

      {/* Current Prompt Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Master System Prompt</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!currentPrompt}
              className="h-7 text-xs gap-1"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
        <textarea
          className="w-full min-h-[200px] sm:min-h-[400px] rounded-lg bg-charcoal border border-border p-4 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-1 focus:ring-orange-500/50"
          value={currentPrompt || ""}
          onChange={(e) => setEditedPrompt(e.target.value)}
          placeholder="No master prompt set. Click 'Regenerate' to generate one from personality data, or paste your own here..."
        />
        {hasUnsavedChanges && (
          <p className="text-xs text-amber-400">Unsaved changes</p>
        )}
      </div>

      {/* Content Samples */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Content Samples (for voice analysis)</Label>
        <p className="text-xs text-muted-foreground">
          Paste real content Dom has posted. Separate samples with --- on a new line. Used during regeneration to match his voice.
        </p>
        <textarea
          className="w-full min-h-[120px] rounded-lg bg-charcoal border border-border p-4 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-1 focus:ring-orange-500/50"
          value={contentSamples}
          onChange={(e) => setContentSamples(e.target.value)}
          placeholder={`Paste content samples here...\n---\nSeparate multiple samples with three dashes\n---\nEach sample helps the AI match Dom's real voice`}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
        >
          {isRegenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isRegenerating ? "Regenerating..." : "Regenerate with AI"}
        </Button>

        {hasUnsavedChanges && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
}
