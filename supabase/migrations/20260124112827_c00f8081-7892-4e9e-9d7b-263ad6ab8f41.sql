-- Store weekly generated messages from The Warden
CREATE TABLE public.warden_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_number INTEGER NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'weekly_brief', -- 'weekly_brief', 'encouragement', 'challenge'
  message TEXT NOT NULL,
  scripture_reference TEXT,
  scripture_text TEXT,
  focus_area TEXT, -- 'discipline', 'workouts', 'nutrition', 'faith', 'general'
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, week_number, message_type)
);

-- Store chat conversations with the warden
CREATE TABLE public.warden_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Store daily devotionals
CREATE TABLE public.daily_devotionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  devotional_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scripture_reference TEXT NOT NULL,
  scripture_text TEXT NOT NULL,
  message TEXT NOT NULL,
  challenge TEXT NOT NULL,
  prayer_focus TEXT NOT NULL,
  theme TEXT, -- 'perseverance', 'discipline', 'identity', 'strength', 'transformation'
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, devotional_date)
);

-- Scripture library for devotional generation
CREATE TABLE public.scripture_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  theme TEXT NOT NULL, -- 'discipline', 'perseverance', 'identity', 'transformation', 'strength'
  week_min INTEGER DEFAULT 1,
  week_max INTEGER DEFAULT 12,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.warden_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warden_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_devotionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripture_library ENABLE ROW LEVEL SECURITY;

-- Warden messages policies
CREATE POLICY "Users can view their own warden messages"
ON public.warden_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own warden messages"
ON public.warden_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own warden messages"
ON public.warden_messages FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all warden messages"
ON public.warden_messages FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Warden conversations policies
CREATE POLICY "Users can view their own warden conversations"
ON public.warden_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own warden conversations"
ON public.warden_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own warden conversations"
ON public.warden_conversations FOR UPDATE
USING (auth.uid() = user_id);

-- Daily devotionals policies
CREATE POLICY "Users can view their own daily devotionals"
ON public.daily_devotionals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily devotionals"
ON public.daily_devotionals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all daily devotionals"
ON public.daily_devotionals FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Scripture library policies (public read, admin manage)
CREATE POLICY "Anyone can view active scriptures"
ON public.scripture_library FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage scripture library"
ON public.scripture_library FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_warden_messages_updated_at
BEFORE UPDATE ON public.warden_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warden_conversations_updated_at
BEFORE UPDATE ON public.warden_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed scripture library with 50 transformation-focused scriptures
INSERT INTO public.scripture_library (reference, text, theme, week_min, week_max) VALUES
-- DISCIPLINE (weeks 1-4 focus)
('Proverbs 25:28', 'A man without self-control is like a city broken into and left without walls.', 'discipline', 1, 4),
('1 Corinthians 9:27', 'I discipline my body and keep it under control, lest after preaching to others I myself should be disqualified.', 'discipline', 1, 4),
('Proverbs 12:1', 'Whoever loves discipline loves knowledge, but he who hates reproof is stupid.', 'discipline', 1, 4),
('Hebrews 12:11', 'For the moment all discipline seems painful rather than pleasant, but later it yields the peaceful fruit of righteousness.', 'discipline', 1, 6),
('Proverbs 13:24', 'Whoever spares the rod hates his son, but he who loves him is diligent to discipline him.', 'discipline', 1, 4),
('1 Timothy 4:7-8', 'Train yourself for godliness; for while bodily training is of some value, godliness is of value in every way.', 'discipline', 1, 12),
('Galatians 5:22-23', 'But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control.', 'discipline', 1, 12),
('2 Timothy 1:7', 'For God gave us a spirit not of fear but of power and love and self-control.', 'discipline', 1, 6),
('Proverbs 16:32', 'Whoever is slow to anger is better than the mighty, and he who rules his spirit than he who takes a city.', 'discipline', 3, 8),
('Titus 2:11-12', 'For the grace of God has appeared, training us to renounce ungodliness and worldly passions, and to live self-controlled, upright, and godly lives.', 'discipline', 1, 12),

