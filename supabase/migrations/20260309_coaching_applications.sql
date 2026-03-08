-- Coaching application system
CREATE TABLE IF NOT EXISTS public.coaching_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'enrolled')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  instagram TEXT,
  age INTEGER,
  goals TEXT NOT NULL,
  experience TEXT NOT NULL,
  training_preference TEXT NOT NULL CHECK (training_preference IN ('in-person', 'online', 'hybrid')),
  location TEXT,
  why_coaching TEXT NOT NULL,
  commitment_level TEXT NOT NULL CHECK (commitment_level IN ('all-in', 'serious', 'exploring')),
  current_workout TEXT,
  injuries_limitations TEXT,
  budget_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  admin_notes TEXT
);

ALTER TABLE public.coaching_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own applications"
  ON public.coaching_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own applications"
  ON public.coaching_applications FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Service role manages applications"
  ON public.coaching_applications FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX idx_coaching_applications_status ON public.coaching_applications(status);
CREATE INDEX idx_coaching_applications_user ON public.coaching_applications(user_id);
