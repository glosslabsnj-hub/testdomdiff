-- Create client_custom_programs table
CREATE TABLE public.client_custom_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_custom_programs ENABLE ROW LEVEL SECURITY;

-- Admin full access policy
CREATE POLICY "Admins manage all programs"
ON public.client_custom_programs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Clients can view their own programs
CREATE POLICY "Clients view own programs"
ON public.client_custom_programs
FOR SELECT
USING (auth.uid() = client_id);

-- Create updated_at trigger
CREATE TRIGGER update_client_custom_programs_updated_at
BEFORE UPDATE ON public.client_custom_programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for client programs (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-programs', 'client-programs', false);

-- Storage RLS: Admins can manage all files
CREATE POLICY "Admins manage client program files"
ON storage.objects
FOR ALL
USING (bucket_id = 'client-programs' AND public.has_role(auth.uid(), 'admin'));

-- Storage RLS: Clients can download from their folder
CREATE POLICY "Clients download own program files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'client-programs' AND auth.uid()::text = (storage.foldername(name))[1]);