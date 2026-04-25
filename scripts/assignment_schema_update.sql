-- Update Assignments and Submissions for File Support
-- Run this in your Supabase SQL Editor

-- 1. Add attachment columns to assignments (for handouts)
ALTER TABLE IF EXISTS assignments 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- 2. Add attachment columns to assignment_submissions (for student work)
ALTER TABLE IF EXISTS assignment_submissions 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- 3. Ensure RLS is updated (if not already handled)
-- (Assuming RLS is already enabled from fix_final_schema.sql)
