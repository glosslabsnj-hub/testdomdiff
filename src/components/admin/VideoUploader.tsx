import { useState, useRef } from "react";
import { Upload, Video, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VideoUploaderProps {
  currentVideoUrl: string | null;
  onUpload: (url: string | null) => void;
  folder?: string;
}

export default function VideoUploader({ currentVideoUrl, onUpload, folder = "weeks" }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload MP4, WebM, or MOV video files.",
        variant: "destructive",
      });
      return;
    }

    // Max 500MB
    if (file.size > 500 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be under 500MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("program-videos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("program-videos")
        .getPublicUrl(data.path);

      onUpload(urlData.publicUrl);
      toast({ title: "Success", description: "Video uploaded successfully" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleRemove = async () => {
    if (!currentVideoUrl) return;

    try {
      // Extract path from URL
      const url = new URL(currentVideoUrl);
      const pathParts = url.pathname.split("/program-videos/");
      if (pathParts[1]) {
        await supabase.storage.from("program-videos").remove([pathParts[1]]);
      }
      onUpload(null);
      toast({ title: "Success", description: "Video removed" });
    } catch (error: any) {
      console.error("Remove error:", error);
      toast({
        title: "Error",
        description: "Failed to remove video",
        variant: "destructive",
      });
    }
  };

  if (currentVideoUrl) {
    return (
      <div className="space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-charcoal border border-border">
          <video
            src={currentVideoUrl}
            controls
            className="w-full h-full object-contain"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Click X to remove and upload a different video
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Uploading video...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Drop video here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">
              MP4, WebM, or MOV • Max 500MB
            </p>
          </div>
          <Button
            variant="goldOutline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Select Video
          </Button>
        </div>
      )}
    </div>
  );
}
