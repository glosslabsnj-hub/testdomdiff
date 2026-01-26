import { useState, useRef } from "react";
import { Camera, Upload, X, Lock, Users, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PhotoUploadCardProps {
  photoType: "before" | "during" | "after";
  existingPhotoUrl?: string;
  onUpload: (file: File, options: { caption?: string; privacyLevel?: "private" | "coach_only" | "public" }) => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
  disabled?: boolean;
}

const typeLabels = {
  before: { title: "Before", subtitle: "Day 1 Mugshot", color: "text-red-400" },
  during: { title: "During", subtitle: "Mid-Sentence", color: "text-amber-400" },
  after: { title: "After", subtitle: "Release Day", color: "text-green-400" },
};

const privacyOptions = [
  { value: "private", label: "Private", icon: Lock, description: "Only you can see" },
  { value: "coach_only", label: "Coach Only", icon: Eye, description: "You and Dom can see" },
  { value: "public", label: "Community", icon: Users, description: "Visible to other members" },
];

export default function PhotoUploadCard({
  photoType,
  existingPhotoUrl,
  onUpload,
  onDelete,
  disabled,
}: PhotoUploadCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [privacy, setPrivacy] = useState<"private" | "coach_only" | "public">("private");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const label = typeLabels[photoType];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setDialogOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const success = await onUpload(selectedFile, { caption, privacyLevel: privacy });

    if (success) {
      setDialogOpen(false);
      resetState();
    }
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  const resetState = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption("");
    setPrivacy("private");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    resetState();
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border">
          <h3 className={cn("font-display text-sm", label.color)}>{label.title}</h3>
          <p className="text-xs text-muted-foreground">{label.subtitle}</p>
        </div>

        {existingPhotoUrl ? (
          <div className="relative aspect-[3/4]">
            <img
              src={existingPhotoUrl}
              alt={`${photoType} photo`}
              className="w-full h-full object-cover"
            />
            {onDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              </Button>
            )}
          </div>
        ) : (
          <label className="block aspect-[3/4] bg-charcoal cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
              disabled={disabled}
            />
            <div className="h-full flex flex-col items-center justify-center gap-2 p-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Tap to take or upload your {photoType} photo
              </p>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
          </label>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Upload {label.title} Photo</DialogTitle>
          </DialogHeader>

          {preview && (
            <div className="aspect-[3/4] max-h-[300px] overflow-hidden rounded-lg">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption"
                placeholder="Add a note about this photo..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="bg-charcoal border-border"
              />
            </div>

            <div>
              <Label>Privacy Level</Label>
              <Select value={privacy} onValueChange={(v: "private" | "coach_only" | "public") => setPrivacy(v)}>
                <SelectTrigger className="bg-charcoal border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {privacyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="h-4 w-4" />
                        <div>
                          <span className="font-medium">{opt.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">{opt.description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                "Save Photo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
