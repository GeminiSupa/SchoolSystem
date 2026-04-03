'use client'

import { 
  BookOpen, Calendar, Star, Activity, 
  Clock, ArrowRight, CheckCircle2, MessageSquare,
  Loader2, GraduationCap
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface StudentDashboardProps {
  profile: any
}

export default function StudentDashboard({ profile }: StudentDashboardProps) {
  const [studentData, setStudentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ attendance: 0, gpa: 0, pendingAssignments: 0 })
  const supabase = createClient()

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!profile?.id) return
      
      // 1. Fetch Student Record
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', profile.id)
        .single()
      
      if (student) {
        setStudentData(student)
        
        // 2. Fetch Assignments Count
        const { count: assignmentCount } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .eq('grade', student.grade)
          // .eq('status', 'pending') // Assuming status column exists
        
        setStats(prev => ({ ...prev, pendingAssignments: assignmentCount || 0 }))
      }
      setIsLoading(false)
    }
    fetchStudentData()
  }, [profile?.id])

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-slate-300" size={48} /></div>
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter italic">My Personal Dashboard</h3>
          <p className="text-slate-500 font-bold text-sm">Track your learning progress, attendance, and upcoming tasks.</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 text-xs uppercase tracking-widest">
              <Calendar size={16} /> My Timetable
           </button>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Card */}
        <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 flex flex-col items-center text-center space-y-4">
           <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-4 border-white shadow-xl">
              <Activity size={32} />
           </div>
           <div>
              <p className="text-4xl font-display font-bold text-slate-900 leading-none">{stats.attendance || '90'}%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Overall Attendance</p>
           </div>
           <p className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter">On Track</p>
        </div>

        {/* performance Card */}
        <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 flex flex-col items-center text-center space-y-4">
           <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border-4 border-white shadow-xl">
              <Star size={32} />
           </div>
           <div>
              <p className="text-4xl font-display font-bold text-slate-900 leading-none">{stats.gpa === 0 ? 'N/A' : stats.gpa}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Academic Standing</p>
           </div>
           <p className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full uppercase tracking-tighter">Excellent</p>
        </div>

        {/* task Card */}
        <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 flex flex-col items-center text-center space-y-4">
           <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border-4 border-white shadow-xl">
              <CheckCircle2 size={32} />
           </div>
           <div>
              <p className="text-4xl font-display font-bold text-slate-900 leading-none">{stats.pendingAssignments}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Open Assignments</p>
           </div>
           <p className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">In Progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
           <div className="glassmorphism rounded-[3rem] border border-white/50 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                 <h4 className="font-bold text-xl tracking-tight text-slate-900 italic">Recent Results</h4>
                 <Link href="/dashboard/grades" className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Full Record</Link>
              </div>
              <div className="p-4 space-y-2">
                 {[
                   { name: "Mathematics - Midterm", marks: "88/100", grade: "A" },
                   { name: "English Literature - Quiz", marks: "18/20", grade: "A+" },
                   { name: "Physics - Monthly Test", marks: "42/50", grade: "A" },
                 ].map((res, i) => (
                   <div key={i} className="p-5 bg-white/30 rounded-2xl border border-white flex items-center justify-between hover:bg-white/60 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                            <BookOpen size={18} />
                         </div>
                         <p className="font-bold text-slate-900 text-sm">{res.name}</p>
                      </div>
                      <div className="text-right">
                         <p className="font-bold text-slate-900 leading-none mb-1">{res.marks}</p>
                         <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">{res.grade}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
           <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 shadow-sm relative overflow-hidden bg-slate-900 text-white">
              <Clock className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
              <h4 className="font-bold text-lg mb-6">Upcoming Exams</h4>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="w-1 h-10 rounded-full bg-amber-400" />
                    <div>
                       <p className="text-sm font-bold leading-tight">Chemistry Lab Final</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Oct 15 • 10:00 AM</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-1 h-10 rounded-full bg-rose-400" />
                    <div>
                       <p className="text-sm font-bold leading-tight">World History Exam</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Oct 18 • 02:00 PM</p>
                    </div>
                 </div>
              </div>
              <button className="w-full mt-10 py-4 rounded-2xl bg-white text-slate-900 font-bold text-xs uppercase tracking-widest hover:scale-[1.02] transition-all">
                 Exam Center
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
