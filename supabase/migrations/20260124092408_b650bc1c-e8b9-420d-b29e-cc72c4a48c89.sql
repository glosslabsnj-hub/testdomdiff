-- Fix overly permissive INSERT policy for community_messages
DROP POLICY IF EXISTS "Users can insert own messages" ON public.community_messages;
CREATE POLICY "Users can insert own messages"
  ON public.community_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND content IS NOT NULL AND LENGTH(TRIM(content)) > 0);

-- Fix overly permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update own messages" ON public.community_messages;
CREATE POLICY "Users can update own messages"
  ON public.community_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND content IS NOT NULL AND LENGTH(TRIM(content)) > 0);