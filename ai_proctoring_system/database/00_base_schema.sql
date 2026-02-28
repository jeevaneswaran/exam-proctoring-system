-- Create Profiles Table (extends Auth)
create table profiles (
  id uuid references auth.users not null,
  email text,
  role text check (role in ('admin', 'teacher', 'student')),
  is_approved boolean default false,
  primary key (id)
);

-- RLS for Profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- TRIGGER: Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, is_approved)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'role',
    case 
      when new.raw_user_meta_data->>'role' = 'student' then true 
      else false 
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Study Materials Table
create table study_materials (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  file_url text not null,
  teacher_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Exams Table
create table exams (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  duration_minutes integer,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Questions Table
create table questions (
  id uuid default uuid_generate_v4() primary key,
  exam_id uuid references exams(id) on delete cascade,
  text text not null,
  options jsonb not null, -- Array of strings
  correct_option text not null,
  marks integer default 1
);

-- Results Table
create table results (
  id uuid default uuid_generate_v4() primary key,
  exam_id uuid references exams(id),
  student_id uuid references profiles(id),
  score integer,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Violation Logs Table
create table violation_logs (
  id uuid default uuid_generate_v4() primary key,
  exam_id uuid references exams(id),
  student_id uuid references profiles(id),
  violation_type text not null, -- 'phone', 'book', 'face_missing', 'multiple_faces'
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  snapshot_url text -- Optional: URL to image in storage
);

-- RLS Policies for sensitive tables
alter table violation_logs enable row level security;

create policy "Teachers and Admins can view logs"
  on violation_logs for select
  using ( 
    auth.uid() in (
      select id from profiles where role in ('teacher', 'admin')
    )
    or auth.uid() = student_id 
  );

create policy "Students can insert logs (system generated)"
  on violation_logs for insert
  with check ( auth.uid() = student_id );
