import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Video, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WelcomeVideo {
  id: string;
  plan_type: string;
  video_url: string | null;
  video_title: string;
  video_description: string | null;
}

const TIER_LABELS: Record<string, { name: string; description: string }> = {
  membership: { 
    name: "Solitary Confinement", 
    description: "Monthly membership tier welcome video" 
  },
  transformation: { 
    name: "General Population", 
    description: "12-Week transformation tier welcome video" 
  },
  coaching: { 
    name: "Free World", 
    description: "1:1 Coaching tier welcome video" 
  },
};

export default function WelcomeVideosManager() {
  const [videos, setVideos] = useState<WelcomeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("program_welcome_videos")
      .select("*")
      .order("plan_type");

    if (error) {
      console.error("Error fetching welcome videos:", error);
      toast({ title: "Error", description: "Failed to load welcome videos", variant: "destructive" });
    } else {
      setVideos(data || []);
    }
    setLoading(false);
  };

  const handleUpdate = async (video: WelcomeVideo) => {
    setSaving(video.id);
    
    const { error } = await supabase
      .from("program_welcome_videos")
      .update({
        video_url: video.video_url,
        video_title: video.video_title,
        video_description: video.video_description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", video.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update video", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Welcome video updated" });
    }
    setSaving(null);
  };

  const handleFileUpload = async (videoId: string, planType: string, file: File) => {
    setUploading(videoId);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `welcome-${planType}-${Date.now()}.${fileExt}`;
      const filePath = `welcome-videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("program-videos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("program-videos")
        .getPublicUrl(filePath);

      // Update the video record
      const { error: updateError } = await supabase
        .from("program_welcome_videos")
        .update({ video_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", videoId);

      if (updateError) throw updateError;

      // Update local state
      setVideos(videos.map(v => 
        v.id === videoId ? { ...v, video_url: publicUrl } : v
      ));

      toast({ title: "Success", description: "Video uploaded successfully" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: "Error", description: error.message || "Failed to upload video", variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const updateVideoField = (id: string, field: keyof WelcomeVideo, value: string) => {
    setVideos(videos.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Video className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Welcome Videos</h2>
          <p className="text-sm text-muted-foreground">
            Upload tier-specific welcome videos from Dom for new members
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {videos.map((video) => {
          const tierInfo = TIER_LABELS[video.plan_type] || { name: video.plan_type, description: "" };
          
          return (
            <Card key={video.id} className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <span className="text-lg">{tierInfo.name}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    ({video.plan_type})
                  </span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{tierInfo.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Preview */}
                {video.video_url && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-charcoal">
                    <video 
                      src={video.video_url} 
                      controls 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Upload Button */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Video File</Label>
                  <div className="flex gap-3">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(video.id, video.plan_type, file);
                      }}
                      className="flex-1"
                      disabled={uploading === video.id}
                    />
                    {uploading === video.id && (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Or paste a direct video URL below
                  </p>
                </div>

                {/* Video URL */}
                <div>
                  <Label htmlFor={`url-${video.id}`}>Video URL</Label>
                  <Input
                    id={`url-${video.id}`}
                    value={video.video_url || ""}
                    onChange={(e) => updateVideoField(video.id, "video_url", e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor={`title-${video.id}`}>Title</Label>
                  <Input
                    id={`title-${video.id}`}
                    value={video.video_title}
                    onChange={(e) => updateVideoField(video.id, "video_title", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor={`desc-${video.id}`}>Description</Label>
                  <Textarea
                    id={`desc-${video.id}`}
                    value={video.video_description || ""}
                    onChange={(e) => updateVideoField(video.id, "video_description", e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                {/* Save Button */}
                <Button
                  onClick={() => handleUpdate(video)}
                  disabled={saving === video.id}
                  className="w-full gap-2"
                >
                  {saving === video.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}