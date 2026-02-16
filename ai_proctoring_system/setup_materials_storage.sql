-- Create a storage bucket for study materials
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

-- Set up security policies for the materials bucket
-- 1. Allow public access to view/download materials
create policy "Materials are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'materials' );

-- 2. Allow authenticated teachers to upload materials
create policy "Teachers can upload materials"
  on storage.objects for insert
  with check ( 
    bucket_id = 'materials' AND 
    auth.uid() in (select id from profiles where role = 'teacher')
  );

-- 3. Allow teachers to delete their own uploaded materials
create policy "Teachers can delete their own materials"
  on storage.objects for delete
  using ( 
    bucket_id = 'materials' AND 
    auth.uid() = owner
  );

-- RLS for study_materials table (Table already created in supabase_schema.sql)
alter table study_materials enable row level security;

-- Drop existing policies if they exist to avoid errors
drop policy if exists "Anyone can view study materials" on study_materials;
drop policy if exists "Teachers can insert study materials" on study_materials;
drop policy if exists "Teachers can delete their own study materials" on study_materials;

-- Create policies for study_materials table
create policy "Anyone can view study materials"
  on study_materials for select
  using ( true );

create policy "Teachers can insert study materials"
  on study_materials for insert
  with check ( auth.uid() = teacher_id );

create policy "Teachers can delete their own study materials"
  on study_materials for delete
  using ( auth.uid() = teacher_id );
