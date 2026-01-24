-- Create storage bucket for program videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('program-videos', 'program-videos', true);

-- Allow authenticated users to view program videos
CREATE POLICY "Anyone can view program videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'program-videos');

-- Allow admins to upload program videos
CREATE POLICY "Admins can upload program videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'program-videos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update program videos
CREATE POLICY "Admins can update program videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'program-videos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete program videos
CREATE POLICY "Admins can delete program videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'program-videos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);