import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data: assignments, error: err1 } = await supabase.from('assignments').select('*').limit(1)
  console.log("Assignments Schema Sample:", assignments, "Error:", err1)
  
  const { data: attendance, error: err2 } = await supabase.from('attendance').select('*').limit(1)
  console.log("Attendance Schema Sample:", attendance, "Error:", err2)
}
run()
