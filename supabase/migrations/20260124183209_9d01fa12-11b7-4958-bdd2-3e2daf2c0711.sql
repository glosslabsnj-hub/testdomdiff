-- Create user_custom_routines table for personal schedule items
CREATE TABLE public.user_custom_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  routine_type TEXT NOT NULL CHECK (routine_type IN ('morning', 'evening')),
  time_slot TEXT NOT NULL,
  action_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_custom_routines ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own custom routines
CREATE POLICY "Users can view their own custom routines"
ON public.user_custom_routines
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom routines"
ON public.user_custom_routines
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom routines"
ON public.user_custom_routines
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom routines"
ON public.user_custom_routines
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_custom_routines_updated_at
BEFORE UPDATE ON public.user_custom_routines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add orientation_dismissed column to profiles
ALTER TABLE public.profiles
ADD COLUMN orientation_dismissed BOOLEAN DEFAULT false;