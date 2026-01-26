-- Create storage bucket for tier walkthrough videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('tier-walkthroughs', 'tier-walkthroughs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can view tier walkthrough videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tier-walkthroughs');

-- Allow authenticated users to upload (admin will handle this)
CREATE POLICY "Authenticated users can upload tier walkthroughs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tier-walkthroughs' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update tier walkthroughs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'tier-walkthroughs' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete tier walkthroughs"
ON storage.objects FOR DELETE
USING (bucket_id = 'tier-walkthroughs' AND auth.role() = 'authenticated');

-- Add walkthrough_video_url to program_welcome_videos if not exists
ALTER TABLE public.program_welcome_videos 
ADD COLUMN IF NOT EXISTS walkthrough_video_url TEXT;