-- Remove the check constraint that limits day_number to 1-7
-- We need to support 28 days (4 weeks) per nutrition template

ALTER TABLE public.meal_plan_days 
DROP CONSTRAINT IF EXISTS meal_plan_days_day_number_check;

-- Add a new constraint that allows 1-28
ALTER TABLE public.meal_plan_days 
ADD CONSTRAINT meal_plan_days_day_number_check 
CHECK (day_number >= 1 AND day_number <= 28);