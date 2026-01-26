import { useState } from "react";
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
  const { user, refreshProfile } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  const handleReplayOrientation = async () => {
    if (!user) return;
    
    setIsResetting(true);
    try {
      // Reset orientation_dismissed to false to trigger the modal
      await supabase
        .from("profiles")
        .update({ orientation_dismissed: false })
        .eq("user_id", user.id);
      
      // Clear localStorage fallback
      localStorage.removeItem("orientationModalDismissed");
      
      // Refresh profile to trigger modal
      await refreshProfile();
      
      // Reload the page to show the modal
      window.location.reload();
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
