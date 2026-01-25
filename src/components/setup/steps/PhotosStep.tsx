import { useState, useEffect } from "react";
import { Camera, Check, Upload, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PhotosStepProps {
  onReady: () => void;
}

export default function PhotosStep({ onReady }: PhotosStepProps) {
  const [skipped, setSkipped] = useState(false);

  // Always enable proceed - photos are optional
  useEffect(() => {
    onReady();
  }, [onReady]);

  const photoTypes = [
    { type: "front", label: "Front View", description: "Face the camera, arms at sides" },
    { type: "side", label: "Side View", description: "Turn 90°, arms at sides" },
    { type: "back", label: "Back View", description: "Face away from camera" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Document Your Starting Point</h2>
        <p className="text-muted-foreground">
          Take starting photos now. You'll thank yourself in 12 weeks when you see the transformation.
        </p>
      </div>

      {/* Photo Upload Guide */}
      <div className="bg-charcoal rounded-xl border border-border overflow-hidden mb-6">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Progress Photos</h3>
              <p className="text-sm text-muted-foreground">3 angles for complete tracking</p>
            </div>
          </div>
        </div>

        <div className="p-4 grid sm:grid-cols-3 gap-4">
          {photoTypes.map((photo) => (
            <div 
              key={photo.type}
              className="aspect-[3/4] rounded-lg border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center p-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">{photo.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{photo.description}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="gold" className="w-full gap-2" asChild>
            <Link to="/dashboard/progress">
              <Upload className="w-4 h-4" />
              Upload Photos in Progress Tracker
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-charcoal rounded-xl border border-border p-6 mb-6">
        <h3 className="font-semibold mb-4">📸 Photo Tips for Best Results</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Use good lighting — natural light works best</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Same location and time of day for future comparisons</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Wear minimal, form-fitting clothing (shorts for men)</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Relaxed pose — don't flex or suck in</span>
          </li>
        </ul>
      </div>

      {/* Skip Option */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Not ready to take photos right now?
        </p>
        <Button 
          variant="ghost" 
          onClick={() => setSkipped(true)}
          className={cn(skipped && "text-primary")}
        >
          {skipped ? "Skipping for now ✓" : "Skip this step"}
        </Button>
      </div>

      {/* Why This Matters */}
      <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <h4 className="font-medium text-foreground text-sm mb-1">💡 Why This Matters</h4>
        <p className="text-sm text-muted-foreground">
          The scale doesn't tell the whole story. Progress photos reveal changes in body composition 
          that numbers can't capture. Even if you skip now, come back and add them within the first week.
        </p>
      </div>
    </div>
  );
}
