-- ==============================================================================
-- AI PROCTORING SYSTEM - FULL SUPABASE SQL SCHEMA
-- ==============================================================================
-- Run this entire script in your Supabase SQL Editor to recreate your database 
-- from scratch, including all tables, relationships, RLS policies, and triggers.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Extends Supabase Auth)
-- ------------------------------------------------------------------------------
create table if not exists profiles (
  id uuid references auth.users not null,
  email text,
  role text check (role in ('admin', 'teacher', 'student')),
  is_approved boolean default false,
  first_name text,
  last_name text,
  dob date,
  contact_number text,
  address text,
  profile_picture text,
  primary key (id)
);

alter table profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;

create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- TRIGGER: Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, email, role, is_approved, first_name, last_name, dob, contact_number, address, profile_picture
  )
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'role',
    case when new.raw_user_meta_data->>'role' = 'student' then true else false end,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    (new.raw_user_meta_data->>'dob')::date,
    new.raw_user_meta_data->>'contact_number',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'profile_picture'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. STUDY MATERIALS & BUCKETS
-- ------------------------------------------------------------------------------
create table if not exists study_materials (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  file_url text not null,
  teacher_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table study_materials enable row level security;
drop policy if exists "Everyone can view study materials" on study_materials;
drop policy if exists "Teachers can insert study materials" on study_materials;
create policy "Everyone can view study materials" on study_materials for select using (true);
create policy "Teachers can insert study materials" on study_materials for insert with check (
  auth.uid() in (select id from profiles where role = 'teacher')
);

-- Setup Storage Bucket
insert into storage.buckets (id, name, public) values ('materials', 'materials', true) on conflict (id) do nothing;

drop policy if exists "Materials Public Access" on storage.objects;
drop policy if exists "Teachers can upload materials" on storage.objects;
drop policy if exists "Teachers can delete materials" on storage.objects;

create policy "Materials Public Access" on storage.objects for select using ( bucket_id = 'materials' );
create policy "Teachers can upload materials" on storage.objects for insert with check (
  bucket_id = 'materials' and (auth.role() = 'authenticated') and (select role from profiles where id = auth.uid()) = 'teacher'
);
create policy "Teachers can delete materials" on storage.objects for delete using (
  bucket_id = 'materials' and (auth.role() = 'authenticated') and (select role from profiles where id = auth.uid()) = 'teacher'
);

-- ------------------------------------------------------------------------------
-- 3. EXAMS, QUESTIONS, & RESULTS
-- ------------------------------------------------------------------------------
create table if not exists exams (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  duration_minutes integer,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists questions (
  id uuid default uuid_generate_v4() primary key,
  exam_id uuid references exams(id) on delete cascade,
  text text not null,
  options jsonb not null, 
  correct_option text not null,
  marks integer default 1
);

create table if not exists results (
  id uuid default uuid_generate_v4() primary key,
  exam_id uuid references exams(id),
  student_id uuid references profiles(id),
  score integer,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 4. VIOLATION LOGS (Proctoring)
-- ------------------------------------------------------------------------------
create table if not exists violation_logs (
  id uuid default uuid_generate_v4() primary key,
  exam_id uuid references exams(id),
  student_id uuid references profiles(id),
  violation_type text not null,
  risk_score integer default 0,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  snapshot_url text
);

alter table violation_logs enable row level security;
drop policy if exists "Teachers and Admins can view logs" on violation_logs;
drop policy if exists "Students can insert logs (system generated)" on violation_logs;

create policy "Teachers and Admins can view logs" on violation_logs for select using ( 
  auth.uid() in (select id from profiles where role in ('teacher', 'admin')) or auth.uid() = student_id 
);
create policy "Students can insert logs (system generated)" on violation_logs for insert with check ( auth.uid() = student_id );

-- ------------------------------------------------------------------------------
-- 5. EXAM PROGRESS (Auto-save)
-- ------------------------------------------------------------------------------
create table if not exists exam_progress (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id),
  exam_id uuid references exams(id),
  selected_answers jsonb default '{}'::jsonb,
  time_left integer,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, exam_id)
);

alter table exam_progress enable row level security;
drop policy if exists "Students can manage own progress" on exam_progress;
create policy "Students can manage own progress" on exam_progress for all using (auth.uid() = student_id);

-- ------------------------------------------------------------------------------
-- 6. BLOGS, SUPPORT TICKETS, & NOTICES
-- ------------------------------------------------------------------------------
create table if not exists blogs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  image_url text,
  author_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table blogs enable row level security;
drop policy if exists "Everyone can view blogs" on blogs;
drop policy if exists "Teachers can manage their own blogs" on blogs;
create policy "Everyone can view blogs" on blogs for select using (true);
create policy "Teachers can manage their own blogs" on blogs for all using (
  auth.uid() = author_id or auth.uid() in (select id from profiles where role = 'admin')
);

create table if not exists support_tickets (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) not null,
  subject text not null,
  message text not null,
  category text default 'Technical',
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table support_tickets enable row level security;
drop policy if exists "Students can manage their own tickets" on support_tickets;
drop policy if exists "Admins can manage all tickets" on support_tickets;
create policy "Students can manage their own tickets" on support_tickets for all using (auth.uid() = student_id);
create policy "Admins can manage all tickets" on support_tickets for all using (auth.uid() in (select id from profiles where role = 'admin'));

create table if not exists notices (
  id uuid default uuid_generate_v4() primary key,
  teacher_id uuid references profiles(id) not null,
  content text not null,
  importance text default 'info',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table notices enable row level security;
drop policy if exists "Everyone can view notices" on notices;
drop policy if exists "Teachers can manage their own notices" on notices;
create policy "Everyone can view notices" on notices for select using (true);
create policy "Teachers can manage their own notices" on notices for all using (auth.uid() = teacher_id);
