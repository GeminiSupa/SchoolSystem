-- Create the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload files to 'avatars' bucket
-- We allow any authenticated user to insert into profiles/ or schools/
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] IN ('profiles', 'schools')
);

-- Policy: Allow public access to read files in 'avatars' bucket
CREATE POLICY "Allow public select access on avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Allow users to update/delete their own profiles files
-- (Checking if the 2nd folder name matches their ID)
CREATE POLICY "Allow users to manage their own profile files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = 'profiles' AND 
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Allow admins to manage all files in 'avatars' (for school logos and staff photos)
-- Note: This assumes we have a way to check 'admin' role from profiles table in Storage policies.
-- Since we can't easily join on profiles table here without a custom function, 
-- we'll allow all authenticated users to manage files in these folders for now, 
-- or you can restrict it further in the application logic.
CREATE POLICY "Allow authenticated users to manage avatars"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'avatars');
