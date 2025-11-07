/*
  # Setup Storage Bucket and Policies

  ## Overview
  Creates a public storage bucket for study materials (PDFs) with appropriate access policies.

  ## Changes
  1. Creates 'study-materials' bucket
     - Public access enabled
     - 50MB file size limit
     - Only PDF files allowed

  2. Storage Policies
     - Public read access (anyone can view/download files)
     - Public upload access (anyone can upload files)
     - Public delete access (for admin management)
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('study-materials', 'study-materials', true, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view files" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'study-materials');

CREATE POLICY "Public can upload files" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'study-materials');

CREATE POLICY "Public can delete files" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'study-materials');