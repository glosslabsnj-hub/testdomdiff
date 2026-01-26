-- Create table for persisting user week plans
CREATE TABLE public.user_week_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_number INTEGER NOT NULL,
  plan_data JSONB NOT NULL DEFAULT '{}',
  generated_from_intake BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_number)
);

-- Enable RLS
ALTER TABLE public.user_week_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own plans
CREATE POLICY "Users can view their own week plans"
ON public.user_week_plans
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own plans
CREATE POLICY "Users can create their own week plans"
ON public.user_week_plans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own plans
CREATE POLICY "Users can update their own week plans"
ON public.user_week_plans
FOR UPDATE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_user_week_plans_updated_at
BEFORE UPDATE ON public.user_week_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();