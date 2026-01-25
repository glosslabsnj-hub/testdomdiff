-- Remove duplicate chat_leads INSERT policy (keep the more specific one)
DROP POLICY IF EXISTS "anyone_can_insert_leads" ON public.chat_leads;

-- The remaining policies with USING(true) are intentionally public content:
-- - coaching_spots: Public read for displaying available spots
-- - community_messages: Authenticated users can view messages (read-only is fine)
-- - program_day_exercises: Authenticated users view workout content
-- - program_day_workouts: Authenticated users view workout content
-- - program_weeks: Authenticated users view program structure
-- - program_welcome_videos: Public read for onboarding
-- - routine_substeps: Public read for discipline routines

-- These are all SELECT policies for content that should be readable, which is fine.