-- Add new columns to profiles table
alter table profiles 
add column if not exists first_name text,
add column if not exists last_name text,
add column if not exists dob date;

-- Update the handle_new_user function to include these new fields
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, first_name, last_name, dob)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    (new.raw_user_meta_data->>'dob')::date
  );
  return new;
end;
$$ language plpgsql security definer;
