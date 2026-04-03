import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://tnhyvtzdcewmbwepoffl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuaHl2dHpkY2V3bWJ3ZXBvZmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODA0MjksImV4cCI6MjA5MDQ1NjQyOX0.vTocP73gdfQiJUluJwOjgoBQhNf40CTMEm3xKude7QI')

async function check() {
  const { count, error } = await supabase.from('students').select('*', { count: 'exact', head: true })
  console.log('Student Count:', count)
  if (error) console.error(error)
}
check()
