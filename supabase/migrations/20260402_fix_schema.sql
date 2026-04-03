-- Add missing columns to students table
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES profiles(id);
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS roll_no TEXT;
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE IF EXISTS students ADD COLUMN IF NOT EXISTS gender TEXT;

-- Ensure profiles table has all necessary fields
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher';
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS school_id UUID;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS address TEXT; 

-- Create schools table if missing
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create classes table if missing
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  name TEXT NOT NULL,
  grade TEXT,
  section TEXT,
  room_no TEXT,
  teacher_id UUID REFERENCES profiles(id),
  subjects TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all columns exist even if table was created previously
ALTER TABLE IF EXISTS classes ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE IF EXISTS classes ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE IF EXISTS classes ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES profiles(id);
ALTER TABLE IF EXISTS classes ADD COLUMN IF NOT EXISTS subjects TEXT[];
ALTER TABLE IF EXISTS classes ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id);

-- Create class_subjects table (The Pakistani "Workload" Model)
CREATE TABLE IF NOT EXISTS class_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table if missing
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  student_id UUID REFERENCES students(id),
  class_id UUID REFERENCES classes(id),
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'leave')),
  remarks TEXT,
  recorded_by UUID REFERENCES profiles(id),
  approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'submitted', 'approved')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, class_id, date)
);

-- Create exams table if missing
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

-- Create grades table if missing
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

-- Create leaves table if missing
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

-- Create invoices table if missing
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

-- Create assignments table if missing
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  class_id UUID REFERENCES classes(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  total_marks NUMERIC DEFAULT 10,
  teacher_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create timetable table if missing
CREATE TABLE IF NOT EXISTS timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  class_id UUID REFERENCES classes(id),
  teacher_id UUID REFERENCES profiles(id),
  subject TEXT NOT NULL,
  day TEXT NOT NULL, -- 'Monday', 'Tuesday', etc.
  time_slot TEXT NOT NULL, -- '09:00 - 10:00'
  room TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- EXAM & GRADING SYSTEM SCHEMA
-- =============================================

-- exam_classes: Links exams to specific classes
CREATE TABLE IF NOT EXISTS exam_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE(exam_id, class_id)
);

-- Add approval workflow columns to grades
ALTER TABLE IF EXISTS grades ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE IF EXISTS grades ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);
ALTER TABLE IF EXISTS grades ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add exam metadata columns
ALTER TABLE IF EXISTS exams ADD COLUMN IF NOT EXISTS exam_type TEXT DEFAULT 'midterm';
ALTER TABLE IF EXISTS exams ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- =============================================
-- MESSAGING & EXTENDED FINANCE SCHEMA
-- =============================================

-- 1. Messaging System
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id),
    sender_id UUID REFERENCES profiles(id),
    receiver_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Payroll System
CREATE TABLE IF NOT EXISTS payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id),
    employee_id UUID REFERENCES profiles(id),
    amount NUMERIC NOT NULL,
    month DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Student Fees (Specific fee per student)
CREATE TABLE IF NOT EXISTS student_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id),
    student_id UUID REFERENCES students(id) UNIQUE,
    monthly_fee NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    transport_fee NUMERIC DEFAULT 0,
    other_charges NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: After creating these tables, ensure RLS (Row Level Security) is configured in Supabase.
-- For development, you can disable RLS or add open policies if needed.
