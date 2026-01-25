-- Coaching spots configuration table
CREATE TABLE public.coaching_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_spots INTEGER NOT NULL DEFAULT 10,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert initial configuration
INSERT INTO public.coaching_spots (max_spots) VALUES (10);

-- Enable RLS (read-only for everyone, write for admins only)
ALTER TABLE public.coaching_spots ENABLE ROW LEVEL SECURITY;

-- Anyone can read coaching spots config
CREATE POLICY "Anyone can read coaching spots" 
ON public.coaching_spots 
FOR SELECT 
USING (true);

-- Only admins can update
CREATE POLICY "Admins can update coaching spots" 
ON public.coaching_spots 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Coaching waitlist table
CREATE TABLE public.coaching_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coaching_waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can add themselves to waitlist
CREATE POLICY "Anyone can join waitlist" 
ON public.coaching_waitlist 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view waitlist
CREATE POLICY "Admins can view waitlist" 
ON public.coaching_waitlist 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update waitlist status
CREATE POLICY "Admins can update waitlist" 
ON public.coaching_waitlist 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete from waitlist
CREATE POLICY "Admins can delete from waitlist" 
ON public.coaching_waitlist 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));