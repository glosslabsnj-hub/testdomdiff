-- Create routine_substeps table for admin-defined default sub-steps
CREATE TABLE public.routine_substeps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.discipline_templates(id) ON DELETE CASCADE,
  routine_index INTEGER NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 0,
  action_text TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_routine_substeps table for user customizations
CREATE TABLE public.user_routine_substeps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id UUID NOT NULL REFERENCES public.discipline_templates(id) ON DELETE CASCADE,
  routine_index INTEGER NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 0,
  action_text TEXT NOT NULL,
  is_override BOOLEAN NOT NULL DEFAULT false,
  original_substep_id UUID REFERENCES public.routine_substeps(id) ON DELETE SET NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_substep_completions table for tracking sub-step progress
CREATE TABLE public.user_substep_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  substep_id UUID REFERENCES public.routine_substeps(id) ON DELETE CASCADE,
  user_substep_id UUID REFERENCES public.user_routine_substeps(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT chk_substep_reference CHECK (
    (substep_id IS NOT NULL AND user_substep_id IS NULL) OR
    (substep_id IS NULL AND user_substep_id IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX idx_routine_substeps_template ON public.routine_substeps(template_id, routine_index);
CREATE INDEX idx_user_routine_substeps_user ON public.user_routine_substeps(user_id, template_id);
CREATE INDEX idx_user_substep_completions_user_date ON public.user_substep_completions(user_id, completion_date);

-- Enable RLS
ALTER TABLE public.routine_substeps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_routine_substeps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_substep_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for routine_substeps (admin-defined, everyone can read)
CREATE POLICY "Anyone can view routine substeps"
ON public.routine_substeps FOR SELECT
USING (true);

CREATE POLICY "Admins can manage routine substeps"
ON public.routine_substeps FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for user_routine_substeps
CREATE POLICY "Users can view their own substep customizations"
ON public.user_routine_substeps FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own substep customizations"
ON public.user_routine_substeps FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own substep customizations"
ON public.user_routine_substeps FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own substep customizations"
ON public.user_routine_substeps FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for user_substep_completions
CREATE POLICY "Users can view their own substep completions"
ON public.user_substep_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own substep completions"
ON public.user_substep_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own substep completions"
ON public.user_substep_completions FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_routine_substeps_updated_at
BEFORE UPDATE ON public.routine_substeps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_routine_substeps_updated_at
BEFORE UPDATE ON public.user_routine_substeps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();