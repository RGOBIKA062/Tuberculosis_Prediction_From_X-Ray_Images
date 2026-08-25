CREATE POLICY "xrays_insert_own" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'xrays' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "xrays_select_own" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'xrays' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "xrays_delete_own" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'xrays' AND auth.uid()::text = (storage.foldername(name))[1]);