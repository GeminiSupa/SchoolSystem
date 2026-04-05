import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data: stu } = await supabase.from('students').select('id, class_id').limit(1).single()
  
  if (stu) {
    const { error: err2 } = await supabase.from('attendance').insert({
      student_id: stu.id,
      school_id: "0b087b78-6e80-4ff8-a929-61883675983b",
      class_id: "b2c55f96-82c0-45e2-a3d9-4f16b763b056",
      status: "present",
      remarks: "",
      recorded_by: "3f350bb7-9843-44cc-b06b-3a8bb80d505b",
      date: new Date().toISOString().split('T')[0]
    })
    console.log("Attendance Insert Error:", err2)
  }

  const { error: err1 } = await supabase.from('assignments').insert({
    title: "Test",
    class_id: "b2c55f96-82c0-45e2-a3d9-4f16b763b056",
    subject_name: "Math",
    due_date: new Date().toISOString(),
    description: "test",
    school_id: "0b087b78-6e80-4ff8-a929-61883675983b",
    teacher_id: "3f350bb7-9843-44cc-b06b-3a8bb80d505b"
  })
  console.log("Assignment Insert Error:", err1)
}
run()
