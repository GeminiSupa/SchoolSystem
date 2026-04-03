import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  
  try {
    const { month } = await req.json()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user?.id).single()

    // 1. Fetch all staff for this school
    const { data: staff } = await supabase
      .from('profiles')
      .select('*')
      .eq('school_id', profile?.school_id)
      .in('role', ['teacher', 'staff'])

    if (!staff || staff.length === 0) return NextResponse.json({ error: 'No staff found' }, { status: 404 })

    // 2. Generate Payroll Entries
    const payrollRecords = staff.map(s => {
      const basic = Number(s.salary) || 30000 // Default or from profile
      const allowances = 0
      const deductions = 0
      const net = basic + allowances - deductions
      
      return {
        school_id: profile?.school_id,
        user_id: s.id,
        month,
        basic_salary: basic,
        allowances,
        deductions,
        net_salary: net,
        status: 'unpaid'
      }
    })

    // 3. Upsert to avoid duplicates for the same month/user
    const { error } = await supabase
      .from('payroll')
      .upsert(payrollRecords, { onConflict: 'user_id, month' })

    if (error) throw error

    return NextResponse.json({ success: true, count: payrollRecords.length })
  } catch (err: any) {
    console.error("Payroll Generation Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
