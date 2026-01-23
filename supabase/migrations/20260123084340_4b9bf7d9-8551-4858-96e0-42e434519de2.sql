-- =============================================
-- PHASE 1: SECURITY FIXES
-- =============================================

-- Fix chat_leads: Remove overly permissive INSERT/UPDATE policies
DROP POLICY IF EXISTS "Allow insert from edge functions" ON public.chat_leads;
DROP POLICY IF EXISTS "Allow update from edge functions" ON public.chat_leads;

-- Create proper restrictive policies for chat_leads (service role only for writes)
CREATE POLICY "Service role can insert chat leads" 
ON public.chat_leads 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update chat leads" 
ON public.chat_leads 
FOR UPDATE 
TO service_role
USING (true);

-- =============================================
-- PHASE 2: CREATE DASHBOARD DATA TABLES
-- =============================================

-- Check-ins table for weekly accountability
CREATE TABLE public.check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  weight DECIMAL(5,1),
  waist DECIMAL(4,1),
  steps_avg INTEGER,
  workouts_completed INTEGER,
  wins TEXT,
  struggles TEXT,
  changes TEXT,
  faith_reflection TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_number)
);

-- Enable RLS on check_ins
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- RLS policies for check_ins
CREATE POLICY "Users can view their own check-ins" 
ON public.check_ins FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins" 
ON public.check_ins FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins" 
ON public.check_ins FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all check-ins" 
ON public.check_ins FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Progress entries table
CREATE TABLE public.progress_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  weight DECIMAL(5,1),
  waist DECIMAL(4,1),
  steps_avg INTEGER,
  workouts INTEGER,
  compliance_pct INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_number)
);

-- Enable RLS on progress_entries
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for progress_entries
CREATE POLICY "Users can view their own progress" 
ON public.progress_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" 
ON public.progress_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.progress_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" 
ON public.progress_entries FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- User checklist table for Start Here items
CREATE TABLE public.user_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS on user_checklist
ALTER TABLE public.user_checklist ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_checklist
CREATE POLICY "Users can view their own checklist" 
ON public.user_checklist FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create checklist items" 
ON public.user_checklist FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their checklist items" 
ON public.user_checklist FOR DELETE 
USING (auth.uid() = user_id);

-- Habit logs table for daily tracking
CREATE TABLE public.habit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,
  log_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, habit_name, log_date)
);

-- Enable RLS on habit_logs
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for habit_logs
CREATE POLICY "Users can view their own habits" 
ON public.habit_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create habit logs" 
ON public.habit_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their habit logs" 
ON public.habit_logs FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their habit logs" 
ON public.habit_logs FOR DELETE 
USING (auth.uid() = user_id);

-- =============================================
-- PHASE 3: CREATE ORDERS SYSTEM
-- =============================================

-- Orders table for merchandise
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for orders
CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all orders" 
ON public.orders FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update orders" 
ON public.orders FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage orders" 
ON public.orders FOR ALL 
TO service_role
USING (true);

-- Order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_items (inherit from orders)
CREATE POLICY "Users can view their order items" 
ON public.order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create order items" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all order items" 
ON public.order_items FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage order items" 
ON public.order_items FOR ALL 
TO service_role
USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_check_ins_updated_at
BEFORE UPDATE ON public.check_ins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_entries_updated_at
BEFORE UPDATE ON public.progress_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();