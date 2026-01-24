-- Create community_wins table for TikTok-style posts
CREATE TABLE public.community_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.community_channels(id) ON DELETE CASCADE,
  caption TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create community_wins_likes for tracking likes
CREATE TABLE public.community_wins_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  win_id UUID NOT NULL REFERENCES public.community_wins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(win_id, user_id)
);

-- Create community_wins_comments for comments
CREATE TABLE public.community_wins_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  win_id UUID NOT NULL REFERENCES public.community_wins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_wins_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_wins_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_wins
CREATE POLICY "Authenticated users can view wins"
  ON public.community_wins FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own wins"
  ON public.community_wins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wins"
  ON public.community_wins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wins"
  ON public.community_wins FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for likes
CREATE POLICY "Authenticated users can view likes"
  ON public.community_wins_likes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can like wins"
  ON public.community_wins_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike wins"
  ON public.community_wins_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for comments
CREATE POLICY "Authenticated users can view comments"
  ON public.community_wins_comments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create comments"
  ON public.community_wins_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.community_wins_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for wins media
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-wins', 'community-wins', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload wins media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'community-wins' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view wins media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-wins');

CREATE POLICY "Users can delete their own wins media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'community-wins' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for wins
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_wins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_wins_comments;