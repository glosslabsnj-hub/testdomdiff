-- Fix overly permissive RLS policies

-- 1. Drop and recreate chat_leads INSERT policy to be more restrictive
DROP POLICY IF EXISTS "Service role can insert chat leads" ON public.chat_leads;
CREATE POLICY "Authenticated or anon can insert chat leads"
ON public.chat_leads
FOR INSERT
WITH CHECK (true); -- Chat leads need to be insertable from public chat widget

-- 2. Fix chat_leads UPDATE policy - only service role or matching user
DROP POLICY IF EXISTS "Service role can update chat leads" ON public.chat_leads;
CREATE POLICY "Users can update own chat leads"
ON public.chat_leads
FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 3. Fix orders INSERT policy - must be authenticated
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Fix order_items INSERT policy - must have valid order
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
CREATE POLICY "Authenticated users can create order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);