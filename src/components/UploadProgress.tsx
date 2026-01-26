import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  progress: number;
  fileName?: string;
  isVisible: boolean;
}

export function UploadProgress({ progress, fileName, isVisible }: UploadProgressProps) {
  if (!isVisible) return null;

  return (
    <div className="space-y-2 py-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground truncate max-w-[200px]">
          {fileName || "Uploading..."}
        </span>
        <span className="text-primary font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
