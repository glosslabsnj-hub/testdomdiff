-- Create coaching_sessions table for tracking Dom's sessions with clients
CREATE TABLE public.coaching_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  session_type TEXT NOT NULL DEFAULT 'weekly_checkin',
  notes TEXT,
  notes_visible_to_client BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coaching_goals table for tracking client goals
CREATE TABLE public.coaching_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  progress_pct INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coaching_action_items table for tasks assigned to clients
CREATE TABLE public.coaching_action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  session_id UUID REFERENCES public.coaching_sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_action_items ENABLE ROW LEVEL SECURITY;

-- RLS for coaching_sessions
CREATE POLICY "Admins can manage all coaching sessions"
  ON public.coaching_sessions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their own sessions"
  ON public.coaching_sessions FOR SELECT
  USING (auth.uid() = client_id);

-- RLS for coaching_goals
CREATE POLICY "Admins can manage all coaching goals"
  ON public.coaching_goals FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their own goals"
  ON public.coaching_goals FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can update their own goals"
  ON public.coaching_goals FOR UPDATE
  USING (auth.uid() = client_id);

-- RLS for coaching_action_items
CREATE POLICY "Admins can manage all action items"
  ON public.coaching_action_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their own action items"
  ON public.coaching_action_items FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can update their own action items"
  ON public.coaching_action_items FOR UPDATE
  USING (auth.uid() = client_id);

-- Create updated_at triggers
CREATE TRIGGER update_coaching_sessions_updated_at
  BEFORE UPDATE ON public.coaching_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaching_goals_updated_at
  BEFORE UPDATE ON public.coaching_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaching_action_items_updated_at
  BEFORE UPDATE ON public.coaching_action_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();