'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, Calendar, CreditCard, CheckCircle2, 
  AlertCircle, Sparkles, TrendingUp, ArrowRight,
  TrendingDown, Loader2, MessageSquare, Plus,
  ShieldAlert, BrainCircuit, Activity
} from 'lucide-react'
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import TeacherDashboard from '@/components/dashboard/TeacherDashboard'
import ParentDashboard from '@/components/dashboard/ParentDashboard'
import StudentDashboard from '@/components/dashboard/StudentDashboard'
import AccountantDashboard from '@/components/dashboard/AccountantDashboard'

export default function DashboardPage() {
  const [stats, setStats] = useState({ 
    studentCount: 0, 
    attendanceRate: 0, 
    feesCollected: 0, 
    pendingTasks: 0 
  })
  const [profile, setProfile] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // 1. Fetch User & Profile
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)

      // 2. Fetch Stats
      const statsRes = await fetch('/api/dashboard/stats')
      const statsData = await statsRes.json()
      if (!statsData.error) setStats(statsData)

      // 3. Initial Student Data for AI analysis (Limit for demo)
      if (profileData?.role === 'admin') {
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .eq('school_id', profileData.school_id)
          .limit(5)
        
        if (students?.length) {
          setIsAnalyzing(true)
          const analyzeRes = await fetch('/api/ai/analyze-risk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ students })
          })
          const analyzeData = await analyzeRes.json()
          if (!analyzeData.error) setAlerts(analyzeData.alerts || [])
          setIsAnalyzing(false)
        }
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-slate-200" size={48} />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Personalizing your experience...</p>
      </div>
    )
  }

  // Role-based rendering
  switch (profile?.role) {
    case 'teacher':
      return <TeacherDashboard profile={profile} stats={stats} />
    case 'parent':
      return <ParentDashboard profile={profile} />
    case 'student':
      return <StudentDashboard profile={profile} />
    case 'accountant':
      return <AccountantDashboard stats={stats} />
    case 'admin':
    default:
      return <AdminDashboard stats={stats} alerts={alerts} isLoading={isLoading} isAnalyzing={isAnalyzing} />
  }
}
