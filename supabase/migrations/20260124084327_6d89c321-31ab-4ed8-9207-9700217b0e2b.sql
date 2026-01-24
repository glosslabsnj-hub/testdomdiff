-- Fix the overly permissive RLS policy on email_notification_logs
-- Drop the permissive policy
DROP POLICY IF EXISTS "System can insert logs" ON public.email_notification_logs;

-- Create a proper policy that allows edge functions to insert via service role
-- Since edge functions use service role key, they bypass RLS anyway
-- For safety, we'll just allow admins to insert
CREATE POLICY "Admins can insert notification logs"
ON public.email_notification_logs FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));