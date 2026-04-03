'use client'

import { 
  Users, Calendar, CreditCard, ClipboardCheck, 
  TrendingUp, ArrowRight, MessageSquare, 
  Activity, Star, Loader2, GraduationCap
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ParentDashboardProps {
  profile: any
}

export default function ParentDashboard({ profile }: ParentDashboardProps) {
  const [children, setChildren] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchChildren = async () => {
      if (!profile?.id) return
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', profile.id)
      
      if (error) console.error("Error fetching children:", error)
      else setChildren(data || [])
      setIsLoading(false)
    }
    fetchChildren()
  }, [profile?.id])
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter italic">Parent Portal</h3>
          <p className="text-slate-500 font-bold text-sm">Monitor your children's academic journey and school activities.</p>
        </div>
        <div className="flex gap-3">
           <Link href="/dashboard/finance" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 text-xs uppercase tracking-widest">
              <CreditCard size={16} /> Pay Online
           </Link>
           <Link href="/dashboard/messages" className="glassmorphism px-5 py-2.5 rounded-xl font-bold text-slate-600 flex items-center gap-2 border border-slate-100 hover:bg-white transition-all text-xs uppercase tracking-widest">
              <MessageSquare size={16} /> Contact School
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section: Children Profiles */}
        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                <div className="col-span-full py-10 flex justify-center">
                  <Loader2 className="animate-spin text-slate-400" size={32} />
                </div>
              ) : children.length > 0 ? children.map((child, i) => (
                <div key={i} className="glassmorphism p-8 rounded-[3rem] border border-white/50 space-y-6 hover:scale-[1.02] transition-all group">
                   <div className="flex items-center gap-4">
                      {child.avatar_url ? (
                        <img src={child.avatar_url} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg" alt={child.full_name} />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-display font-bold text-2xl shadow-xl shadow-slate-200">
                           {child.full_name?.charAt(0)}
                        </div>
                      )}
                      <div>
                         <h4 className="font-bold text-xl text-slate-900">{child.full_name}</h4>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{child.grade} | {child.section}</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/40 rounded-2xl border border-white">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Roll No</p>
                         <div className="flex items-center gap-2">
                            <Activity size={14} className="text-emerald-500" />
                            <p className="font-bold text-slate-900">{child.roll_no || 'N/A'}</p>
                         </div>
                      </div>
                      <div className="p-4 bg-white/40 rounded-2xl border border-white">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                         <div className="flex items-center gap-2">
                            <Star size={14} className="text-amber-500" />
                            <p className="font-bold text-slate-900 capitalize">{child.status || 'Active'}</p>
                         </div>
                      </div>
                   </div>

                   <Link href={`/dashboard/students/`} className="w-full py-4 rounded-2xl border border-slate-100 font-bold text-slate-600 text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      View Detailed Record <ArrowRight size={14} />
                   </Link>
                </div>
              )) : (
                <div className="col-span-full glassmorphism p-12 rounded-[3rem] border border-white/50 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto opacity-50">
                    <GraduationCap size={32} className="text-slate-400" />
                  </div>
                  <h4 className="font-bold text-slate-900">No children linked to your account.</h4>
                  <p className="text-slate-500 text-sm font-medium">Please contact the school office to link your children's profiles to your parent account.</p>
                </div>
              )}
           </div>

           {/* School Announcements */}
           <div className="glassmorphism rounded-[3rem] border border-white/50 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100">
                 <h4 className="font-bold text-xl tracking-tight text-slate-900">School Bulletins</h4>
              </div>
              <div className="p-8 space-y-6">
                 <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                       <Calendar size={24} />
                    </div>
                    <div>
                       <p className="font-bold text-slate-900">Annual Sports Day Next Month</p>
                       <p className="text-sm text-slate-500 font-medium">Please mark your calendars for the upcoming sports gala on May 15th.</p>
                       <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-2">Upcoming Event</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
           {/* Financial Summary */}
           <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 shadow-sm bg-gradient-to-br from-slate-900 to-indigo-900 text-white overflow-hidden relative">
              <CreditCard className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
              <h4 className="font-bold text-lg mb-6">Fee Status</h4>
              <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">Pending Fee</span>
                    <span className="text-xl font-bold">Rs. 8,500</span>
                 </div>
                 <div className="flex justify-between items-center text-rose-400">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Due Date</span>
                    <span className="text-sm font-bold italic">Oct 10, 2026</span>
                 </div>
              </div>
              <Link href="/dashboard/finance" className="w-full py-4 rounded-2xl bg-white text-indigo-900 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-xl">
                 Pay Now
              </Link>
           </div>

           {/* Quick Support */}
           <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-slate-400">
                 <MessageSquare size={20} />
                 <h4 className="font-bold text-lg text-slate-900 tracking-tight italic">Support Hub</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">Need help with registration, transport or anything else? Our support team is here to assist you.</p>
              <button className="w-full py-3 rounded-xl border border-slate-100 font-bold text-slate-600 text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50">
                 Raise a Request
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
