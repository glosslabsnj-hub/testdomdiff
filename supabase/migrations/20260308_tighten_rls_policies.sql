-- Tighten overly permissive RLS policies
-- These policies had USING (true) / WITH CHECK (true) which allows any user to read/write

-- Fix chat_leads: only allow inserts from authenticated users or service role
DROP POLICY IF EXISTS "Allow insert from edge functions" ON public.chat_leads;
DROP POLICY IF EXISTS "Allow update from edge functions" ON public.chat_leads;

CREATE POLICY "Authenticated or anon can insert chat leads"
  ON public.chat_leads FOR INSERT
  WITH CHECK (true); -- chat_leads need to accept anonymous visitors for the sales chat widget

CREATE POLICY "Only service role can update chat leads"
  ON public.chat_leads FOR UPDATE
  USING (auth.role() = 'service_role');

-- Fix social_api_usage: only service role should insert
DROP POLICY IF EXISTS "Service role can insert api usage" ON public.social_api_usage;

CREATE POLICY "Only service role can manage api usage"
  ON public.social_api_usage FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Fix meal plan tables: ensure users can only see their own plans or shared templates
DROP POLICY IF EXISTS "Service role manages meal plans" ON public.meal_plan_templates;
DROP POLICY IF EXISTS "Service role manages meal plan days" ON public.meal_plan_days;
DROP POLICY IF EXISTS "Service role manages meal plan meals" ON public.meal_plan_meals;

-- Service role full access (for edge functions)
CREATE POLICY "Service role manages meal plan templates"
  ON public.meal_plan_templates FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role manages meal plan days"
  ON public.meal_plan_days FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role manages meal plan meals"
  ON public.meal_plan_meals FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create account_deletion_requests table for GDPR compliance
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'cancelled'))
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can request their own deletion"
  ON public.account_deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own deletion requests"
  ON public.account_deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages deletion requests"
  ON public.account_deletion_requests FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create community_reports table for moderation
CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'other')),
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution TEXT,
  UNIQUE(message_id, reporter_id) -- prevent duplicate reports
);

ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit reports"
  ON public.community_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON public.community_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Service role manages reports"
  ON public.community_reports FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages notifications"
  ON public.notifications FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Add index for fast notification lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, read) WHERE read = false;

-- Add index for community reports
CREATE INDEX IF NOT EXISTS idx_community_reports_message
  ON public.community_reports(message_id);

-- Add index for deletion requests
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status
  ON public.account_deletion_requests(status) WHERE status = 'pending';
