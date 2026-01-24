-- Drop the old unique constraint on week_number (now we need multiple weeks per number across tracks)
ALTER TABLE public.program_weeks DROP CONSTRAINT IF EXISTS program_weeks_week_number_key;

-- Create a new unique constraint that allows same week_number across different tracks
CREATE UNIQUE INDEX IF NOT EXISTS program_weeks_track_week_unique ON public.program_weeks(track_id, week_number);