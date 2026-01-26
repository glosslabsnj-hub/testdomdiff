import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Video, Upload, Film, Clapperboard, Music } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface WelcomeVideo {
  id: string;
  plan_type: string;
  video_url: string | null;
  video_title: string;
  video_description: string | null;
  walkthrough_video_url: string | null;
  walkthrough_audio_url: string | null;
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
  const [uploadProgress, setUploadProgress] = useState(0);
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
        walkthrough_audio_url: video.walkthrough_audio_url,
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

  const handleAudioUpload = async (
    videoId: string, 
    planType: string, 
    file: File
  ) => {
    if (!file) return;

    // Validate file size (50MB max)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast({
        title: "File too large",
        description: `Maximum file size is 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB`,
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/x-m4a', 'audio/aac'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|aac)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload MP3, WAV, M4A, or AAC files only.",
        variant: "destructive"
      });
      return;
    }

    console.log(`🔊 Starting audio upload:`, {
      videoId,
      planType,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: file.type
    });

    setUploading({ id: videoId, type: 'walkthrough' });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `audio-${planType}-${Date.now()}.${fileExt}`;
      const filePath = `${planType}/${fileName}`;

      console.log(`📤 Uploading audio to bucket: tier-walkthroughs, path: ${filePath}`);

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('tier-walkthroughs')
        .upload(filePath, file);

      if (uploadError) {
        console.error("❌ Storage upload error:", uploadError);
        throw uploadError;
      }

      console.log("✅ Audio upload successful:", uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('tier-walkthroughs')
        .getPublicUrl(filePath);

      console.log("🔗 Public URL:", publicUrl);

      const { error: updateError } = await supabase
        .from("program_welcome_videos")
        .update({ walkthrough_audio_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", videoId);

      if (updateError) {
        console.error("❌ Database update error:", updateError);
        throw updateError;
      }

      console.log("✅ Database updated successfully");

      setVideos(videos.map(v => 
        v.id === videoId ? { ...v, walkthrough_audio_url: publicUrl } : v
      ));

      toast({ title: "Success", description: "Narration audio uploaded" });
    } catch (error: any) {
      console.error("❌ Audio upload error:", error);
      toast({ 
        title: "Upload Failed", 
        description: error.message || "Unknown error occurred.", 
        variant: "destructive" 
      });
    } finally {
      setUploading(null);
    }
  };

  const handleFileUpload = async (
    videoId: string, 
    planType: string, 
    file: File, 
    type: 'welcome' | 'walkthrough'
  ) => {
    // Validate file exists
    if (!file) {
      console.warn("No file selected");
      return;
    }

    // Validate file size (500MB max as stated in UI)
    const MAX_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast({
        title: "File too large",
        description: `Maximum file size is 500MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB`,
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload MP4, WebM, or MOV files only. Got: ${file.type || 'unknown'}`,
        variant: "destructive"
      });
      return;
    }

    console.log(`📹 Starting ${type} video upload:`, {
      videoId,
      planType,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: file.type
    });

    setUploading({ id: videoId, type });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${planType}-${Date.now()}.${fileExt}`;
      const bucket = type === 'walkthrough' ? 'tier-walkthroughs' : 'program-videos';
      const folder = type === 'walkthrough' ? planType : 'welcome-videos';
      const filePath = `${folder}/${fileName}`;

      console.log(`📤 Uploading to bucket: ${bucket}, path: ${filePath}`);

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        console.error("❌ Storage upload error:", uploadError);
        throw uploadError;
      }

      console.log("✅ Upload successful:", uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log("🔗 Public URL:", publicUrl);

      // Update the video record
      const updateField = type === 'walkthrough' ? 'walkthrough_video_url' : 'video_url';
      console.log(`📝 Updating database field: ${updateField}`);
      
      const { error: updateError } = await supabase
        .from("program_welcome_videos")
        .update({ [updateField]: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", videoId);

      if (updateError) {
        console.error("❌ Database update error:", updateError);
        throw updateError;
      }

      console.log("✅ Database updated successfully");

      // Update local state
      setVideos(videos.map(v => 
        v.id === videoId ? { ...v, [updateField]: publicUrl } : v
      ));

      toast({ title: "Success", description: `${type === 'walkthrough' ? 'Walkthrough' : 'Welcome'} video uploaded` });
    } catch (error: any) {
      console.error("❌ Upload error details:", error);
      toast({ 
        title: "Upload Failed", 
        description: error.message || "Unknown error occurred. Check console for details.", 
        variant: "destructive" 
      });
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

                    <Separator className="my-4" />

                    {/* Narration Audio Section */}
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Music className="w-4 h-4 text-accent" />
                        <h4 className="font-medium text-sm">Narration Audio</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Upload custom audio narration. Overrides AI-generated audio when set.
                      </p>
                    </div>

                    {/* Audio Preview */}
                    {video.walkthrough_audio_url && (
                      <div className="p-3 rounded-lg bg-charcoal border border-border">
                        <Label className="text-xs text-muted-foreground mb-2 block">Current Audio</Label>
                        <audio 
                          src={video.walkthrough_audio_url} 
                          controls 
                          className="w-full h-10"
                        />
                      </div>
                    )}

                    {/* Upload Audio Button */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Upload Audio File</Label>
                      <div className="flex gap-3 items-center">
                        <Input
                          type="file"
                          accept=".mp3,.wav,.m4a,.aac,audio/mpeg,audio/wav,audio/m4a,audio/aac"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAudioUpload(video.id, video.plan_type, file);
                          }}
                          className="flex-1"
                          disabled={uploading?.id === video.id}
                        />
                        {uploading?.id === video.id && (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        MP3, WAV, M4A, or AAC • Max 50MB
                      </p>
                    </div>

                    {/* Direct Audio URL */}
                    <div>
                      <Label htmlFor={`audio-url-${video.id}`}>Or paste audio URL</Label>
                      <Input
                        id={`audio-url-${video.id}`}
                        value={video.walkthrough_audio_url || ""}
                        onChange={(e) => updateVideoField(video.id, "walkthrough_audio_url", e.target.value)}
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
