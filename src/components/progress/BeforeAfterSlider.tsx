import { useState, useRef, useCallback, useEffect } from "react";
import { ProgressPhoto } from "@/hooks/useProgressPhotos";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
  beforePhoto: ProgressPhoto;
  afterPhoto: ProgressPhoto;
}

export default function BeforeAfterSlider({ beforePhoto, afterPhoto }: BeforeAfterSliderProps) {
  const [sliderPercent, setSliderPercent] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getPercentFromEvent = useCallback((clientX: number) => {
    if (!containerRef.current) return 50;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = (x / rect.width) * 100;
    return Math.max(0, Math.min(100, percent));
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    setSliderPercent(getPercentFromEvent(clientX));
  }, [getPercentFromEvent]);

  const handleStart = useCallback((clientX: number) => {
    isDragging.current = true;
    setSliderPercent(getPercentFromEvent(clientX));
  }, [getPercentFromEvent]);

  const handleEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Mouse events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  }, [handleStart]);

  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  }, [handleStart]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onUp = () => handleEnd();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [handleMove, handleEnd]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border-2 border-border bg-charcoal aspect-[3/4] cursor-col-resize select-none"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* Before image (full, underneath) */}
        <img
          src={beforePhoto.url}
          alt="Before"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* After image (clipped from the left) */}
        <img
          src={afterPhoto.url}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ clipPath: `inset(0 0 0 ${sliderPercent}%)` }}
          draggable={false}
        />

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 z-10 pointer-events-none"
          style={{ left: `${sliderPercent}%`, transform: "translateX(-50%)" }}
        >
          {/* Vertical line */}
          <div className="w-0.5 h-full bg-primary shadow-[0_0_6px_rgba(212,175,55,0.5)]" />

          {/* Circle grip */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center pointer-events-auto">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary-foreground">
              <path d="M5 3L2 8L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 3L14 8L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* "Before" label */}
        <div className={cn(
          "absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold",
          "bg-red-500/80 text-white backdrop-blur-sm",
          "transition-opacity",
          sliderPercent < 10 ? "opacity-0" : "opacity-100"
        )}>
          Before
        </div>

        {/* "After" label */}
        <div className={cn(
          "absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-semibold",
          "bg-green-500/80 text-white backdrop-blur-sm",
          "transition-opacity",
          sliderPercent > 90 ? "opacity-0" : "opacity-100"
        )}>
          After
        </div>

        {/* Date labels at bottom */}
        <div className={cn(
          "absolute bottom-3 left-3 px-2 py-1 rounded-md text-xs",
          "bg-charcoal/80 text-muted-foreground backdrop-blur-sm",
          "transition-opacity",
          sliderPercent < 10 ? "opacity-0" : "opacity-100"
        )}>
          {format(new Date(beforePhoto.taken_at || beforePhoto.created_at), "MMM d, yyyy")}
        </div>

        <div className={cn(
          "absolute bottom-3 right-3 px-2 py-1 rounded-md text-xs",
          "bg-charcoal/80 text-muted-foreground backdrop-blur-sm",
          "transition-opacity",
          sliderPercent > 90 ? "opacity-0" : "opacity-100"
        )}>
          {format(new Date(afterPhoto.taken_at || afterPhoto.created_at), "MMM d, yyyy")}
        </div>
      </div>
    </div>
  );
}