-- PERSEVERANCE (weeks 3-8 focus - the hard middle)
('James 1:2-4', 'Count it all joy, my brothers, when you meet trials of various kinds, for you know that the testing of your faith produces steadfastness.', 'perseverance', 3, 8),
('Romans 5:3-5', 'We rejoice in our sufferings, knowing that suffering produces endurance, and endurance produces character, and character produces hope.', 'perseverance', 4, 10),
('Galatians 6:9', 'And let us not grow weary of doing good, for in due season we will reap, if we do not give up.', 'perseverance', 4, 10),
('Hebrews 12:1-2', 'Let us run with endurance the race that is set before us, looking to Jesus, the founder and perfecter of our faith.', 'perseverance', 3, 12),
('Proverbs 24:10', 'If you faint in the day of adversity, your strength is small.', 'perseverance', 3, 6),
('Isaiah 40:31', 'But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles.', 'perseverance', 4, 12),
('2 Corinthians 4:16-17', 'So we do not lose heart. Though our outer self is wasting away, our inner self is being renewed day by day.', 'perseverance', 5, 10),
('Philippians 3:13-14', 'Forgetting what lies behind and straining forward to what lies ahead, I press on toward the goal.', 'perseverance', 6, 12),
('1 Corinthians 15:58', 'Therefore, my beloved brothers, be steadfast, immovable, always abounding in the work of the Lord.', 'perseverance', 4, 12),
('Romans 8:37', 'No, in all these things we are more than conquerors through him who loved us.', 'perseverance', 6, 12),

-- STRENGTH (weeks 2-12)
('Isaiah 41:10', 'Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you.', 'strength', 2, 12),
('Philippians 4:13', 'I can do all things through him who strengthens me.', 'strength', 1, 12),
('Joshua 1:9', 'Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.', 'strength', 1, 12),
('Ephesians 6:10', 'Finally, be strong in the Lord and in the strength of his might.', 'strength', 3, 12),
('Psalm 18:32-34', 'The God who equipped me with strength and made my way blameless. He made my feet like the feet of a deer.', 'strength', 4, 12),
('Deuteronomy 31:6', 'Be strong and courageous. Do not fear or be in dread of them, for it is the Lord your God who goes with you.', 'strength', 1, 8),
('Nehemiah 8:10', 'The joy of the Lord is your strength.', 'strength', 5, 12),
('Psalm 28:7', 'The Lord is my strength and my shield; in him my heart trusts, and I am helped.', 'strength', 1, 12),
('2 Corinthians 12:9-10', 'My grace is sufficient for you, for my power is made perfect in weakness.', 'strength', 4, 12),
('Psalm 46:1', 'God is our refuge and strength, a very present help in trouble.', 'strength', 1, 12),

-- IDENTITY/TRANSFORMATION (weeks 1-12)
('2 Corinthians 5:17', 'Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.', 'transformation', 1, 12),
('Romans 12:2', 'Do not be conformed to this world, but be transformed by the renewal of your mind.', 'transformation', 1, 12),
('Ephesians 4:22-24', 'Put off your old self, which belongs to your former manner of life and is corrupt... and put on the new self.', 'transformation', 2, 10),
('Colossians 3:9-10', 'You have put off the old self with its practices and have put on the new self, which is being renewed in knowledge.', 'transformation', 3, 12),
('1 Peter 2:9', 'But you are a chosen race, a royal priesthood, a holy nation, a people for his own possession.', 'identity', 6, 12),
('Galatians 2:20', 'I have been crucified with Christ. It is no longer I who live, but Christ who lives in me.', 'transformation', 4, 12),
('Jeremiah 29:11', 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.', 'identity', 1, 12),
('Psalm 139:14', 'I praise you, for I am fearfully and wonderfully made. Wonderful are your works; my soul knows it very well.', 'identity', 1, 6),
('Ephesians 2:10', 'For we are his workmanship, created in Christ Jesus for good works, which God prepared beforehand.', 'identity', 8, 12),
('Romans 8:28', 'And we know that for those who love God all things work together for good.', 'transformation', 1, 12),

-- FINISHING STRONG (weeks 9-12)
('2 Timothy 4:7', 'I have fought the good fight, I have finished the race, I have kept the faith.', 'perseverance', 9, 12),
('1 Corinthians 9:24', 'Do you not know that in a race all the runners run, but only one receives the prize? So run that you may obtain it.', 'perseverance', 9, 12),
('Revelation 2:10', 'Be faithful unto death, and I will give you the crown of life.', 'perseverance', 10, 12),
('Matthew 24:13', 'But the one who endures to the end will be saved.', 'perseverance', 10, 12),
('Hebrews 10:36', 'For you have need of endurance, so that when you have done the will of God you may receive what is promised.', 'perseverance', 8, 12),
('Proverbs 4:18', 'But the path of the righteous is like the light of dawn, which shines brighter and brighter until full day.', 'transformation', 10, 12),
('Isaiah 43:18-19', 'Remember not the former things, nor consider the things of old. Behold, I am doing a new thing.', 'transformation', 11, 12),
('Philippians 1:6', 'He who began a good work in you will bring it to completion at the day of Jesus Christ.', 'transformation', 10, 12),
('Romans 6:4', 'We were buried therefore with him by baptism into death, in order that, just as Christ was raised, we too might walk in newness of life.', 'transformation', 11, 12),
('Ezekiel 36:26', 'And I will give you a new heart, and a new spirit I will put within you.', 'transformation', 12, 12);