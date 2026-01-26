import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Video, Upload, Film, Clapperboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WelcomeVideo {
  id: string;
  plan_type: string;
  video_url: string | null;
  video_title: string;
  video_description: string | null;
  walkthrough_video_url: string | null;
}

const TIER_LABELS: Record<string, { name: string; description: string; color: string }> = {
  membership: { 
    name: "Solitary Confinement", 
    description: "Monthly membership tier",
    color: "text-yellow-500"
  },
  transformation: { 
    name: "General Population", 
    description: "12-Week transformation tier",
    color: "text-primary"
  },
  coaching: { 
    name: "Free World", 
    description: "1:1 Coaching tier",
    color: "text-crimson"
  },
};

export default function WelcomeVideosManager() {
  const [videos, setVideos] = useState<WelcomeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<{ id: string; type: 'welcome' | 'walkthrough' } | null>(null);
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
      toast({ title: "Error", description: "Failed to load videos", variant: "destructive" });
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
        walkthrough_video_url: video.walkthrough_video_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", video.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update video", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Video settings updated" });
    }
    setSaving(null);
  };

  const handleFileUpload = async (
    videoId: string, 
    planType: string, 
    file: File, 
    type: 'welcome' | 'walkthrough'
  ) => {
    setUploading({ id: videoId, type });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${planType}-${Date.now()}.${fileExt}`;
      const bucket = type === 'walkthrough' ? 'tier-walkthroughs' : 'program-videos';
      const folder = type === 'walkthrough' ? planType : 'welcome-videos';
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Update the video record
      const updateField = type === 'walkthrough' ? 'walkthrough_video_url' : 'video_url';
      const { error: updateError } = await supabase
        .from("program_welcome_videos")
        .update({ [updateField]: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", videoId);

      if (updateError) throw updateError;

      // Update local state
      setVideos(videos.map(v => 
        v.id === videoId ? { ...v, [updateField]: publicUrl } : v
      ));

      toast({ title: "Success", description: `${type === 'walkthrough' ? 'Walkthrough' : 'Welcome'} video uploaded` });
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
          <h2 className="text-xl font-semibold">Tier Videos</h2>
          <p className="text-sm text-muted-foreground">
            Manage welcome videos and walkthrough screen recordings for each tier
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {videos.map((video) => {
          const tierInfo = TIER_LABELS[video.plan_type] || { name: video.plan_type, description: "", color: "text-primary" };
          
          return (
            <Card key={video.id} className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <span className={`text-lg ${tierInfo.color}`}>{tierInfo.name}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    ({video.plan_type})
                  </span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{tierInfo.description}</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="walkthrough" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="walkthrough" className="gap-2">
                      <Clapperboard className="w-4 h-4" />
                      Walkthrough Video
                    </TabsTrigger>
                    <TabsTrigger value="welcome" className="gap-2">
                      <Film className="w-4 h-4" />
                      Welcome Video
                    </TabsTrigger>
                  </TabsList>

                  {/* Walkthrough Video Tab */}
                  <TabsContent value="walkthrough" className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h4 className="font-medium text-sm mb-1">Screen Recording Walkthrough</h4>
                      <p className="text-xs text-muted-foreground">
                        Upload a 3-5 minute screen recording showing new members how to navigate their tier.
                        This plays on the Start Here page.
                      </p>
                    </div>

                    {/* Video Preview */}
                    {video.walkthrough_video_url && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-charcoal border border-border">
                        <video 
                          src={video.walkthrough_video_url} 
                          controls 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    {/* Upload Button */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Upload Walkthrough</Label>
                      <div className="flex gap-3 items-center">
                        <Input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(video.id, video.plan_type, file, 'walkthrough');
                          }}
                          className="flex-1"
                          disabled={uploading?.id === video.id && uploading?.type === 'walkthrough'}
                        />
                        {uploading?.id === video.id && uploading?.type === 'walkthrough' && (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        MP4, WebM, or MOV • Max 500MB
                      </p>
                    </div>

                    {/* Direct URL */}
                    <div>
                      <Label htmlFor={`walkthrough-url-${video.id}`}>Or paste video URL</Label>
                      <Input
                        id={`walkthrough-url-${video.id}`}
                        value={video.walkthrough_video_url || ""}
                        onChange={(e) => updateVideoField(video.id, "walkthrough_video_url", e.target.value)}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>
                  </TabsContent>

                  {/* Welcome Video Tab */}
                  <TabsContent value="welcome" className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <h4 className="font-medium text-sm mb-1">Personal Welcome from Dom</h4>
                      <p className="text-xs text-muted-foreground">
                        A short personal welcome video that plays during the setup wizard.
                      </p>
                    </div>

                    {/* Video Preview */}
                    {video.video_url && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-charcoal border border-border">
                        <video 
                          src={video.video_url} 
                          controls 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    {/* Upload Button */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Upload Welcome Video</Label>
                      <div className="flex gap-3 items-center">
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(video.id, video.plan_type, file, 'welcome');
                          }}
                          className="flex-1"
                          disabled={uploading?.id === video.id && uploading?.type === 'welcome'}
                        />
                        {uploading?.id === video.id && uploading?.type === 'welcome' && (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        )}
                      </div>
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
                  </TabsContent>
                </Tabs>

                {/* Save Button */}
                <Button
                  onClick={() => handleUpdate(video)}
                  disabled={saving === video.id}
                  className="w-full gap-2 mt-4"
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
