// Centralized constants for the application

// Program durations in days
export const TRANSFORMATION_DURATION_DAYS = 98; // 14 weeks (12 weeks + 2 week buffer)
export const PROGRAM_WEEKS = 12;

// Program goal options - MUST match database program_tracks.goal_match values exactly
export const GOAL_OPTIONS = [
  "Lose fat",
  "Build muscle",
  "Both - lose fat and build muscle",
] as const;

export type GoalOption = typeof GOAL_OPTIONS[number];
