import { Volume2, VolumeX, Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioPlayButtonProps {
  isLoading?: boolean;
  isPlaying?: boolean;
  isPaused?: boolean;
  onClick: () => void;
  onStop?: () => void;
  label?: string;
  variant?: "default" | "compact" | "icon";
  className?: string;
  disabled?: boolean;
}

export function AudioPlayButton({
  isLoading = false,
  isPlaying = false,
  isPaused = false,
  onClick,
  onStop,
  label = "Listen",
  variant = "default",
  className,
  disabled = false,
}: AudioPlayButtonProps) {
  const isActive = isPlaying || isPaused;

  const handleClick = () => {
    if (isPlaying && onStop) {
      onStop();
    } else {
      onClick();
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={cn(
          "text-muted-foreground hover:text-primary transition-colors",
          isActive && "text-primary",
          className
        )}
        title={isPlaying ? "Stop" : isPaused ? "Resume" : label}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="h-4 w-4" />
        ) : isPaused ? (
          <Play className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full transition-all",
          isActive
            ? "bg-primary/20 text-primary border border-primary/30"
            : "bg-charcoal text-muted-foreground hover:text-primary hover:bg-charcoal/80 border border-border",
          (disabled || isLoading) && "opacity-50 cursor-not-allowed",
          className
        )}
        title={isPlaying ? "Stop" : isPaused ? "Resume" : label}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="h-3 w-3" />
        ) : isPaused ? (
          <Play className="h-3 w-3" />
        ) : (
          <Volume2 className="h-3 w-3" />
        )}
        <span>{isPlaying ? "Stop" : isPaused ? "Resume" : label}</span>
      </button>
    );
  }

  // Default variant
  return (
    <Button
      variant={isActive ? "gold" : "goldOutline"}
      size="sm"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn("gap-2", className)}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <VolumeX className="h-4 w-4" />
      ) : isPaused ? (
        <Play className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      {isPlaying ? "Stop" : isPaused ? "Resume" : label}
    </Button>
  );
}
