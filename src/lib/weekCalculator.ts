import { PROGRAM_WEEKS } from "./constants";

/**
 * Calculates the current week number based on subscription start date.
 * 
 * @param subscriptionCreatedAt - The ISO string date when the subscription was created
 * @returns Week number clamped between 1 and PROGRAM_WEEKS (12)
 */
export function calculateCurrentWeek(subscriptionCreatedAt: string | null | undefined): number {
  if (!subscriptionCreatedAt) return 1;

  try {
    const startDate = new Date(subscriptionCreatedAt);
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diffInMs = now.getTime() - startDate.getTime();
    
    // Convert to days
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    // Calculate week number (week 1 starts on day 0)
    const weekNumber = Math.floor(diffInDays / 7) + 1;
    
    // Clamp between 1 and PROGRAM_WEEKS
    return Math.min(Math.max(weekNumber, 1), PROGRAM_WEEKS);
  } catch {
    return 1;
  }
}

/**
 * Gets the day of the current week (0-6, where 0 is the first day of the week)
 */
export function getCurrentDayOfWeek(subscriptionCreatedAt: string | null | undefined): number {
  if (!subscriptionCreatedAt) return 0;

  try {
    const startDate = new Date(subscriptionCreatedAt);
    const now = new Date();
    
    const diffInMs = now.getTime() - startDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    return diffInDays % 7;
  } catch {
    return 0;
  }
}
