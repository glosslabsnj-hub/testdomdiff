import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
          dark: "hsl(var(--gold-dark))",
          muted: "hsl(var(--gold-muted))",
        },
        copper: {
          DEFAULT: "hsl(var(--copper, 25 85% 45%))",
          light: "hsl(var(--copper-light, 28 80% 55%))",
          dark: "hsl(var(--copper-dark, 22 75% 35%))",
        },
        crimson: {
          DEFAULT: "hsl(var(--crimson))",
          light: "hsl(var(--crimson-light))",
          dark: "hsl(var(--crimson-dark))",
        },
        steel: {
          DEFAULT: "hsl(var(--steel))",
          light: "hsl(var(--steel-light))",
          dark: "hsl(var(--steel-dark))",
        },
        concrete: "hsl(var(--concrete))",
        charcoal: {
          DEFAULT: "hsl(var(--charcoal))",
          light: "hsl(var(--charcoal-light))",
          dark: "hsl(var(--charcoal-dark))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        locked: {
          DEFAULT: "hsl(var(--locked))",
          foreground: "hsl(var(--locked-foreground))",
        },
      },
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(43 74% 49% / 0.4)" },
          "50%": { boxShadow: "0 0 0 15px hsl(43 74% 49% / 0)" },
        },
        // Jail-themed animations
        "iron-slam": {
          "0%": { transform: "translateY(-20px) scale(0.8)", opacity: "0" },
          "50%": { transform: "translateY(5px) scale(1.1)" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        "check-pop": {
          "0%": { transform: "scale(0)" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
        "bar-slide": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "cell-lock": {
          "0%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "75%": { transform: "rotate(5deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "success-pulse": {
          "0%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.4)" },
          "70%": { boxShadow: "0 0 0 10px hsl(var(--primary) / 0)" },
          "100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0)" },
        },
        // New micro-animations
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-in-bottom": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-up-center": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "heartbeat": {
          "0%, 100%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.1)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.1)" },
          "70%": { transform: "scale(1)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "pulse-gold": "pulse-gold 2s infinite",
        "iron-slam": "iron-slam 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "check-pop": "check-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "bar-slide": "bar-slide 0.3s ease-out forwards",
        "cell-lock": "cell-lock 0.3s ease-in-out",
        "success-pulse": "success-pulse 0.6s ease-out",
        // New animations
        "bounce-in": "bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "slide-in-bottom": "slide-in-bottom 0.3s ease-out forwards",
        "scale-up": "scale-up-center 0.2s ease-out forwards",
        "wiggle": "wiggle 0.5s ease-in-out",
        "shimmer": "shimmer 2s linear infinite",
        "heartbeat": "heartbeat 1.5s ease-in-out",
        "spin-slow": "spin-slow 2s linear infinite",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, hsl(43 74% 49%), hsl(43 74% 35%))",
        "gradient-dark": "linear-gradient(180deg, hsl(0 0% 8%), hsl(0 0% 5%))",
        "gradient-radial": "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
