import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  try {
    const body = await request.json()
    const { email, password, full_name, role, phone, dob, address, school_id } = body

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Email, password, and full name are required' }, { status: 400 })
    }

    // 1. Create Auth User
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    })

    if (userError) {
      console.error('Error creating auth user:', userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    const userId = userData.user.id

    // 2. Create Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name,
        email,
        role: role || 'teacher',
        phone: phone || null,
        dob: dob || null,
        address: address || null,
        school_id
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Note: We might want to delete the auth user if profile creation fails
      // but for simplicity we'll just return the error
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, user_id: userId })
  } catch (err: any) {
    console.error('Unexpected error in create-user route:', err)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
