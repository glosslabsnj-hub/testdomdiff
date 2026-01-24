import { Shield, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface WardenTipProps {
  tip: string;
  className?: string;
}

export function WardenTip({ tip, className }: WardenTipProps) {
  const openWardenChat = () => {
    window.dispatchEvent(new CustomEvent('open-warden-chat'));
  };

  return (
    <div 
      className={cn(
        "bg-charcoal-dark/50 border border-gold/20 rounded-lg p-3 flex items-start gap-3 cursor-pointer hover:bg-charcoal-dark/80 transition-colors",
        className
      )}
      onClick={openWardenChat}
    >
      <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
        <Shield className="h-4 w-4 text-gold" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-gold">Warden's Tip</span>
          <Lightbulb className="h-3 w-3 text-gold/60" />
        </div>
        <p className="text-sm text-muted-foreground leading-snug">{tip}</p>
      </div>
    </div>
  );
}

export default WardenTip;
