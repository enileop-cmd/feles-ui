INSERT INTO storage.buckets (id, name, public) 
VALUES ('archive', 'archive', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public reads archive"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'archive');

CREATE POLICY "Auth users can insert archive"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'archive' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can update archive"
  ON storage.objects FOR UPDATE
  WITH CHECK (bucket_id = 'archive' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can delete archive"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'archive' AND auth.role() = 'authenticated');
