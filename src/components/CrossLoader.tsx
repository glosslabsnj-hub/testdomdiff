import { cn } from "@/lib/utils";

interface CrossLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const CrossLoader = ({ size = "md", className, text }: CrossLoaderProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Pulsing glow behind cross */}
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
        
        {/* Rotating cross */}
        <div className="absolute inset-0 animate-spin-slow">
          {/* Vertical bar */}
          <div 
            className="absolute left-1/2 top-[10%] -translate-x-1/2 w-[18%] h-[80%] bg-gradient-to-b from-primary via-primary to-gold-dark rounded-sm"
            style={{
              boxShadow: '0 0 12px hsl(45 85% 55% / 0.5)',
            }}
          />
          {/* Horizontal bar */}
          <div 
            className="absolute top-[28%] left-[15%] w-[70%] h-[18%] bg-gradient-to-r from-gold-dark via-primary to-gold-dark rounded-sm"
            style={{
              boxShadow: '0 0 12px hsl(45 85% 55% / 0.5)',
            }}
          />
        </div>
        
        {/* Static outer ring */}
        <div className="absolute inset-0 border-2 border-primary/30 rounded-full" />
      </div>
      
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse font-medium uppercase tracking-widest">
          {text}
        </p>
      )}
    </div>
  );
};

export default CrossLoader;
