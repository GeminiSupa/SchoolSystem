import { createClient } from '@supabase/supabase-js'
const supabase = createClient("https://tnhyvtzdcewmbwepoffl.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuaHl2dHpkY2V3bWJ3ZXBvZmZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MDQyOSwiZXhwIjoyMDkwNDU2NDI5fQ.1eM8z9clVIFpcnG7SrgmJ5CrdCtAY5d9tlb3xRFMtAQ")

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
    console.log("Assignment Seed Status:", err1 || "Success")
    const { data: a } = await supabase.from('assignments').select('*')
    console.log("Total Assignments in DB:", a?.length)
  }
}
run()
