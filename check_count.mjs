import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function check() {
  const { count, error } = await supabase.from('students').select('*', { count: 'exact', head: true })
  console.log('Student Count:', count)
  if (error) console.error(error)
}
check()
