-- Add is_approved column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- Update existing profiles (optional, usually default is FALSE)
-- UPDATE profiles SET is_approved = TRUE WHERE role = 'admin';
-- UPDATE profiles SET is_approved = TRUE WHERE role = 'teacher'; -- If you want to auto-approve existing teachers
