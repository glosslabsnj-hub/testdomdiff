import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Loader2, 
  Camera, 
  Calendar, 
  Grid, 
  ZoomIn,
  Lock,
  Eye,
  Users,
  Download,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProgressPhotos, ProgressPhoto } from "@/hooks/useProgressPhotos";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/DashboardLayout";
import ShareCollageDialog from "@/components/progress/ShareCollageDialog";

type ViewMode = "grid" | "timeline";
type FilterType = "all" | "before" | "during" | "after";

const privacyIcons = {
  private: Lock,
  coach_only: Eye,
  public: Users,
};

const privacyLabels = {
  private: "Private",
  coach_only: "Coach Only",
  public: "Community",
};

const typeColors = {
  before: "bg-red-500/20 text-red-400 border-red-500/30",
  during: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  after: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function PhotoGallery() {
  const { photos, loading, deletePhoto, updatePhoto } = useProgressPhotos();
  const { subscription } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonPhotos, setComparisonPhotos] = useState<[ProgressPhoto | null, ProgressPhoto | null]>([null, null]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const isCoaching = subscription?.plan_type === "coaching";

  // Filter and organize photos
  const filteredPhotos = useMemo(() => {
    let result = [...photos];
    if (filter !== "all") {
      result = result.filter(p => p.photo_type === filter);
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [photos, filter]);

  // Group photos by week for timeline view
  const photosByWeek = useMemo(() => {
    const grouped: Record<string, ProgressPhoto[]> = {};
    photos.forEach(photo => {
      const week = photo.week_number ? `Week ${photo.week_number}` : 
                   photo.photo_type === "before" ? "Day 1" : 
                   photo.photo_type === "after" ? "Final" : "Uncategorized";
      if (!grouped[week]) grouped[week] = [];
      grouped[week].push(photo);
    });
    return grouped;
  }, [photos]);

  const handlePhotoClick = (photo: ProgressPhoto) => {
    if (comparisonMode) {
      if (!comparisonPhotos[0]) {
        setComparisonPhotos([photo, null]);
      } else if (!comparisonPhotos[1]) {
        setComparisonPhotos([comparisonPhotos[0], photo]);
      } else {
        setComparisonPhotos([photo, null]);
      }
    } else {
      setSelectedPhoto(photo);
      setLightboxOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedPhoto) return;
    setDeleting(true);
    await deletePhoto(selectedPhoto.id, selectedPhoto.storage_path);
    setDeleting(false);
    setLightboxOpen(false);
    setSelectedPhoto(null);
  };

  const handleDownload = async () => {
    if (!selectedPhoto?.url) return;
    
    const response = await fetch(selectedPhoto.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `progress-${selectedPhoto.photo_type}-${format(new Date(selectedPhoto.created_at), "yyyy-MM-dd")}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const currentLightboxIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto?.id);

  const navigateLightbox = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" 
      ? (currentLightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length
      : (currentLightboxIndex + 1) % filteredPhotos.length;
    setSelectedPhoto(filteredPhotos[newIndex]);
  };

  // Calculate weeks difference for comparison photos
  const getComparisonWeeksDiff = () => {
    if (!comparisonPhotos[0] || !comparisonPhotos[1]) return 0;
    const diffMs = Math.abs(
      new Date(comparisonPhotos[1].created_at).getTime() - 
      new Date(comparisonPhotos[0].created_at).getTime()
    );
    return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="section-container py-12">
          <Link to="/dashboard/progress" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to {isCoaching ? "Progress Report" : "Time Served"}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="headline-section mb-2">
                Photo <span className="text-primary">Gallery</span>
              </h1>
              <p className="text-muted-foreground">
                Your private transformation timeline. Only you can see these photos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={comparisonMode ? "gold" : "outline"}
                size="sm"
                onClick={() => {
                  setComparisonMode(!comparisonMode);
                  setComparisonPhotos([null, null]);
                }}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {comparisonMode ? "Exit Compare" : "Compare Photos"}
              </Button>
            </div>
          </div>

          {/* Comparison Mode Banner */}
          {comparisonMode && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-primary">
                <strong>Comparison Mode:</strong> Select two photos to compare side-by-side.
                {comparisonPhotos[0] && !comparisonPhotos[1] && " Now select the second photo."}
              </p>
              {comparisonPhotos[0] && comparisonPhotos[1] && (
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => setLightboxOpen(true)}
                  >
                    View Comparison
                  </Button>
                  <Button
                    variant="goldOutline"
                    size="sm"
                    onClick={() => setShareDialogOpen(true)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Transformation
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                  )}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "timeline" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                  )}
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <Select value={filter} onValueChange={(v: FilterType) => setFilter(v)}>
                <SelectTrigger className="w-32 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Photos</SelectItem>
                  <SelectItem value="before">Before</SelectItem>
                  <SelectItem value="during">Progress</SelectItem>
                  <SelectItem value="after">After</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:ml-auto text-sm text-muted-foreground">
              {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? "s" : ""}
            </div>
          </div>

          {filteredPhotos.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
              <p className="text-muted-foreground mb-4">
                Start documenting your transformation journey
              </p>
              <Link to="/dashboard/progress">
                <Button variant="gold">Upload Photos</Button>
              </Link>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredPhotos.map((photo) => {
                const PrivacyIcon = privacyIcons[photo.privacy_level];
                const isSelected = comparisonPhotos.some(p => p?.id === photo.id);
                
                return (
                  <div
                    key={photo.id}
                    onClick={() => handlePhotoClick(photo)}
                    className={cn(
                      "relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer group",
                      "border-2 transition-all",
                      isSelected 
                        ? "border-primary ring-2 ring-primary/50" 
                        : "border-transparent hover:border-primary/50"
                    )}
                  >
                    <img
                      src={photo.url}
                      alt={`${photo.photo_type} photo`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Type badge */}
                    <div className={cn(
                      "absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium border",
                      typeColors[photo.photo_type]
                    )}>
                      {photo.photo_type.charAt(0).toUpperCase() + photo.photo_type.slice(1)}
                    </div>

                    {/* Privacy icon */}
                    <div className="absolute top-2 right-2 p-1 rounded bg-background/80">
                      <PrivacyIcon className="h-3 w-3 text-muted-foreground" />
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate">{photo.caption || "No caption"}</p>
                      <p className="text-xs text-white/70">
                        {format(new Date(photo.created_at), "MMM d, yyyy")}
                      </p>
                    </div>

                    {/* Zoom indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-2 rounded-full bg-background/80">
                        <ZoomIn className="h-5 w-5 text-foreground" />
                      </div>
                    </div>

                    {/* Selection indicator for comparison */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                          {comparisonPhotos[0]?.id === photo.id ? "1" : "2"}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Timeline View */
            <div className="space-y-8">
              {Object.entries(photosByWeek).map(([week, weekPhotos]) => (
                <div key={week} className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-display text-lg text-primary mb-4">{week}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {weekPhotos.map((photo) => {
                      const isSelected = comparisonPhotos.some(p => p?.id === photo.id);
                      return (
                        <div
                          key={photo.id}
                          onClick={() => handlePhotoClick(photo)}
                          className={cn(
                            "relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer",
                            "border-2 transition-all hover:border-primary/50",
                            isSelected ? "border-primary" : "border-transparent"
                          )}
                        >
                          <img
                            src={photo.url}
                            alt={`${week} photo`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
                            {format(new Date(photo.created_at), "MMM d")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Comparison Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background border-border overflow-hidden">
          {comparisonMode && comparisonPhotos[0] && comparisonPhotos[1] ? (
            /* Comparison View */
            <div className="relative h-full">
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-charcoal/80 hover:bg-charcoal text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="grid md:grid-cols-2 gap-1 h-full min-h-[60vh]">
                {comparisonPhotos.map((photo, index) => (
                  <div key={index} className="relative bg-charcoal">
                    {photo && (
                      <>
                        <img
                          src={photo.url}
                          alt={`Comparison ${index + 1}`}
                          className="w-full h-full object-contain max-h-[85vh]"
                        />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <div className={cn(
                            "px-3 py-1 rounded-lg text-sm font-medium border",
                            typeColors[photo.photo_type]
                          )}>
                            {photo.photo_type.charAt(0).toUpperCase() + photo.photo_type.slice(1)}
                            {photo.week_number && ` - Week ${photo.week_number}`}
                          </div>
                          <div className="px-3 py-1 rounded-lg bg-charcoal/80 text-sm text-muted-foreground">
                            {format(new Date(photo.created_at), "MMM d, yyyy")}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : selectedPhoto ? (
            /* Single Photo View */
            <div className="relative">
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-charcoal/80 hover:bg-charcoal text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Navigation arrows */}
              {filteredPhotos.length > 1 && (
                <>
                  <button
                    onClick={() => navigateLightbox("prev")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-charcoal/80 hover:bg-charcoal text-foreground"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => navigateLightbox("next")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-charcoal/80 hover:bg-charcoal text-foreground"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <div className="flex flex-col md:flex-row min-h-[60vh]">
                {/* Image */}
                <div className="flex-1 bg-charcoal flex items-center justify-center p-4">
                  <img
                    src={selectedPhoto.url}
                    alt="Full size"
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>

                {/* Info Panel */}
                <div className="w-full md:w-80 p-6 border-t md:border-t-0 md:border-l border-border bg-card">
                  <div className={cn(
                    "inline-block px-3 py-1 rounded-lg text-sm font-medium border mb-4",
                    typeColors[selectedPhoto.photo_type]
                  )}>
                    {selectedPhoto.photo_type.charAt(0).toUpperCase() + selectedPhoto.photo_type.slice(1)}
                    {selectedPhoto.week_number && ` - Week ${selectedPhoto.week_number}`}
                  </div>

                  <h3 className="font-semibold mb-2">
                    {selectedPhoto.caption || "No caption"}
                  </h3>

                  <div className="space-y-3 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(selectedPhoto.created_at), "MMMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = privacyIcons[selectedPhoto.privacy_level];
                        return <Icon className="h-4 w-4" />;
                      })()}
                      {privacyLabels[selectedPhoto.privacy_level]}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Photo
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete Photo
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4">
                    Photo {currentLightboxIndex + 1} of {filteredPhotos.length}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Share Collage Dialog */}
      <ShareCollageDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        beforePhoto={comparisonPhotos[0]}
        afterPhoto={comparisonPhotos[1]}
        weeksDiff={getComparisonWeeksDiff()}
      />
    </DashboardLayout>
  );
}
