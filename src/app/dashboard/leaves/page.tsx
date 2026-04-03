'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar, Clock, CheckCircle2, XCircle, 
  Plus, Loader2, User, AlertCircle, FileText,
  Send, ShieldCheck, Search
} from 'lucide-react'

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const supabase = createClient()
  const role = profile?.role

  const [newLeave, setNewLeave] = useState({
    leave_type: 'sick',
    start_date: '',
    end_date: '',
    reason: '',
    student_id: '' // Only for parents
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      let leafQuery = supabase.from('leaves').select('*, profiles(full_name, role)')
      
      if (profileData.role === 'admin' || profileData.role === 'teacher') {
        // Admins see all; Teachers see all if they are 'managers' (for now let's show all to admin/staff)
        // In a real app, teachers only see their own unless they are coordinators
      } else if (profileData.role === 'parent') {
        // Parents see their own and their kids' leaves
        const { data: myKids } = await supabase.from('students').select('id').eq('parent_id', user.id)
        setStudents(myKids || [])
      }

      const { data: leafData, error } = await leafQuery.order('created_at', { ascending: false })
      setLeaves(leafData || [])

    } catch (err) {
      console.error("Leaves fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('leaves').insert({
        school_id: profile.school_id,
        user_id: user?.id,
        leave_type: newLeave.leave_type,
        start_date: newLeave.start_date,
        end_date: newLeave.end_date,
        reason: newLeave.reason,
        status: 'pending'
      })

      if (error) throw error
      
      setMessage({ type: 'success', text: 'Leave application submitted successfully!' })
      setShowApplyModal(false)
      fetchInitialData()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleApproveReject = async (id: string, status: 'approved' | 'rejected') => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('leaves')
      .update({ status, approved_by: user?.id })
      .eq('id', id)

    if (error) alert(error.message)
    else fetchInitialData()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-100'
      default: return 'bg-amber-50 text-amber-700 border-amber-100'
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter">Leave Management</h3>
          <p className="text-slate-500 font-bold text-sm">Request leaves, track status, and manage attendance records.</p>
        </div>
        
        <button 
          onClick={() => setShowApplyModal(true)}
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={20} /> Apply for Leave
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
        } animate-in fade-in slide-in-from-top-2 duration-300 font-medium text-sm`}>
          {message.text}
        </div>
      )}

      {/* Leave Requests Table */}
      <div className="glassmorphism rounded-[2.5rem] border border-white/50 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/20">
          <h4 className="font-bold text-slate-800">Applications History</h4>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-slate-600 border border-slate-100 shadow-sm">All</button>
            <button className="px-4 py-2 hover:bg-white rounded-xl text-xs font-bold text-slate-400">Pending</button>
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Applicant</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type & Duration</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Reason</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              {(role === 'admin') && <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaves.length > 0 ? leaves.map(leave => (
              <tr key={leave.id} className="hover:bg-white/40 group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200 text-xs">
                      {leave.profiles?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{leave.profiles?.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{leave.profiles?.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg block w-fit mb-1">{leave.leave_type}</span>
                  <p className="text-sm font-bold text-slate-700">{new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}</p>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm text-slate-500 font-medium line-clamp-1">{leave.reason || 'No reason provided'}</p>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusBadge(leave.status)}`}>
                    {leave.status}
                  </span>
                </td>
                {(role === 'admin') && (
                  <td className="px-8 py-5 text-right">
                    {leave.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleApproveReject(leave.id, 'approved')}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleApproveReject(leave.id, 'rejected')}
                          className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Processed</span>
                    )}
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-slate-200 mb-4" size={40} />
                  <p className="text-slate-400 font-bold">No leave applications found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <form onSubmit={handleApplyLeave} className="w-full max-w-lg glassmorphism p-8 md:p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Apply for Leave</h2>
              <button type="button" onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-900 transition-all bg-white shadow-sm p-2 rounded-xl">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Leave Type</label>
                  <select 
                    value={newLeave.leave_type}
                    onChange={(e) => setNewLeave({...newLeave, leave_type: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900 bg-white/50"
                  >
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="emergency">Emergency</option>
                    <option value="maternity">Maternity</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                   <input 
                    type="date"
                    required
                    value={newLeave.start_date}
                    onChange={(e) => setNewLeave({...newLeave, start_date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900"
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                   <input 
                    type="date"
                    required
                    value={newLeave.end_date}
                    onChange={(e) => setNewLeave({...newLeave, end_date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900"
                   />
                </div>
                {role === 'parent' && (
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Apply For Child</label>
                    <select 
                      required
                      value={newLeave.student_id}
                      onChange={(e) => setNewLeave({...newLeave, student_id: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900 bg-white/50"
                    >
                      <option value="">Select Child</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Reason (Optional)</label>
                <textarea 
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-800"
                  rows={2}
                  placeholder="Explain briefly..."
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button type="button" onClick={() => setShowApplyModal(false)} className="flex-1 glassmorphism font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all text-slate-600">Cancel</button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
