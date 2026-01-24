import { useState } from "react";
import { ArrowLeftRight, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ProgressPhoto } from "@/hooks/useProgressPhotos";

interface PhotoComparisonProps {
  photos: ProgressPhoto[];
}

export default function PhotoComparison({ photos }: PhotoComparisonProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<[ProgressPhoto | null, ProgressPhoto | null]>([null, null]);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const beforePhotos = photos.filter((p) => p.photo_type === "before");
  const duringPhotos = photos.filter((p) => p.photo_type === "during");
  const afterPhotos = photos.filter((p) => p.photo_type === "after");

  const hasPhotosForComparison = beforePhotos.length > 0 && (duringPhotos.length > 0 || afterPhotos.length > 0);

  const handlePhotoSelect = (photo: ProgressPhoto, slot: 0 | 1) => {
    const newSelection = [...selectedPhotos] as [ProgressPhoto | null, ProgressPhoto | null];
    newSelection[slot] = photo;
    setSelectedPhotos(newSelection);
  };

  const allPhotos = [...beforePhotos, ...duringPhotos, ...afterPhotos];

  if (allPhotos.length < 2) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-lg mb-2">Side-by-Side Comparison</h3>
        <p className="text-muted-foreground text-sm">
          Upload at least 2 photos to compare your transformation progress
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Compare Your Progress</h3>
        {selectedPhotos[0] && selectedPhotos[1] && (
          <Button variant="outline" size="sm" onClick={() => setFullscreenOpen(true)}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Left Photo Selector */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Select Photo 1</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {allPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => handlePhotoSelect(photo, 0)}
                className={cn(
                  "aspect-square rounded overflow-hidden border-2 transition-all",
                  selectedPhotos[0]?.id === photo.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-primary/50"
                )}
              >
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {selectedPhotos[0] ? (
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-charcoal">
              <img src={selectedPhotos[0].url} alt="Comparison left" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-[3/4] rounded-lg bg-charcoal flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Select a photo</p>
            </div>
          )}
        </div>

        {/* Right Photo Selector */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Select Photo 2</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {allPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => handlePhotoSelect(photo, 1)}
                className={cn(
                  "aspect-square rounded overflow-hidden border-2 transition-all",
                  selectedPhotos[1]?.id === photo.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-primary/50"
                )}
              >
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {selectedPhotos[1] ? (
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-charcoal">
              <img src={selectedPhotos[1].url} alt="Comparison right" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-[3/4] rounded-lg bg-charcoal flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Select a photo</p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Labels */}
      {selectedPhotos[0] && selectedPhotos[1] && (
        <div className="grid md:grid-cols-2 gap-4 text-center text-sm">
          <div className={cn(
            "py-2 px-4 rounded-lg",
            selectedPhotos[0].photo_type === "before" ? "bg-red-500/20 text-red-400" :
            selectedPhotos[0].photo_type === "during" ? "bg-amber-500/20 text-amber-400" :
            "bg-green-500/20 text-green-400"
          )}>
            {selectedPhotos[0].photo_type.charAt(0).toUpperCase() + selectedPhotos[0].photo_type.slice(1)}
            {selectedPhotos[0].caption && <span className="block text-xs opacity-75">{selectedPhotos[0].caption}</span>}
          </div>
          <div className={cn(
            "py-2 px-4 rounded-lg",
            selectedPhotos[1].photo_type === "before" ? "bg-red-500/20 text-red-400" :
            selectedPhotos[1].photo_type === "during" ? "bg-amber-500/20 text-amber-400" :
            "bg-green-500/20 text-green-400"
          )}>
            {selectedPhotos[1].photo_type.charAt(0).toUpperCase() + selectedPhotos[1].photo_type.slice(1)}
            {selectedPhotos[1].caption && <span className="block text-xs opacity-75">{selectedPhotos[1].caption}</span>}
          </div>
        </div>
      )}

      {/* Fullscreen Dialog */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] bg-background border-border p-2">
          <button
            onClick={() => setFullscreenOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-charcoal/80 hover:bg-charcoal text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="grid md:grid-cols-2 gap-4 h-full">
            {selectedPhotos[0] && (
              <div className="relative">
                <img
                  src={selectedPhotos[0].url}
                  alt="Comparison left"
                  className="w-full h-full object-contain max-h-[85vh]"
                />
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-charcoal/80 text-sm">
                  {selectedPhotos[0].photo_type.charAt(0).toUpperCase() + selectedPhotos[0].photo_type.slice(1)}
                </div>
              </div>
            )}
            {selectedPhotos[1] && (
              <div className="relative">
                <img
                  src={selectedPhotos[1].url}
                  alt="Comparison right"
                  className="w-full h-full object-contain max-h-[85vh]"
                />
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-charcoal/80 text-sm">
                  {selectedPhotos[1].photo_type.charAt(0).toUpperCase() + selectedPhotos[1].photo_type.slice(1)}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
