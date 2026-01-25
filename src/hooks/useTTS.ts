import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseTTSOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useTTS(options: UseTTSOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const { toast } = useToast();

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (audioRef.current && isPaused) {
      audioRef.current.play();
      setIsPaused(false);
      setIsPlaying(true);
    }
  }, [isPaused]);

  const speak = useCallback(async (text: string) => {
    // If already playing, stop first
    stop();

    if (!text || text.trim().length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to use audio features");
      }

      // Truncate text if too long (ElevenLabs limit)
      const truncatedText = text.length > 2500 ? text.slice(0, 2500) + "..." : text;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/warden-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ text: truncatedText }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate audio");
      }

      // Clean up previous audio URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
        options.onStart?.();
      };

      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
        options.onEnd?.();
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
        const errorMsg = "Failed to play audio";
        options.onError?.(errorMsg);
        toast({
          title: "Audio Error",
          description: errorMsg,
          variant: "destructive",
        });
      };

      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to generate audio";
      options.onError?.(errorMsg);
      toast({
        title: "Audio Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [stop, toast, options]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    }
  }, [isPlaying, isPaused, pause, resume]);

  return {
    speak,
    stop,
    pause,
    resume,
    toggle,
    isLoading,
    isPlaying,
    isPaused,
    isActive: isPlaying || isPaused,
  };
}
