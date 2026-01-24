import { useState, useRef, useCallback, useEffect } from "react";
import { 
  Share2, 
  Download, 
  Instagram, 
  Facebook,
  Copy,
  Check,
  Loader2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ProgressPhoto } from "@/hooks/useProgressPhotos";
import { format } from "date-fns";

interface ShareCollageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beforePhoto: ProgressPhoto | null;
  afterPhoto: ProgressPhoto | null;
  weeksDiff?: number;
}

export function ShareCollageDialog({
  open,
  onOpenChange,
  beforePhoto,
  afterPhoto,
  weeksDiff = 0,
}: ShareCollageDialogProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [collageUrl, setCollageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate the branded collage on canvas
  const generateCollage = useCallback(async () => {
    if (!beforePhoto?.url || !afterPhoto?.url || !canvasRef.current) return;

    setGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions (Instagram-friendly 1080x1350)
    canvas.width = 1080;
    canvas.height = 1350;

    try {
      // Load images
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      const [beforeImg, afterImg] = await Promise.all([
        loadImage(beforePhoto.url),
        loadImage(afterPhoto.url),
      ]);

      // Background - dark gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#1a1a1a");
      bgGradient.addColorStop(1, "#0a0a0a");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle texture overlay
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillRect(x, y, 1, 1);
      }

      // Header area
      ctx.fillStyle = "#d4af37"; // Gold
      ctx.font = "bold 48px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("REDEEMED STRENGTH", canvas.width / 2, 80);

      ctx.fillStyle = "#888888";
      ctx.font = "24px system-ui, sans-serif";
      ctx.fillText("TRANSFORMATION", canvas.width / 2, 120);

      // Photo dimensions
      const photoWidth = 480;
      const photoHeight = 640;
      const photoY = 180;
      const gap = 40;

      // Left photo (Before) with border
      const leftX = (canvas.width - photoWidth * 2 - gap) / 2;
      
      // Gold border
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 4;
      ctx.strokeRect(leftX - 4, photoY - 4, photoWidth + 8, photoHeight + 8);
      
      // Draw before photo (cover fit)
      const beforeAspect = beforeImg.width / beforeImg.height;
      const targetAspect = photoWidth / photoHeight;
      let sx, sy, sw, sh;
      if (beforeAspect > targetAspect) {
        sh = beforeImg.height;
        sw = sh * targetAspect;
        sx = (beforeImg.width - sw) / 2;
        sy = 0;
      } else {
        sw = beforeImg.width;
        sh = sw / targetAspect;
        sx = 0;
        sy = (beforeImg.height - sh) / 2;
      }
      ctx.drawImage(beforeImg, sx, sy, sw, sh, leftX, photoY, photoWidth, photoHeight);

      // Before label
      ctx.fillStyle = "rgba(220, 38, 38, 0.9)"; // Red
      ctx.fillRect(leftX, photoY + photoHeight - 50, photoWidth, 50);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("BEFORE", leftX + photoWidth / 2, photoY + photoHeight - 15);

      // Right photo (After) with border
      const rightX = leftX + photoWidth + gap;
      
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 4;
      ctx.strokeRect(rightX - 4, photoY - 4, photoWidth + 8, photoHeight + 8);
      
      // Draw after photo (cover fit)
      const afterAspect = afterImg.width / afterImg.height;
      if (afterAspect > targetAspect) {
        sh = afterImg.height;
        sw = sh * targetAspect;
        sx = (afterImg.width - sw) / 2;
        sy = 0;
      } else {
        sw = afterImg.width;
        sh = sw / targetAspect;
        sx = 0;
        sy = (afterImg.height - sh) / 2;
      }
      ctx.drawImage(afterImg, sx, sy, sw, sh, rightX, photoY, photoWidth, photoHeight);

      // After label
      ctx.fillStyle = "rgba(34, 197, 94, 0.9)"; // Green
      ctx.fillRect(rightX, photoY + photoHeight - 50, photoWidth, 50);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("AFTER", rightX + photoWidth / 2, photoY + photoHeight - 15);

      // Arrow between photos
      ctx.fillStyle = "#d4af37";
      const arrowY = photoY + photoHeight / 2;
      const arrowX = canvas.width / 2;
      ctx.beginPath();
      ctx.moveTo(arrowX - 20, arrowY - 15);
      ctx.lineTo(arrowX + 10, arrowY);
      ctx.lineTo(arrowX - 20, arrowY + 15);
      ctx.fill();

      // Stats section
      const statsY = photoY + photoHeight + 60;
      
      if (weeksDiff > 0) {
        ctx.fillStyle = "#d4af37";
        ctx.font = "bold 72px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${weeksDiff} WEEKS`, canvas.width / 2, statsY + 50);
      }

      // Footer
      ctx.fillStyle = "#666666";
      ctx.font = "20px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Iron sharpens iron. Proverbs 27:17", canvas.width / 2, canvas.height - 60);
      
      ctx.fillStyle = "#d4af37";
      ctx.font = "bold 24px system-ui, sans-serif";
      ctx.fillText("@redeemedstrength", canvas.width / 2, canvas.height - 30);

      // Convert to URL
      const url = canvas.toDataURL("image/png");
      setCollageUrl(url);
    } catch (error) {
      console.error("Error generating collage:", error);
      toast({
        title: "Error",
        description: "Failed to generate collage. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }, [beforePhoto, afterPhoto, weeksDiff, toast]);

  // Generate collage when dialog opens
  useEffect(() => {
    if (open && beforePhoto && afterPhoto) {
      generateCollage();
    } else {
      setCollageUrl(null);
    }
  }, [open, beforePhoto, afterPhoto, generateCollage]);

  const handleDownload = () => {
    if (!collageUrl) return;
    
    const link = document.createElement("a");
    link.download = `redeemed-transformation-${format(new Date(), "yyyy-MM-dd")}.png`;
    link.href = collageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Downloaded!", description: "Collage saved to your device." });
  };

  const handleShare = async () => {
    if (!collageUrl) return;

    // Convert data URL to blob for sharing
    const response = await fetch(collageUrl);
    const blob = await response.blob();
    const file = new File([blob], "transformation.png", { type: "image/png" });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: "My Transformation Journey",
          text: "Check out my transformation with Redeemed Strength! 💪 #redeemedstrength #transformation",
          files: [file],
        });
        toast({ title: "Shared!", description: "Your transformation has been shared." });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      // Fallback - download
      handleDownload();
    }
  };

  const handleCopyCaption = () => {
    const caption = `🔥 ${weeksDiff > 0 ? `${weeksDiff} weeks` : "My"} transformation with @redeemedstrength! 

Iron sharpens iron. Proverbs 27:17

#redeemedstrength #transformation #fitness #faithandfitness #discipline #mensfitness`;
    
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Caption copied to clipboard." });
  };

  const openInstagram = () => {
    // Download first, then open Instagram
    handleDownload();
    setTimeout(() => {
      window.open("https://instagram.com", "_blank");
    }, 500);
  };

  const openFacebook = () => {
    handleDownload();
    setTimeout(() => {
      window.open("https://facebook.com", "_blank");
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Your Transformation
          </DialogTitle>
        </DialogHeader>

        {/* Hidden canvas for generation */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="space-y-4">
          {/* Preview */}
          <div className="aspect-[4/5] rounded-lg overflow-hidden bg-charcoal border border-border relative">
            {generating ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Generating collage...</span>
              </div>
            ) : collageUrl ? (
              <img
                src={collageUrl}
                alt="Transformation collage preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Select photos to generate collage
              </div>
            )}
          </div>

          {/* Share buttons */}
          {collageUrl && (
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleDownload} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleShare} variant="gold" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={openInstagram} variant="outline" className="w-full">
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
              <Button onClick={openFacebook} variant="outline" className="w-full">
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
            </div>
          )}

          {/* Caption helper */}
          {collageUrl && (
            <div className="p-3 bg-muted/20 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Suggested Caption</span>
                <Button variant="ghost" size="sm" onClick={handleCopyCaption}>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                🔥 {weeksDiff > 0 ? `${weeksDiff} weeks` : "My"} transformation with @redeemedstrength! Iron sharpens iron. #redeemedstrength #transformation
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ShareCollageDialog;
