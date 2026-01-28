-- Add premium coaching fields to program_template_exercises if not already present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_template_exercises' AND column_name = 'coach_notes') THEN
    ALTER TABLE program_template_exercises ADD COLUMN coach_notes text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_template_exercises' AND column_name = 'scaling_options') THEN
    ALTER TABLE program_template_exercises ADD COLUMN scaling_options text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_template_exercises' AND column_name = 'progression_notes') THEN
    ALTER TABLE program_template_exercises ADD COLUMN progression_notes text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_template_exercises' AND column_name = 'instructions') THEN
    ALTER TABLE program_template_exercises ADD COLUMN instructions text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_template_exercises' AND column_name = 'form_tips') THEN
    ALTER TABLE program_template_exercises ADD COLUMN form_tips text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'program_template_exercises' AND column_name = 'video_url') THEN
    ALTER TABLE program_template_exercises ADD COLUMN video_url text;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN program_template_exercises.coach_notes IS 'Premium coaching notes for exercise execution';
COMMENT ON COLUMN program_template_exercises.scaling_options IS 'Alternative exercise options for different ability levels';
COMMENT ON COLUMN program_template_exercises.progression_notes IS 'Notes on how to progress this exercise over time';