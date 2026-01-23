-- Add INSERT policy for users to create their own subscription (for dev mode testing)
-- In production, Stripe webhooks will use service_role to create subscriptions
CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);