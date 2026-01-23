-- Create a table to track chat leads and their interests
CREATE TABLE public.chat_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  first_message TEXT,
  goal TEXT,
  experience_level TEXT,
  pain_points TEXT[],
  interested_program TEXT,
  recommended_program TEXT,
  conversion_action TEXT,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.chat_leads ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role can manage chat leads"
  ON public.chat_leads
  FOR ALL
  USING (auth.role() = 'service_role');

-- Users can view their own leads if logged in
CREATE POLICY "Users can view their own chat leads"
  ON public.chat_leads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow anonymous inserts for non-logged-in users via edge function
CREATE POLICY "Allow insert from edge functions"
  ON public.chat_leads
  FOR INSERT
  WITH CHECK (true);

-- Allow updates from edge functions
CREATE POLICY "Allow update from edge functions"  
  ON public.chat_leads
  FOR UPDATE
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_chat_leads_updated_at
  BEFORE UPDATE ON public.chat_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_chat_leads_session_id ON public.chat_leads(session_id);
CREATE INDEX idx_chat_leads_interested_program ON public.chat_leads(interested_program);