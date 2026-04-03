import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://tnhyvtzdcewmbwepoffl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuaHl2dHpkY2V3bWJ3ZXBvZmZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MDQyOSwiZXhwIjoyMDkwNDU2NDI5fQ.1eM8z9clVIFpcnG7SrgmJ5CrdCtAY5d9tlb3xRFMtAQ')

async function check() {
  const { data, error } = await supabase.storage.listBuckets()
  console.log('Buckets:', data?.map(b => b.name) || [])
  if (error) console.error(error)
}
check()
