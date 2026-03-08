-- Grandfather existing transformation subscribers with lifetime access
-- Sets their expires_at to 2099-12-31 so they keep access under new logic
UPDATE public.subscriptions
SET expires_at = '2099-12-31T23:59:59Z'
WHERE plan_type = 'transformation'
  AND status = 'active'
  AND expires_at IS NULL;
