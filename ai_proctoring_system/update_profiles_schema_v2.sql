-- Add new columns to profiles table for Student Registration
alter table profiles 
add column if not exists contact_number text,
add column if not exists address text,
add column if not exists profile_picture text;

-- Update the handle_new_user function to include these new fields
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email, 
    role, 
    first_name, 
    last_name, 
    dob,
    contact_number,
    address,
    profile_picture
  )
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'role',
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
