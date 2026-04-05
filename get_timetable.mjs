import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function run() {
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, role').eq('role', 'teacher')
  console.log("Teachers:", profiles)
  
  const { data: timetable } = await supabase.from('timetable').select('*')
  console.log("Timetable:", timetable)
}

run()
