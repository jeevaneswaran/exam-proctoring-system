-- Create a storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up security policies for the avatars bucket
-- 1. Allow public access to view avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 2. Allow anyone (including unauthenticated users during signup) to upload avatars
-- Note: In a strict production env, you might want to restrict this more, but for signup flow it's often needed.
create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

-- 3. Allow users to update their own avatar (if they are logged in)
create policy "Users can update their own avatar"
  on storage.objects for update
  using ( auth.uid() = owner );
