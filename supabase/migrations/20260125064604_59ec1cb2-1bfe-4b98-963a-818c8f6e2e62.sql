-- =============================================
-- SECURITY HARDENING: Tighten RLS Policies
-- =============================================
-- This migration adds explicit denial of anonymous access to sensitive tables
-- and strengthens existing policies to prevent data leakage if RLS is bypassed.

-- 1. PROFILES TABLE - Add explicit authenticated-only policy
-- Drop and recreate policies to ensure no anonymous access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "authenticated_users_view_own_profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_update_own_profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_insert_own_profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_manage_all_profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. ORDERS TABLE - Explicit authenticated access only
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;

CREATE POLICY "authenticated_users_view_own_orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "authenticated_users_create_orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_manage_orders"
ON public.orders FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. CHECK_INS TABLE - Sensitive health data
DROP POLICY IF EXISTS "Users can view own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can create check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can update own check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Admins can manage check-ins" ON public.check_ins;

CREATE POLICY "authenticated_users_view_own_checkins"
ON public.check_ins FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "authenticated_users_create_checkins"
ON public.check_ins FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_update_own_checkins"
ON public.check_ins FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 4. SUBSCRIPTIONS TABLE - Payment data
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;

CREATE POLICY "authenticated_users_view_own_subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_manage_subscriptions"
ON public.subscriptions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. DIRECT_MESSAGES TABLE - Private communications
DROP POLICY IF EXISTS "Users can view their messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can update read status" ON public.direct_messages;

CREATE POLICY "authenticated_users_view_own_messages"
ON public.direct_messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "authenticated_users_send_messages"
ON public.direct_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "authenticated_users_update_own_messages"
ON public.direct_messages FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- 6. PROGRESS_PHOTOS TABLE - Sensitive body images
DROP POLICY IF EXISTS "Users can view own photos" ON public.progress_photos;
DROP POLICY IF EXISTS "Users can upload photos" ON public.progress_photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON public.progress_photos;
DROP POLICY IF EXISTS "Admins can view all photos" ON public.progress_photos;

CREATE POLICY "authenticated_users_view_own_photos"
ON public.progress_photos FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "authenticated_users_upload_photos"
ON public.progress_photos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_delete_own_photos"
ON public.progress_photos FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_update_own_photos"
ON public.progress_photos FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. DISCIPLINE_JOURNALS TABLE - Private journal entries
DROP POLICY IF EXISTS "Users can view own journals" ON public.discipline_journals;
DROP POLICY IF EXISTS "Users can create journals" ON public.discipline_journals;
DROP POLICY IF EXISTS "Users can update own journals" ON public.discipline_journals;

CREATE POLICY "authenticated_users_view_own_journals"
ON public.discipline_journals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_create_journals"
ON public.discipline_journals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_update_own_journals"
ON public.discipline_journals FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. DAILY_DEVOTIONALS TABLE - Personal faith data
DROP POLICY IF EXISTS "Users can view own devotionals" ON public.daily_devotionals;
DROP POLICY IF EXISTS "Admins can manage devotionals" ON public.daily_devotionals;

CREATE POLICY "authenticated_users_view_own_devotionals"
ON public.daily_devotionals FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_manage_devotionals"
ON public.daily_devotionals FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. WARDEN_CONVERSATIONS TABLE - AI conversation history
DROP POLICY IF EXISTS "Users can view own conversations" ON public.warden_conversations;
DROP POLICY IF EXISTS "Users can manage own conversations" ON public.warden_conversations;

CREATE POLICY "authenticated_users_view_own_warden_convos"
ON public.warden_conversations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_manage_own_warden_convos"
ON public.warden_conversations FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 10. CHAT_LEADS TABLE - Tighten to prevent scraping
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.chat_leads;
DROP POLICY IF EXISTS "Users can view own leads" ON public.chat_leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.chat_leads;

-- Allow anonymous/authenticated insert for lead capture (this is intentional for the sales chat)
CREATE POLICY "anyone_can_insert_leads"
ON public.chat_leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view leads (no user self-view to prevent enumeration)
CREATE POLICY "admins_view_all_leads"
ON public.chat_leads FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update/delete leads
CREATE POLICY "admins_manage_leads"
ON public.chat_leads FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_delete_leads"
ON public.chat_leads FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));