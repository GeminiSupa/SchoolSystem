'use client'

import { 
  Loader2, BrainCircuit, Activity, ShieldAlert, Plus,
  Calendar, Users, CreditCard, CheckCircle2, ArrowRight, Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface AdminDashboardProps {
  stats: any
  alerts: any[]
  isLoading: boolean
  isAnalyzing: boolean
}

export default function AdminDashboard({ stats, alerts, isLoading, isAnalyzing }: AdminDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter italic">Administrative Command Hub</h3>
          <p className="text-slate-500 font-bold text-sm">Real-time school intelligence and AI-assisted operations.</p>
        </div>
        <div className="flex gap-3">
           <Link href="/dashboard/students?add=true" className="glassmorphism px-5 py-2.5 rounded-xl font-bold text-slate-600 flex items-center gap-2 border border-slate-100 hover:bg-white transition-all text-xs uppercase tracking-widest">
              <Plus size={16} /> New Admission
           </Link>
           <Link href="/dashboard/attendance" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 text-xs uppercase tracking-widest">
              <Calendar size={16} /> Mark Attendance
           </Link>
        </div>
      </div>

      {/* Row 1: Executive Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Enrolled Students", value: stats.studentCount, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+12%" },
          { label: "Today's Attendance", value: `${stats.attendanceRate}%`, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+2.4%" },
          { label: "Revenue (Month)", value: `Rs. ${stats.feesCollected?.toLocaleString()}`, icon: CreditCard, color: "text-rose-600", bg: "bg-rose-50", trend: "+$2k" },
          { label: "System Tasks", value: stats.pendingTasks, icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50", trend: "Normal" },
        ].map((stat, i) => (
          <div key={i} className="glassmorphism p-6 rounded-[2.5rem] border border-white/50 relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-5 ${stat.bg}`} />
            <div className="flex justify-between items-start mb-4">
               <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={20} />
               </div>
               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                  {stat.trend}
               </span>
            </div>
            <p className="text-3xl font-display font-bold text-slate-900 tracking-tighter">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Row 2: AI Sentinel */}
        <div className="lg:col-span-2 glassmorphism rounded-[3rem] border border-white/50 overflow-hidden shadow-sm flex flex-col">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-transparent">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                   <BrainCircuit size={20} />
                </div>
                <div>
                   <h4 className="font-bold text-xl tracking-tight text-slate-900">AI Sentinel: At-Risk Analysis</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Predictive Behavioral & Academic Insights</p>
                </div>
             </div>
             {isAnalyzing && <Loader2 className="animate-spin text-indigo-600" size={24} />}
          </div>
          
          <div className="p-8 space-y-4 flex-1">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
                  <Loader2 className="animate-spin text-slate-200" size={48} />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Waking up the Sentinel...</p>
               </div>
            ) : alerts.length > 0 ? alerts.map((alert, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-5 rounded-3xl border border-slate-50 hover:border-slate-200 hover:bg-white/50 transition-all group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  alert.riskLevel === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <ShieldAlert size={24} />
                </div>
                <div className="flex-1 space-y-1">
                   <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">{alert.name}</p>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                        alert.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {alert.riskLevel} RISK
                      </span>
                   </div>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">{alert.reason}</p>
                </div>
                <button className="self-end md:self-center p-3 rounded-2xl bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <ArrowRight size={18} />
                </button>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 opacity-50">
                 <CheckCircle2 size={48} className="text-emerald-400" />
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">All Students are currently performing withing normal ranges.</p>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-indigo-50/30 border-t border-indigo-50/50 text-center">
             <button className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:gap-3 transition-all">
                Generate Full Academic Audit <Sparkles size={12} />
             </button>
          </div>
        </div>

        {/* intelligence */}
        <div className="space-y-8">
           <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 shadow-sm">
              <h4 className="font-bold text-xl tracking-tight text-slate-900 mb-6 italic">School Intelligence</h4>
              <div className="space-y-6">
                {[
                  { label: "Faculty Meeting", time: "2:00 PM Today", color: "indigo" },
                  { label: "New Admission Drive", time: "Starts Tomorrow", color: "emerald" },
                  { label: "Grade Reporting", time: "Ends in 2 days", color: "rose" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className={`w-1 h-10 rounded-full bg-${item.color}-500 shadow-sm`} />
                    <div>
                      <p className="font-bold text-slate-800 text-sm leading-tight">{item.label}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
