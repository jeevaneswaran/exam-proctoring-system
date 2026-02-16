-- Run ONLY this part if you already created the tables

-- 1. Create the function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger to call the function
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
