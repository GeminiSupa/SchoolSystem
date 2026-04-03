import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function test() {
  const email = `test-${Date.now()}@example.com`
  const password = 'password123'
  const schoolName = 'Debug School'
  const schoolSlug = `debug-school-${Date.now()}`
  const fullName = 'Debug Admin'

  console.log('--- Starting Debug Registration ---')
  console.log('Email:', email)
  console.log('School:', schoolName)
  console.log('Slug:', schoolSlug)

  try {
    // 1. Sign up
    console.log('1. Signing up user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    if (authError) {
      console.error('Auth Error:', authError)
      return
    }
    console.log('User created:', authData.user?.id)
    console.log('Session exists:', !!authData.session)

    // 2. Create School
    console.log('2. Creating school...')
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .insert({
        name: schoolName,
        slug: schoolSlug,
      })
      .select()
      .single()

    if (schoolError) {
      console.error('School Insert Error:', schoolError)
      // If we fail here, we can't proceed to profile
    } else {
      console.log('School created:', schoolData.id)

      // 3. Update Profile
      console.log('3. Updating profile...')
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          school_id: schoolData.id,
          role: 'admin',
          full_name: fullName,
          email: email,
        })

      if (profileError) {
        console.error('Profile Upsert Error:', profileError)
      } else {
        console.log('Profile updated successfully!')
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

test()
