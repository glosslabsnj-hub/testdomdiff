import { useState, useRef } from "react";
import { format } from "date-fns";
import {
  Upload,
  FileText,
  Image,
  Video,
  Trash2,
  ExternalLink,
  Loader2,
  GripVertical,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useClientCustomPrograms, ClientCustomProgram } from "@/hooks/useClientCustomPrograms";

interface ClientProgramTabProps {
  clientId: string;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return Image;
  if (fileType.startsWith("video/")) return Video;
  return FileText;
};

const getFileTypeLabel = (fileType: string) => {
  if (fileType === "application/pdf") return "PDF";
  if (fileType.startsWith("image/")) return "Image";
  if (fileType.startsWith("video/")) return "Video";
  return "File";
};

export default function ClientProgramTab({ clientId }: ClientProgramTabProps) {
  const { programs, loading, uploadProgram, updateProgram, deleteProgram, getSignedUrl } =
    useClientCustomPrograms(clientId);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadTitle) {
        // Auto-fill title from filename (without extension)
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) return;

    setIsUploading(true);
    const result = await uploadProgram(selectedFile, uploadTitle.trim(), uploadDescription.trim());
    setIsUploading(false);

    if (result) {
      setIsUploadDialogOpen(false);
      setUploadTitle("");
      setUploadDescription("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleView = async (program: ClientCustomProgram) => {
    const url = await getSignedUrl(program.file_url);
    if (url) {
      window.open(url, "_blank");
    }
  };

  const startEditing = (program: ClientCustomProgram) => {
    setEditingId(program.id);
    setEditTitle(program.title);
    setEditDescription(program.description || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const saveEditing = async () => {
    if (!editingId || !editTitle.trim()) return;

    await updateProgram(editingId, {
      title: editTitle.trim(),
      description: editDescription.trim() || null,
    });
    cancelEditing();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Custom Program Files</h3>
          <p className="text-sm text-muted-foreground">
            Upload personalized workout plans, nutrition guides, and other program materials
          </p>
        </div>
        <Button variant="gold" onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </div>

      {/* Program List */}
      {programs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No custom program files uploaded yet.
              <br />
              Upload workout plans, nutrition guides, or other materials for this client.
            </p>
            <Button variant="goldOutline" onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload First File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {programs.map((program) => {
            const FileIcon = getFileIcon(program.file_type);
            const isEditing = editingId === program.id;

            return (
              <Card key={program.id} className="bg-charcoal-light">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title"
                            className="font-semibold"
                          />
                          <Textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Description (optional)"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" variant="gold" onClick={saveEditing}>
                              <Check className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEditing}>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-semibold text-foreground truncate">
                            {program.title}
                          </h4>
                          {program.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {program.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="uppercase font-medium">
                              {getFileTypeLabel(program.file_type)}
                            </span>
                            <span>•</span>
                            <span>
                              Uploaded {format(new Date(program.created_at), "MMM d, yyyy")}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(program)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(program)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-crimson" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Program File</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{program.title}"? This will remove
                                the file from the client's dashboard and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteProgram(program.id)}
                                className="bg-crimson hover:bg-crimson-dark"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Program File</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov"
              />
              <p className="text-xs text-muted-foreground">
                Supported: PDF, Images (JPG, PNG), Video (MP4). Max 50MB.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g., Week 1-4 Foundation Phase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Brief notes about this program file..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={handleUpload}
              disabled={!selectedFile || !uploadTitle.trim() || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
