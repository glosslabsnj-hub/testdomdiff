import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Clamp a percentage value to the valid 0-100 range
 */
export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
