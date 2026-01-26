import { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, Volume2, VolumeX, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ScreenSlide {
  id: string;
  screen: string;
  highlight_areas?: string[];
  start: number;
  end: number;
  zoom_level?: number;
}

interface CaptionLine {
  text: string;
  start: number;
  end: number;
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

// Screenshot mappings per tier - these would ideally be uploaded to storage
const TIER_SCREENSHOTS: Record<string, Record<string, string>> = {
  membership: {
    "dashboard-overview": "🏠 Dashboard Overview",
    "workouts-library": "💪 Yard Time Workouts",
    "discipline-routines": "⏰ Morning Discipline",
    "progress-tracker": "📸 Time Served Progress",
    "checkin-form": "📋 Roll Call Check-in",
  },
  transformation: {
    "dashboard-overview": "🏠 Dashboard Overview",
    "program-week1": "📅 The Sentence - Week 1",
    "workout-detail": "💪 Workout Details",
    "nutrition-plan": "🍽️ Chow Hall Nutrition",
    "faith-lesson": "⛪ Chapel - Faith Lessons",
    "community-yard": "👥 The Yard Community",
  },
  coaching: {
    "dashboard-overview": "🏠 Welcome Home",
    "coaching-portal": "📞 Coaching Portal",
    "messages-direct": "💬 Direct Line",
    "program-custom": "📋 Your Program",
    "advanced-skills": "🚀 Advanced Skills",
  },
};

// Gradient backgrounds per slide for visual variety
const SLIDE_GRADIENTS: Record<string, string> = {
  "dashboard-overview": "from-charcoal via-background to-charcoal",
  "workouts-library": "from-primary/20 via-charcoal to-background",
  "discipline-routines": "from-yellow-900/30 via-charcoal to-background",
  "progress-tracker": "from-green-900/30 via-charcoal to-background",
  "checkin-form": "from-blue-900/30 via-charcoal to-background",
  "program-week1": "from-primary/30 via-charcoal to-background",
  "workout-detail": "from-red-900/30 via-charcoal to-background",
  "nutrition-plan": "from-orange-900/30 via-charcoal to-background",
  "faith-lesson": "from-purple-900/30 via-charcoal to-background",
  "community-yard": "from-green-900/30 via-charcoal to-background",
  "coaching-portal": "from-blue-900/30 via-charcoal to-background",
  "messages-direct": "from-cyan-900/30 via-charcoal to-background",
  "program-custom": "from-primary/30 via-charcoal to-background",
  "advanced-skills": "from-yellow-900/30 via-charcoal to-background",
};

// Icon mapping for visual representation
const SLIDE_ICONS: Record<string, string> = {
  "dashboard-overview": "🏠",
  "workouts-library": "💪",
  "discipline-routines": "⏰",
  "progress-tracker": "📸",
  "checkin-form": "📋",
  "program-week1": "📅",
  "workout-detail": "🎯",
  "nutrition-plan": "🍽️",
  "faith-lesson": "⛪",
  "community-yard": "👥",
  "coaching-portal": "📞",
  "messages-direct": "💬",
  "program-custom": "📋",
  "advanced-skills": "🚀",
};

export function OnboardingVideoWithVisuals({
  audioUrl,
  captionLines = [],
  screenSlides = [],
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

  // Get current slide based on time
  const currentSlide = useMemo(() => {
    if (!screenSlides?.length) return null;
    const slide = screenSlides.find(s => currentTime >= s.start && currentTime < s.end);
    return slide || screenSlides[0];
  }, [currentTime, screenSlides]);

  // Update slide index for transitions
  useEffect(() => {
    if (!screenSlides?.length) return;
    const index = screenSlides.findIndex(s => currentTime >= s.start && currentTime < s.end);
    if (index >= 0 && index !== currentSlideIndex) {
      setCurrentSlideIndex(index);
    }
  }, [currentTime, screenSlides, currentSlideIndex]);

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

  const slideLabel = currentSlide 
    ? TIER_SCREENSHOTS[tierKey]?.[currentSlide.screen] || currentSlide.screen
    : tierName;

  const slideGradient = currentSlide 
    ? SLIDE_GRADIENTS[currentSlide.screen] || "from-charcoal via-background to-charcoal"
    : "from-charcoal via-background to-charcoal";

  const slideIcon = currentSlide 
    ? SLIDE_ICONS[currentSlide.screen] || "📺"
    : "📺";

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Visual area with animated slides */}
      <div className="relative aspect-video overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide?.id || "default"}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: 1, 
              scale: currentSlide?.zoom_level || 1.0,
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-gradient-to-br",
              slideGradient
            )}
          >
            {/* Central visual indicator */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center z-10"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="text-6xl md:text-8xl mb-4"
              >
                {slideIcon}
              </motion.div>
              <p className={cn("text-lg md:text-xl font-semibold", accentClass)}>
                {slideLabel}
              </p>
            </motion.div>

            {/* Highlight areas animation */}
            {currentSlide?.highlight_areas?.map((area, idx) => (
              <motion.div
                key={`${currentSlide.id}-${area}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: idx * 0.2 
                }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2"
              >
                <div className="px-4 py-2 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-sm">
                  <span className="text-sm text-primary">{area.replace(/-/g, ' ')}</span>
                </div>
              </motion.div>
            ))}

            {/* Background branding */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <span className="text-4xl md:text-6xl font-bold tracking-widest">
                REDEEMED STRENGTH
              </span>
            </div>
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
        {screenSlides.length > 1 && (
          <div className="absolute top-4 left-4 flex gap-1 z-30">
            {screenSlides.map((slide, idx) => (
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

          {/* Current slide label */}
          <span className="text-xs text-muted-foreground hidden sm:block">
            {slideLabel}
          </span>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
}
