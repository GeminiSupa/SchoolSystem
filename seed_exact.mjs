import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
  const { data: cls } = await supabase.from('classes').select('id, school_id').eq('name', 'Grade 5A').single()
  const { data: teacher } = await supabase.from('profiles').select('id').eq('email', 'teacher@pos.school.pk').single()
  
  if (cls && teacher) {
    const { error: err1 } = await supabase.from('assignments').insert({
      title: "Science Report final",
      class_id: cls.id,
      due_date: new Date(Date.now() + 86400000).toISOString(),
      description: "Do the science report.",
      school_id: cls.school_id,
      teacher_id: teacher.id
    })
    console.log("Assignment Seed:", err1 || "Success")
  }
}
run()
