-- Add performance indexes for discipline tracking
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON public.habit_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_discipline_journals_user_date ON public.discipline_journals(user_id, journal_date);