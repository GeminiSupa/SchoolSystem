'use client'

import { 
  Users, Calendar, ClipboardCheck, Clock, 
  MessageSquare, Plus, BookOpen, CheckSquare,
  ArrowRight, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TeacherDashboardProps {
  profile: any
  stats: any
}

export default function TeacherDashboard({ profile, stats }: TeacherDashboardProps) {
  const [teacherStats, setTeacherStats] = useState({ studentCount: 0, classCount: 0 })
  const [classes, setClasses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTeacherData()
  }, [])

  const fetchTeacherData = async () => {
    try {
      // 1. Fetch Classes taught by this teacher
      const { data: classData } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', profile.id)
      
      setClasses(classData || [])

      // 2. Fetch Students in those classes
      if (classData?.length) {
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .in('grade', classData.map(c => c.grade))
          // Note: In a real system, filter by section too if multiple teachers share a grade
        
        setTeacherStats({
          studentCount: studentData?.length || 0,
          classCount: classData.length
        })
      }
    } catch (err) {
      console.error("Teacher Dashboard Data Fetch Error:", err)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter italic">Teacher Dashboard</h3>
          <p className="text-slate-500 font-bold text-sm">Manage your classes, attendance, and student performance.</p>
        </div>
        <div className="flex gap-3">
           <Link href="/dashboard/attendance" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 text-xs uppercase tracking-widest">
              <CheckSquare size={16} /> Mark Attendance
           </Link>
           <Link href="/dashboard/grades" className="glassmorphism px-5 py-2.5 rounded-xl font-bold text-slate-600 flex items-center gap-2 border border-slate-100 hover:bg-white transition-all text-xs uppercase tracking-widest">
              <ClipboardCheck size={16} /> Record Grades
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
           {/* Quick Stats */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glassmorphism p-6 rounded-[2.5rem] border border-white/50 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users size={24} />
                 </div>
                 <div>
                    <p className="text-2xl font-bold text-slate-900">{isLoading ? '...' : teacherStats.studentCount}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Students</p>
                 </div>
              </div>
              <div className="glassmorphism p-6 rounded-[2.5rem] border border-white/50 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <BookOpen size={24} />
                 </div>
                 <div>
                    <p className="text-2xl font-bold text-slate-900">{isLoading ? '...' : teacherStats.classCount}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Classes</p>
                 </div>
              </div>
           </div>

           {/* My Classes */}
           <div className="glassmorphism rounded-[3rem] border border-white/50 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                 <h4 className="font-bold text-xl tracking-tight text-slate-900">My Classes & Subjects</h4>
                 <button className="text-indigo-600 font-bold text-xs uppercase tracking-widest">View Schedule</button>
              </div>
              <div className="p-4 divide-y divide-slate-50">
                 {isLoading ? (
                    <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-slate-200" /></div>
                 ) : classes.length > 0 ? classes.map((cls, i) => (
                   <div key={i} className="p-4 flex items-center justify-between hover:bg-white/40 transition-all rounded-2xl">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <Calendar size={20} />
                         </div>
                         <div>
                            <p className="font-bold text-slate-900">{cls.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{cls.grade} | {cls.section}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <Link href={`/dashboard/attendance?class=${cls.id}`} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">Mark Attendance</Link>
                      </div>
                   </div>
                 )) : (
                    <p className="p-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No classes assigned yet.</p>
                 )}
              </div>
           </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
           {/* Announcements */}
           <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                 <MessageSquare size={20} className="text-slate-400" />
                 <h4 className="font-bold text-lg text-slate-900 italic">Teacher's Lounge</h4>
              </div>
              <div className="space-y-4">
                 <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <p className="text-sm font-bold text-indigo-900 mb-1">New Curriculum Update</p>
                    <p className="text-xs text-indigo-700/70 font-medium">Please review the updated Math syllabus for Term 2.</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-900 mb-1">Parent-Teacher Meeting</p>
                    <p className="text-xs text-slate-500 font-medium">Scheduled for next Friday at 3:00 PM.</p>
                 </div>
              </div>
           </div>

           {/* Leave Status */}
           <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 shadow-sm">
              <h4 className="font-bold text-lg text-slate-900 mb-4 tracking-tight">Recent Leave</h4>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                 <div>
                    <p className="text-xs font-extra-bold text-emerald-800 uppercase tracking-widest">Sick Leave</p>
                    <p className="text-sm font-bold text-emerald-900">Approved</p>
                 </div>
                 <span className="text-xs text-emerald-600 font-bold">2 Days</span>
              </div>
              <Link href="/dashboard/leaves" className="w-full mt-4 py-3 rounded-xl border border-slate-100 font-bold text-slate-400 text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all flex items-center justify-center gap-2">
                 Apply for Leave <ArrowRight size={12} />
              </Link>
           </div>
        </div>
      </div>
    </div>
  )
}
