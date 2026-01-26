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
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Moon,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useClientCustomPrograms, ClientCustomProgram } from "@/hooks/useClientCustomPrograms";
import { useClientProgram } from "@/hooks/useClientProgram";
import TemplateAssignment from "./TemplateAssignment";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";

interface ImprovedProgramTabProps {
  clientId: string;
  client: ClientWithSubscription;
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

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ImprovedProgramTab({ clientId, client }: ImprovedProgramTabProps) {
  const { programs, loading: filesLoading, uploadProgram, updateProgram, deleteProgram, getSignedUrl } =
    useClientCustomPrograms(clientId);
  const { weeks, loading: programLoading } = useClientProgram(clientId);

  const [activeWeek, setActiveWeek] = useState("1");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showFiles, setShowFiles] = useState(false);
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

  const loading = filesLoading || programLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Get current week's days sorted by day order
  const currentWeek = weeks.find((w) => w.week_number.toString() === activeWeek);
  const sortedDays = currentWeek?.days
    ? [...currentWeek.days].sort(
        (a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)
      )
    : [];

  const clientName = `${client.first_name || "Client"}'s`;

  return (
    <div className="space-y-6">
      {/* Template Assignment - Always Visible at Top */}
      <Card className="border-purple-500/30 bg-purple-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-purple-400" />
            Assign Training Template
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <TemplateAssignment client={client} onAssigned={() => {}} />
        </CardContent>
      </Card>

      {/* Current Program Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{clientName} Training Program</h3>
          {currentWeek && (
            <Badge variant="secondary" className="text-xs">
              {currentWeek.phase || `Phase ${Math.ceil(parseInt(activeWeek) / 4)}`}
            </Badge>
          )}
        </div>

        {/* Horizontal Week Tabs */}
        {weeks.length > 0 ? (
          <Tabs value={activeWeek} onValueChange={setActiveWeek}>
            <TabsList className="bg-charcoal border border-border h-auto p-1 flex-wrap justify-start">
              {weeks.map((week) => (
                <TabsTrigger
                  key={week.id}
                  value={week.week_number.toString()}
                  className="text-xs px-4 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  Week {week.week_number}
                </TabsTrigger>
              ))}
            </TabsList>

            {weeks.map((week) => (
              <TabsContent key={week.id} value={week.week_number.toString()} className="mt-4">
                {week.focus_description && (
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    Focus: {week.focus_description}
                  </p>
                )}

                {/* Day Cards */}
                <div className="space-y-3">
                  {sortedDays.length > 0 ? (
                    sortedDays.map((day) => {
                      const isExpanded = expandedDay === day.id;
                      const exerciseCount = day.exercises?.length || 0;

                      return (
                        <Card
                          key={day.id}
                          className={`transition-colors ${
                            day.is_rest_day
                              ? "bg-muted/30 border-muted"
                              : "bg-charcoal border-border hover:border-primary/30"
                          }`}
                        >
                          <CardContent className="p-0">
                            <button
                              onClick={() => setExpandedDay(isExpanded ? null : day.id)}
                              className="w-full p-4 text-left flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-muted-foreground w-24">
                                  {day.day_of_week.toUpperCase()}
                                </span>
                                {day.is_rest_day ? (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Moon className="w-4 h-4" />
                                    <span>Rest Day</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium">{day.workout_name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {exerciseCount} exercises
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              {!day.is_rest_day && (
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="text-xs h-7">
                                    <Pencil className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                              )}
                            </button>

                            {/* Expanded Exercises */}
                            {isExpanded && !day.is_rest_day && (
                              <div className="px-4 pb-4 border-t border-border">
                                <div className="pt-3 space-y-2">
                                  {day.exercises && day.exercises.length > 0 ? (
                                    day.exercises.map((exercise, idx) => (
                                      <div
                                        key={exercise.id}
                                        className="flex items-center gap-4 py-2 text-sm"
                                      >
                                        <span className="text-muted-foreground w-6">
                                          {idx + 1}.
                                        </span>
                                        <span className="flex-1 font-medium">
                                          {exercise.exercise_name}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {exercise.sets} × {exercise.reps_or_time}
                                        </span>
                                        {exercise.rest && (
                                          <span className="text-muted-foreground text-xs">
                                            {exercise.rest} rest
                                          </span>
                                        )}
                                        <Badge variant="outline" className="text-xs">
                                          {exercise.section_type}
                                        </Badge>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                      No exercises added yet
                                    </p>
                                  )}
                                  <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Exercise
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No workout days created for this week.
                        <br />
                        <Button variant="ghost" size="sm" className="mt-2">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Workout Day
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Dumbbell className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                No program assigned yet. Use the template assignment above to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Files Section - Collapsible at Bottom */}
      <Collapsible open={showFiles} onOpenChange={setShowFiles}>
        <Card className="border-border">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/10 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Additional Files
                  {programs.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {programs.length}
                    </Badge>
                  )}
                </CardTitle>
                {showFiles ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>

              {programs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No files uploaded yet
                </p>
              ) : (
                <div className="space-y-2">
                  {programs.map((program) => {
                    const FileIcon = getFileIcon(program.file_type);
                    const isEditing = editingId === program.id;

                    return (
                      <div
                        key={program.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-charcoal"
                      >
                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                          <FileIcon className="w-4 h-4 text-primary" />
                        </div>

                        {isEditing ? (
                          <div className="flex-1 flex items-center gap-2">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="h-8 text-sm"
                            />
                            <Button size="sm" variant="ghost" onClick={saveEditing}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEditing}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{program.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {getFileTypeLabel(program.file_type)} •{" "}
                                {format(new Date(program.created_at), "MMM d")}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => startEditing(program)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleView(program)}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete File</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{program.title}"?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteProgram(program.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

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
                Supported: PDF, Images, Video. Max 50MB.
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
                placeholder="Brief notes..."
                rows={2}
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
