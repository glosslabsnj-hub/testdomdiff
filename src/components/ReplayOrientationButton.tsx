import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ReplayOrientationButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ReplayOrientationButton({ 
  variant = "outline", 
  size = "default",
  className 
}: ReplayOrientationButtonProps) {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  const handleReplayOrientation = async () => {
    if (!user) return;
    
    setIsResetting(true);
    try {
      // Reset first_login_video_watched to false to allow replay
      await supabase
        .from("profiles")
        .update({ first_login_video_watched: false })
        .eq("user_id", user.id);
      
      // Refresh profile to update state
      await refreshProfile();
      
      // Navigate to the onboarding page
      navigate("/onboarding");
    } catch (error) {
      console.error("Error resetting orientation:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleReplayOrientation}
      disabled={isResetting}
      className={className}
    >
      {isResetting ? (
        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Play className="w-4 h-4 mr-2" />
      )}
      Replay Orientation
    </Button>
  );
}

export default ReplayOrientationButton;
