import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user?.id).single()

    // 1. Total Students
    const { count: studentCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', profile?.school_id)

    // 2. Attendance Today
    const today = new Date().toISOString().split('T')[0]
    const { data: attendance } = await supabase
      .from('attendance')
      .select('status')
      .eq('school_id', profile?.school_id)
      .eq('date', today)
    
    // 3. Fees Collected (Current Month)
    const { data: invoices } = await supabase
      .from('invoices')
      .select('amount, status')
      .eq('school_id', profile?.school_id)
      .eq('status', 'paid')

    const totalFees = invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0

    // 4. Pending Tasks (Mocking based on assignments for now)
    const { count: assignmentCount } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', profile?.school_id)

    return NextResponse.json({
      studentCount: studentCount || 0,
      attendanceRate: attendance?.length ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0,
      feesCollected: totalFees,
      pendingTasks: assignmentCount || 0
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
