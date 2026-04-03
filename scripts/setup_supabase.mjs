import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manual .env.local parser
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  lines.forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setup() {
  console.log('--- Starting Supabase Setup ---');

  // 1. Create Storage Bucket
  console.log('1. Creating "avatars" storage bucket...');
  const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('avatars', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    fileSizeLimit: 10485760
  });

  if (bucketError) {
    if (bucketError.message.includes('already exists')) {
      console.log('Bucket "avatars" already exists.');
    } else {
      console.error('Error creating bucket:', bucketError.message);
    }
  } else {
    console.log('Bucket "avatars" created successfully.');
  }

  console.log('--- Setup Complete ---');
  console.log('Please run the SQL in supabase/migrations/20260402_fix_schema.sql in your Supabase SQL Editor.');
}

setup();
