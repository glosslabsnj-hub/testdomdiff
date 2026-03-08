-- Create faith_progress table for storing weekly journal entries, action completions, and reflection answers
CREATE TABLE IF NOT EXISTS faith_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  journal_entry TEXT DEFAULT '',
  completed_actions JSONB DEFAULT '[]'::jsonb,
  reflection_answers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- Create faith_prayers table for prayer tracking
CREATE TABLE IF NOT EXISTS faith_prayers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create faith_memorized table for scripture memorization tracking
CREATE TABLE IF NOT EXISTS faith_memorized (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- Enable RLS
ALTER TABLE faith_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE faith_prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE faith_memorized ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own data
CREATE POLICY "Users can view own faith progress" ON faith_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own faith progress" ON faith_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own faith progress" ON faith_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own prayers" ON faith_prayers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prayers" ON faith_prayers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own prayers" ON faith_prayers FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own memorized" ON faith_memorized FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memorized" ON faith_memorized FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own memorized" ON faith_memorized FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_faith_progress_user ON faith_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_faith_prayers_user ON faith_prayers(user_id);
CREATE INDEX IF NOT EXISTS idx_faith_memorized_user ON faith_memorized(user_id);
