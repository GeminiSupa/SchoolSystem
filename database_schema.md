# Database Schema Setup

If you are seeing errors like `relation "invoices" does not exist` or `column "grade" does not exist`, you need to update your Supabase database schema.

### SQL Snippet

Run the following SQL in your Supabase SQL Editor:

```sql
-- Add missing columns to students table
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS roll_no TEXT;
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS address TEXT;

-- Ensure profiles table has all necessary fields
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher';
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS school_id UUID;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- Create missing tables
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  name TEXT NOT NULL,
  grade TEXT,
  section TEXT,
  room_no TEXT,
  teacher_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  student_id UUID REFERENCES students(id),
  class_id UUID REFERENCES classes(id),
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'leave')),
  remarks TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, class_id, date)
);

CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  student_id UUID REFERENCES students(id),
  exam_id UUID REFERENCES exams(id),
  subject TEXT NOT NULL,
  marks_obtained NUMERIC,
  total_marks NUMERIC DEFAULT 100,
  comments TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, exam_id, subject)
);

CREATE TABLE IF NOT EXISTS leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  user_id UUID REFERENCES profiles(id),
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  student_id UUID REFERENCES students(id),
  parent_id UUID REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  fee_type TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Storage Setup

You should also ensure that you have an **avatars** bucket in your Supabase Storage. You can create it manually or run the provided script `node scripts/setup_supabase.mjs`.
