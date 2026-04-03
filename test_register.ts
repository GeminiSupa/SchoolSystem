import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testRegistration() {
  console.log('Registering test user...')
  const email = `test-${Date.now()}@example.com`
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: { full_name: 'Test Admin' }
    }
  })

  if (authError) {
    console.error('Auth Error:', authError)
    return
  }

  console.log('User created:', authData.user?.id)

  console.log('Creating school...')
  const { data: schoolData, error: schoolError } = await supabase
    .from('schools')
    .insert({
      name: 'Test School',
      slug: `test-school-${Date.now()}`
    })
    .select()

  if (schoolError) {
    console.error('School Insert Error:', schoolError)
    return
  }
  
  console.log('School created:', schoolData)

  console.log('Updating profile...')
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      school_id: schoolData[0].id,
      role: 'admin',
    })
    .eq('id', authData.user?.id)

  if (profileError) {
    console.error('Profile Update Error:', profileError)
    return
  }

  console.log('Success!')
}

testRegistration()
