import { Camera, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProgressPhotos } from "@/hooks/useProgressPhotos";
import { useAuth } from "@/contexts/AuthContext";

export function TransformationWidget() {
  const { photos, loading, getPhotosByType } = useProgressPhotos();
  const { subscription } = useAuth();
  const isCoaching = subscription?.plan_type === "coaching";

  if (loading) {
    return (
      <div className="cell-block p-4 mb-6">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Get the oldest "before" photo and most recent any-type photo
  const beforePhotos = getPhotosByType("before");
  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Oldest before photo (first uploaded "before" type)
  const firstPhoto = beforePhotos.length > 0 
    ? beforePhotos.reduce((oldest, photo) => 
        new Date(photo.created_at) < new Date(oldest.created_at) ? photo : oldest
      )
    : null;
  
  // Most recent photo of any type
  const latestPhoto = sortedPhotos[0] || null;

  // We have a comparison if we have both photos and they're different
  const hasComparison = firstPhoto && latestPhoto && firstPhoto.id !== latestPhoto.id;
  const hasAnyPhotos = photos.length > 0;

  // Calculate weeks between photos for display
  const getWeeksDiff = () => {
    if (!firstPhoto || !latestPhoto) return null;
    const diffMs = new Date(latestPhoto.created_at).getTime() - new Date(firstPhoto.created_at).getTime();
    const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    return weeks > 0 ? weeks : null;
  };
  const weeksDiff = getWeeksDiff();

  return (
    <div className="cell-block p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">
            {isCoaching ? "Your Transformation" : "Mugshot Timeline"}
          </h3>
        </div>
        {hasAnyPhotos && (
          <Link 
            to="/dashboard/photos" 
            className="text-xs text-primary hover:underline transition-colors"
          >
            View Gallery →
          </Link>
        )}
      </div>

      {hasComparison ? (
        <div className="flex items-center gap-4">
          {/* Before thumbnail */}
          <div className="flex-1 text-center">
            <div className="aspect-[3/4] rounded-lg overflow-hidden border border-red-500/30 bg-charcoal">
              <img
                src={firstPhoto.url}
                alt="Starting point"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isCoaching ? "Day 1" : "Booking Day"}
            </p>
          </div>

          {/* Arrow with weeks */}
          <div className="flex flex-col items-center flex-shrink-0">
            <ArrowRight className="w-6 h-6 text-primary" />
            {weeksDiff && (
              <span className="text-xs text-primary mt-1 font-medium">
                {weeksDiff}w
              </span>
            )}
          </div>

          {/* Current thumbnail */}
          <div className="flex-1 text-center">
            <div className="aspect-[3/4] rounded-lg overflow-hidden border border-green-500/30 bg-charcoal">
              <img
                src={latestPhoto.url}
                alt="Current progress"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {latestPhoto.week_number ? `Week ${latestPhoto.week_number}` : "Latest"}
            </p>
          </div>
        </div>
      ) : hasAnyPhotos ? (
        <div className="text-center p-4 bg-muted/20 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-3">
            {photos.length === 1 
              ? "Upload more photos to see your transformation side-by-side"
              : "Upload a 'before' photo to start tracking your transformation"}
          </p>
          <Button variant="goldOutline" size="sm" asChild>
            <Link to="/dashboard/progress">Add More Photos</Link>
          </Button>
        </div>
      ) : (
        <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
          <Camera className="w-10 h-10 text-primary mx-auto mb-3 opacity-60" />
          <p className="text-sm text-muted-foreground mb-3">
            {isCoaching
              ? "Document your journey from day one"
              : "Every transformation starts with a mugshot"}
          </p>
          <Button variant="gold" size="sm" asChild>
            <Link to="/dashboard/progress">
              {isCoaching ? "Upload First Photo" : "Take Your Mugshot"}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default TransformationWidget;
