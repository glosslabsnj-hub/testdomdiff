-- Referral system
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referral_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id),
  referred_user_id UUID NOT NULL REFERENCES auth.users(id),
  referred_plan TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'credited')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  credited_at TIMESTAMPTZ,
  UNIQUE(referrer_id, referred_user_id)
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_completions ENABLE ROW LEVEL SECURITY;

-- Users can read their own referral code
CREATE POLICY "Users can read own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

-- Service role manages referral codes
CREATE POLICY "Service role manages referral codes"
  ON public.referral_codes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Users can read their own referral completions
CREATE POLICY "Users can read own referral completions"
  ON public.referral_completions FOR SELECT
  USING (auth.uid() = referrer_id);

-- Service role manages referral completions
CREATE POLICY "Service role manages referral completions"
  ON public.referral_completions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Auto-generate referral code when subscription is created
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.user_id, UPPER(SUBSTR(MD5(NEW.user_id::text || NOW()::text), 1, 8)))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_generate_referral_code
  AFTER INSERT ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- RPC to extend a user's subscription by 30 days (used by referral webhook)
CREATE OR REPLACE FUNCTION public.extend_subscription_30_days(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.subscriptions
  SET expires_at = COALESCE(expires_at, now()) + interval '30 days'
  WHERE user_id = target_user_id
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
