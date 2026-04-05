-- Final Database Schema Fix Consolidated Script
-- This script ensures all missing columns and tables required by the UI are present.

-- 1. Update Assignments Table
ALTER TABLE IF EXISTS assignments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE IF EXISTS assignments ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE IF EXISTS assignments ADD COLUMN IF NOT EXISTS max_points NUMERIC DEFAULT 100;

-- 2. Create Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    content TEXT, -- Submission content or link
    grade NUMERIC,
    feedback TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- 3. Ensure Attendance Table Extensions
ALTER TABLE IF EXISTS attendance ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'submitted', 'approved'));
ALTER TABLE IF EXISTS attendance ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);
ALTER TABLE IF EXISTS attendance ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- 4. Ensure Timetable Table matches UI expectations if needed
-- (The UI already seems to work with existing timetable schema)

-- 5. RLS Policies (Basic for development)
-- Enable RLS on new tables
ALTER TABLE IF EXISTS assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies for testing (Should be refined for production)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assignment_submissions' AND policyname = 'Allow all for authenticated users') THEN
        CREATE POLICY "Allow all for authenticated users" ON assignment_submissions
        FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;
