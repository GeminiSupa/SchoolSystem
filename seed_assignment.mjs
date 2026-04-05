import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data: stu } = await supabase.from('students').select('id, class_id').limit(1).single()
  
  if (stu) {
    const { error: err1 } = await supabase.from('assignments').insert({
      title: "Science Report final",
      class_id: stu.class_id,
      due_date: new Date(Date.now() + 86400000).toISOString(),
      description: "Do the science report.",
      school_id: "0b087b78-6e80-4ff8-a929-61883675983b",
      teacher_id: "3f350bb7-9843-44cc-b06b-3a8bb80d505b"
    })
    console.log("Assignment Insert Status:", err1 ? err1 : "Success")
  }
}
run()
