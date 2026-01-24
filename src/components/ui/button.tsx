import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-gradient-to-r from-crimson to-crimson-dark text-white font-bold hover:scale-105 shadow-[0_4px_25px_-5px_hsl(0_72%_45%_/_0.45)] hover:shadow-[0_8px_40px_-5px_hsl(0_72%_45%_/_0.6)]",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Dom Different custom variants
        gold: "bg-gradient-to-r from-gold to-gold-dark text-primary-foreground font-bold uppercase tracking-widest hover:scale-105 shadow-[0_4px_30px_-5px_hsl(28_90%_48%_/_0.4)] hover:shadow-[0_6px_40px_-5px_hsl(28_90%_48%_/_0.5)]",
        goldOutline: "border-2 border-primary text-primary font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground",
        dark: "bg-charcoal-light border border-border text-foreground font-bold uppercase tracking-widest hover:bg-charcoal hover:border-primary",
        hero: "bg-gradient-to-r from-gold to-gold-dark text-primary-foreground font-bold uppercase tracking-[0.2em] text-base hover:scale-105 shadow-[0_4px_30px_-5px_hsl(28_90%_48%_/_0.4)] hover:shadow-[0_8px_50px_-5px_hsl(28_90%_48%_/_0.6)]",
        heroOutline: "border-2 border-primary/80 text-primary font-bold uppercase tracking-[0.15em] hover:bg-primary/10 hover:border-primary",
        heroGhost: "text-foreground/80 font-semibold uppercase tracking-wider hover:text-primary underline-offset-4 hover:underline",
        // Crimson variants for warnings and destructive actions
        crimson: "bg-gradient-to-r from-crimson to-crimson-dark text-white font-bold uppercase tracking-widest hover:scale-105 shadow-[0_4px_25px_-5px_hsl(0_72%_45%_/_0.45)] hover:shadow-[0_8px_40px_-5px_hsl(0_72%_45%_/_0.6)]",
        crimsonOutline: "border-2 border-crimson text-crimson font-bold uppercase tracking-widest hover:bg-crimson hover:text-white",
        // Steel variants for dashboard navigation
        steel: "bg-gradient-to-b from-steel to-steel-dark text-foreground border border-steel-light/30 font-medium hover:border-primary/40 shadow-[inset_0_1px_0_hsl(220_10%_30%_/_0.3)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-md px-10 text-base",
        icon: "h-10 w-10",
        hero: "h-14 px-10 py-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
