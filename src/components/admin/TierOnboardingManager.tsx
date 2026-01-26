import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, RefreshCw, FileText, Volume2, AlertCircle, Check, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTierOnboardingVideos } from "@/hooks/useOnboardingVideo";
import { cn } from "@/lib/utils";

// Voice IDs for reference - all tiers use the same professional mentor voice
const VOICE_IDS = {
  mentor: "rAjfUfM1BSLyNwE8ckhm", // P.O. / Professional Mentor voice for all tiers
};

const TIERS = [
  {
    key: "membership",
    name: "Solitary Confinement",
    description: "Self-serve bodyweight training",
    color: "text-muted-foreground",
    bgColor: "bg-muted/20",
    expectedVoice: VOICE_IDS.mentor,
    voiceLabel: "Mentor Voice",
  },
  {
    key: "transformation",
    name: "General Population",
    description: "12-week structured program",
    color: "text-primary",
    bgColor: "bg-primary/20",
    expectedVoice: VOICE_IDS.mentor,
    voiceLabel: "Mentor Voice",
  },
  {
    key: "coaching",
    name: "Free World",
    description: "Premium 1:1 coaching",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    expectedVoice: VOICE_IDS.mentor,
    voiceLabel: "Mentor Voice",
  },
];

export default function TierOnboardingManager() {
  const { videos, isLoading, configVersion, incrementVersion, generateVideo } = useTierOnboardingVideos();
  const [scriptDialogOpen, setScriptDialogOpen] = useState<string | null>(null);

  const getVideoForTier = (tierKey: string) => {
    return videos?.find(v => v.tier_key === tierKey && v.tier_config_version === configVersion);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-success/20 text-success border-success/30">Ready</Badge>;
      case "failed":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Failed</Badge>;
      case "queued":
        return <Badge className="bg-muted text-muted-foreground">Queued</Badge>;
      case "generating_script":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Writing Script</Badge>;
      case "generating_audio":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Recording Audio</Badge>;
      case "generating_captions":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Adding Captions</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Version Control */}
      <Card className="bg-charcoal border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Tier Config Version
          </CardTitle>
          <CardDescription>
            Increment the version to invalidate all existing onboarding videos and trigger regeneration.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="text-4xl font-bold text-primary">v{configVersion}</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => incrementVersion.mutate()}
              disabled={incrementVersion.isPending}
              className="gap-2"
            >
            {incrementVersion.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
              Increment Version
            </Button>
            <Button
              variant="gold"
              onClick={async () => {
                for (const tier of TIERS) {
                  await generateVideo.mutateAsync({ tierKey: tier.key, forceRegenerate: true });
                }
              }}
              disabled={generateVideo.isPending}
              className="gap-2"
            >
              {generateVideo.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Regenerate All Tiers
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Use "Increment Version" when tier features change. Use "Regenerate All" to fix voice/visual issues.
          </p>
        </CardContent>
      </Card>

      {/* Tier Videos */}
      <div className="grid gap-4">
        {TIERS.map((tier) => {
          const video = getVideoForTier(tier.key);
          const isGenerating = video && ["queued", "generating_script", "generating_audio", "generating_captions"].includes(video.status);

          return (
            <Card key={tier.key} className="bg-charcoal border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", tier.bgColor)}>
                      <Play className={cn("w-6 h-6", tier.color)} />
                    </div>
                    <div>
                      <h3 className={cn("font-semibold", tier.color)}>{tier.name}</h3>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Expected: {tier.voiceLabel}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {video ? (
                          <>
                            {getStatusBadge(video.status)}
                            {video.duration_seconds && (
                              <span className="text-xs text-muted-foreground">
                                {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, "0")}
                              </span>
                            )}
                            {video.voice_id && (
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  video.voice_id === tier.expectedVoice 
                                    ? "border-green-500/30 text-green-400" 
                                    : "border-destructive/30 text-destructive"
                                )}
                              >
                                {video.voice_id === tier.expectedVoice ? "✓ Correct Voice" : "⚠ Wrong Voice"}
                              </Badge>
                            )}
                            {video.screen_slides && Array.isArray(video.screen_slides) && video.screen_slides.length > 0 && (
                              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                {video.screen_slides.length} slides
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Badge variant="outline">Not Generated</Badge>
                        )}
                      </div>

                      {video?.error && (
                        <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {video.error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Generate/Regenerate button */}
                    <Button
                      variant={video?.status === "ready" ? "outline" : "gold"}
                      size="sm"
                      onClick={() => generateVideo.mutate({ tierKey: tier.key, forceRegenerate: true })}
                      disabled={generateVideo.isPending || isGenerating}
                      className="gap-2"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      {video?.status === "ready" ? "Regenerate" : "Generate"}
                    </Button>

                    {/* View Script button */}
                    {video?.script_text && (
                      <Dialog open={scriptDialogOpen === tier.key} onOpenChange={(open) => setScriptDialogOpen(open ? tier.key : null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <FileText className="w-4 h-4" />
                            View Script
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{tier.name} Script</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="h-96">
                            <div className="whitespace-pre-wrap text-sm p-4 bg-muted rounded-lg">
                              {video.script_text}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Play Audio button */}
                    {video?.audio_url && video.status === "ready" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="gap-2"
                      >
                        <a href={video.audio_url} target="_blank" rel="noopener noreferrer">
                          <Volume2 className="w-4 h-4" />
                          Play Audio
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info box */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <h4 className="font-medium text-foreground text-sm mb-1 flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            How It Works
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1 ml-6">
            <li>• Videos are generated per tier, not per user (saves costs)</li>
            <li>• When a user visits Start Here, they see their tier's walkthrough</li>
            <li>• Incrementing the version invalidates all videos (useful when features change)</li>
            <li>• Generation takes ~2 minutes per tier (AI script + ElevenLabs audio)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
