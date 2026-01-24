-- Add discipline template preference to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS discipline_template_id UUID REFERENCES discipline_templates(id) ON DELETE SET NULL;