-- Table for tracking user meal swaps (which meals users swap out)
CREATE TABLE public.user_meal_swaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_meal_id UUID NOT NULL REFERENCES public.meal_plan_meals(id) ON DELETE CASCADE,
  swapped_meal_id UUID NOT NULL REFERENCES public.meal_plan_meals(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  swap_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking meal feedback (likes, skips, ratings)
CREATE TABLE public.meal_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meal_id UUID NOT NULL REFERENCES public.meal_plan_meals(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('like', 'skip', 'made')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  feedback_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, meal_id, feedback_type, feedback_date)
);

-- Enable RLS
ALTER TABLE public.user_meal_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_meal_swaps
CREATE POLICY "Users can view their own meal swaps"
  ON public.user_meal_swaps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal swaps"
  ON public.user_meal_swaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal swaps"
  ON public.user_meal_swaps FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all meal swaps"
  ON public.user_meal_swaps FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for meal_feedback
CREATE POLICY "Users can view their own meal feedback"
  ON public.meal_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal feedback"
  ON public.meal_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal feedback"
  ON public.meal_feedback FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal feedback"
  ON public.meal_feedback FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all meal feedback"
  ON public.meal_feedback FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_user_meal_swaps_user_id ON public.user_meal_swaps(user_id);
CREATE INDEX idx_user_meal_swaps_original_meal ON public.user_meal_swaps(original_meal_id);
CREATE INDEX idx_meal_feedback_user_id ON public.meal_feedback(user_id);
CREATE INDEX idx_meal_feedback_meal_id ON public.meal_feedback(meal_id);
CREATE INDEX idx_meal_feedback_type ON public.meal_feedback(feedback_type);