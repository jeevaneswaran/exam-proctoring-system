-- SAFE MIGRATION SCRIPT
-- Run this in your Supabase SQL Editor to add missing features without errors.

-- 1. Add is_approved column to profiles (only if it doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_approved') THEN
        ALTER TABLE profiles ADD COLUMN is_approved boolean DEFAULT false;
    END IF;
END $$;

-- 2. Update the trigger function to handle the new column
-- (CREATE OR REPLACE is safe to run multiple times)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_approved)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'role',
    CASE 
      WHEN new.raw_user_meta_data->>'role' = 'student' THEN true 
      ELSE false 
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Study Materials table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS study_materials (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  teacher_id uuid REFERENCES profiles(id),
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS on Study Materials
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

-- 5. Add RLS policy for Study Materials (only if it doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Everyone can view study materials') THEN
        CREATE POLICY "Everyone can view study materials" ON study_materials FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers can insert study materials') THEN
        CREATE POLICY "Teachers can insert study materials" ON study_materials FOR INSERT WITH CHECK (
            auth.uid() IN (SELECT id FROM profiles WHERE role = 'teacher')
        );
    END IF;
END $$;

-- 6. Setup Storage Bucket (materials)
-- This creates the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Add Storage RLS Policies
-- Allow anyone to read from the 'materials' bucket
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Materials Public Access') THEN
        CREATE POLICY "Materials Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'materials' );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers can upload materials') THEN
        CREATE POLICY "Teachers can upload materials" ON storage.objects FOR INSERT WITH CHECK (
            bucket_id = 'materials' 
            AND (auth.role() = 'authenticated')
            AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers can delete materials') THEN
        CREATE POLICY "Teachers can delete materials" ON storage.objects FOR DELETE USING (
            bucket_id = 'materials' 
            AND (auth.role() = 'authenticated')
            AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
        );
    END IF;
END $$;

-- 8. Create Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  author_id uuid REFERENCES profiles(id),
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Enable RLS on Blogs
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- 10. Add RLS policy for Blogs
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Everyone can view blogs') THEN
        CREATE POLICY "Everyone can view blogs" ON blogs FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers can manage their own blogs') THEN
        CREATE POLICY "Teachers can manage their own blogs" ON blogs FOR ALL USING (
            auth.uid() = author_id 
            OR 
            auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
        );
    END IF;
END $$;

-- 11. Create Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id uuid REFERENCES profiles(id) NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  category text DEFAULT 'Technical',
  status text DEFAULT 'pending',
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Enable RLS on Support Tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- 13. Add RLS policy for Support Tickets
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can manage their own tickets') THEN
        CREATE POLICY "Students can manage their own tickets" ON support_tickets FOR ALL USING (
            auth.uid() = student_id
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all tickets') THEN
        CREATE POLICY "Admins can manage all tickets" ON support_tickets FOR ALL USING (
            auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
        );
    END IF;
END $$;

-- 14. Create Notices table
CREATE TABLE IF NOT EXISTS notices (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id uuid REFERENCES profiles(id) NOT NULL,
  content text NOT NULL,
  importance text DEFAULT 'info',
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Enable RLS on Notices
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 16. Add RLS policy for Notices
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Everyone can view notices') THEN
        CREATE POLICY "Everyone can view notices" ON notices FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers can manage their own notices') THEN
        CREATE POLICY "Teachers can manage their own notices" ON notices FOR ALL USING (
            auth.uid() = teacher_id
        );
    END IF;
END $$;
