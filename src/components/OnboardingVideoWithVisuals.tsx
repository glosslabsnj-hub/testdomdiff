import { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, Volume2, VolumeX, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Import screenshots for each tier
import solitaryDashboard from "@/assets/onboarding/solitary/dashboard.png";
import solitaryIntake from "@/assets/onboarding/solitary/intake.png";
import solitaryWorkouts from "@/assets/onboarding/solitary/workouts.png";
import solitaryDiscipline from "@/assets/onboarding/solitary/discipline.png";
import solitaryNutrition from "@/assets/onboarding/solitary/nutrition.png";
import solitaryProgress from "@/assets/onboarding/solitary/progress.png";

// Screenshot mappings per tier with actual images
const TIER_SCREENSHOT_IMAGES: Record<string, Record<string, string>> = {
  membership: {
    "dashboard-overview": solitaryDashboard,
    "intake-checklist": solitaryIntake,
    "workouts-library": solitaryWorkouts,
    "discipline-routines": solitaryDiscipline,
    "nutrition-plan": solitaryNutrition,
    "progress-tracker": solitaryProgress,
  },
  // Gen Pop and Coaching will use placeholder until screenshots uploaded
  transformation: {},
  coaching: {},
};

// Screenshot labels for display
const TIER_SCREENSHOT_LABELS: Record<string, Record<string, string>> = {
  membership: {
    "dashboard-overview": "Your Cell Block",
    "intake-checklist": "Intake Processing",
    "workouts-library": "Yard Time Workouts",
    "discipline-routines": "Lights On / Lights Out",
    "nutrition-plan": "Chow Hall",
    "progress-tracker": "Time Served",
  },
  transformation: {
    "dashboard-overview": "Your Cell Block",
    "program-week": "The Sentence",
    "workouts-library": "Yard Time",
    "discipline-routines": "Lights On / Lights Out",
    "nutrition-plan": "Chow Hall",
    "faith-lesson": "The Chapel",
    "community-yard": "The Yard",
    "progress-tracker": "Time Served",
  },
  coaching: {
    "dashboard-overview": "Your Cell Block",
    "coaching-portal": "Coaching Portal",
    "direct-line": "Direct Line",
    "advanced-skills": "The Network",
    "program-custom": "Your Program",
    "nutrition-plan": "Chow Hall",
    "faith-lesson": "The Chapel",
    "progress-tracker": "Time Served",
  },
};

// Default slides if none provided from database
const DEFAULT_SLIDES: Record<string, ScreenSlide[]> = {
  membership: [
    { id: "1", screen: "dashboard-overview", start: 0, end: 30, zoom_level: 1.0, pan: { x: 0, y: 0 } },
    { id: "2", screen: "intake-checklist", start: 30, end: 60, zoom_level: 1.15, pan: { x: 0, y: 10 } },
    { id: "3", screen: "workouts-library", start: 60, end: 90, zoom_level: 1.1, pan: { x: 0, y: 0 } },
    { id: "4", screen: "discipline-routines", start: 90, end: 120, zoom_level: 1.12, pan: { x: 0, y: 5 } },
    { id: "5", screen: "nutrition-plan", start: 120, end: 150, zoom_level: 1.08, pan: { x: 0, y: -5 } },
    { id: "6", screen: "progress-tracker", start: 150, end: 180, zoom_level: 1.05, pan: { x: 0, y: 0 } },
  ],
  transformation: [
    { id: "1", screen: "dashboard-overview", start: 0, end: 25, zoom_level: 1.0 },
    { id: "2", screen: "program-week", start: 25, end: 50, zoom_level: 1.1 },
    { id: "3", screen: "workouts-library", start: 50, end: 75, zoom_level: 1.1 },
    { id: "4", screen: "discipline-routines", start: 75, end: 100, zoom_level: 1.1 },
    { id: "5", screen: "nutrition-plan", start: 100, end: 125, zoom_level: 1.1 },
    { id: "6", screen: "faith-lesson", start: 125, end: 150, zoom_level: 1.1 },
    { id: "7", screen: "community-yard", start: 150, end: 175, zoom_level: 1.1 },
    { id: "8", screen: "progress-tracker", start: 175, end: 200, zoom_level: 1.05 },
  ],
  coaching: [
    { id: "1", screen: "dashboard-overview", start: 0, end: 25, zoom_level: 1.0 },
    { id: "2", screen: "coaching-portal", start: 25, end: 50, zoom_level: 1.1 },
    { id: "3", screen: "direct-line", start: 50, end: 75, zoom_level: 1.1 },
    { id: "4", screen: "advanced-skills", start: 75, end: 100, zoom_level: 1.1 },
    { id: "5", screen: "program-custom", start: 100, end: 125, zoom_level: 1.1 },
    { id: "6", screen: "nutrition-plan", start: 125, end: 150, zoom_level: 1.1 },
    { id: "7", screen: "faith-lesson", start: 150, end: 175, zoom_level: 1.1 },
    { id: "8", screen: "progress-tracker", start: 175, end: 200, zoom_level: 1.05 },
  ],
};

// Support both string and object formats for highlight areas
type HighlightArea = string | { x: number; y: number; width: number; height: number };

interface CaptionLine {
  text: string;
  start: number;
  end: number;
}

interface ScreenSlide {
  id: string;
  screen: string;
  highlight_areas?: HighlightArea[];
  start: number;
  end: number;
  zoom_level?: number;
  pan?: { x: number; y: number };
}

interface OnboardingVideoWithVisualsProps {
  audioUrl: string;
  captionLines?: CaptionLine[];
  screenSlides?: ScreenSlide[];
  tierKey: string;
  tierName: string;
  accentClass?: string;
  onVideoWatched?: () => void;
}

export function OnboardingVideoWithVisuals({
  audioUrl,
  captionLines = [],
  screenSlides,
  tierKey,
  tierName,
  accentClass = "text-primary",
  onVideoWatched,
}: OnboardingVideoWithVisualsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasWatched, setHasWatched] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentCaption, setCurrentCaption] = useState("");

  // Use provided slides or default slides based on tier
  const effectiveSlides = useMemo(() => {
    if (screenSlides && screenSlides.length > 0) return screenSlides;
    return DEFAULT_SLIDES[tierKey] || DEFAULT_SLIDES.membership;
  }, [screenSlides, tierKey]);

  // Get current slide based on time
  const currentSlide = useMemo(() => {
    if (!effectiveSlides.length) return null;
    const slide = effectiveSlides.find(s => currentTime >= s.start && currentTime < s.end);
    return slide || effectiveSlides[0];
  }, [currentTime, effectiveSlides]);

  // Update slide index for transitions
  useEffect(() => {
    if (!effectiveSlides.length) return;
    const index = effectiveSlides.findIndex(s => currentTime >= s.start && currentTime < s.end);
    if (index >= 0 && index !== currentSlideIndex) {
      setCurrentSlideIndex(index);
    }
  }, [currentTime, effectiveSlides, currentSlideIndex]);

  // Update caption based on time
  useEffect(() => {
    if (!captionLines?.length) return;
    const caption = captionLines.find(c => currentTime >= c.start && currentTime < c.end);
    setCurrentCaption(caption?.text || "");
  }, [currentTime, captionLines]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setHasWatched(true);
      onVideoWatched?.();
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [onVideoWatched]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Get screenshot image for current slide
  const getScreenshotImage = () => {
    if (!currentSlide) return null;
    return TIER_SCREENSHOT_IMAGES[tierKey]?.[currentSlide.screen] || null;
  };

  // Get label for current slide
  const getSlideLabel = () => {
    if (!currentSlide) return tierName;
    return TIER_SCREENSHOT_LABELS[tierKey]?.[currentSlide.screen] || currentSlide.screen.replace(/-/g, ' ');
  };

  const screenshotImage = getScreenshotImage();
  const slideLabel = getSlideLabel();

  // Calculate Ken Burns animation values
  const getKenBurnsAnimation = () => {
    if (!currentSlide) return { scale: 1, x: 0, y: 0 };
    
    const slideProgress = currentSlide.end > currentSlide.start 
      ? (currentTime - currentSlide.start) / (currentSlide.end - currentSlide.start)
      : 0;
    
    const baseZoom = currentSlide.zoom_level || 1.0;
    const pan = currentSlide.pan || { x: 0, y: 0 };
    
    // Slow zoom and pan effect
    const scale = baseZoom + (slideProgress * 0.05); // Subtle zoom during slide
    const x = pan.x * slideProgress;
    const y = pan.y * slideProgress;
    
    return { scale, x, y };
  };

  const kenBurns = getKenBurnsAnimation();

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Visual area with animated slides */}
      <div className="relative aspect-video overflow-hidden bg-charcoal">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide?.id || "default"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {screenshotImage ? (
              // Real screenshot with Ken Burns effect
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: kenBurns.scale,
                  x: `${kenBurns.x}%`,
                  y: `${kenBurns.y}%`,
                }}
                transition={{ duration: 0.1, ease: "linear" }}
              >
                <img
                  src={screenshotImage}
                  alt={slideLabel}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ) : (
              // Fallback gradient with icon for tiers without screenshots
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-charcoal via-background to-charcoal">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-center z-10"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-6xl md:text-8xl mb-4"
                  >
                    📺
                  </motion.div>
                  <p className={cn("text-lg md:text-xl font-semibold", accentClass)}>
                    {slideLabel}
                  </p>
                </motion.div>
              </div>
            )}

            {/* Highlight areas animation */}
            {currentSlide?.highlight_areas?.filter(Boolean).map((area, idx) => {
              if (!area) return null;
              const isObjectFormat = typeof area === 'object' && 'x' in area;
              
              if (isObjectFormat) {
                const areaObj = area as { x: number; y: number; width: number; height: number };
                return (
                  <motion.div
                    key={`${currentSlide.id}-highlight-${idx}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ 
                      opacity: [0.4, 0.8, 0.4],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.2 }}
                    className="absolute border-2 border-primary rounded-lg pointer-events-none"
                    style={{
                      left: `${areaObj.x}%`,
                      top: `${areaObj.y}%`,
                      width: `${areaObj.width}%`,
                      height: `${areaObj.height}%`,
                      boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)',
                    }}
                  />
                );
              }
              
              return null;
            })}

            {/* Vignette overlay for polish */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        {/* Caption overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentCaption}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "text-base md:text-lg lg:text-xl font-medium text-center min-h-[2em]",
                currentCaption ? "text-white" : "text-transparent"
              )}
            >
              {currentCaption || " "}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Play button overlay when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group z-30"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl"
            >
              <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1" />
            </motion.div>
          </button>
        )}

        {/* Watched badge */}
        {hasWatched && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium z-30"
          >
            <Check className="w-3 h-3" />
            Watched
          </motion.div>
        )}

        {/* Slide progress indicators */}
        {effectiveSlides.length > 1 && (
          <div className="absolute top-4 left-4 flex gap-1 z-30">
            {effectiveSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  idx === currentSlideIndex 
                    ? "w-6 bg-primary" 
                    : idx < currentSlideIndex 
                      ? "w-3 bg-primary/60" 
                      : "w-3 bg-white/30"
                )}
              />
            ))}
          </div>
        )}

        {/* Current slide label */}
        <div className="absolute top-4 right-4 z-20">
          {!hasWatched && (
            <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs text-white/80">
              {slideLabel}
            </span>
          )}
        </div>
      </div>

      {/* Audio controls */}
      <div className="p-4 space-y-3 bg-charcoal">
        {/* Progress bar */}
        <div className="relative">
          <Progress value={progressPercent} className="h-2 cursor-pointer" />
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              if (audioRef.current) {
                audioRef.current.currentTime = Number(e.target.value);
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="h-10 w-10"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-10 w-10"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Slide counter */}
          <span className="text-xs text-muted-foreground hidden sm:block">
            {currentSlideIndex + 1} / {effectiveSlides.length}
          </span>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
}
