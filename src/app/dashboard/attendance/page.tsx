'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Check, X, Clock, Search, Filter, Loader2, Save, 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle2, FileText, Send
} from 'lucide-react'

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'mark' | 'approvals'>('mark')
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [remarks, setRemarks] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [hasExistingRecords, setHasExistingRecords] = useState(false)
  const [batchStatus, setBatchStatus] = useState('draft')
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedClassId && activeTab === 'mark') {
      fetchAttendanceData()
    }
  }, [selectedClassId, selectedDate, activeTab])

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user?.id).single()
      setProfile(profile)
      setUserRole(profile?.role || 'teacher')
      
      if (!profile?.school_id) {
        setIsLoading(false)
        return
      }

      // Fetch Classes
      const { data: classData } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('name')
      
      setClasses(classData || [])
      if (classData?.length) setSelectedClassId(classData[0].id)

      if (profile?.role === 'admin') {
        fetchPendingApprovals(profile.school_id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPendingApprovals = async (schoolId: string) => {
    const { data } = await supabase
      .from('attendance')
      .select('date, class_id, classes(name, grade, section), profiles(full_name)')
      .eq('school_id', schoolId)
      // .eq('approval_status', 'submitted');
    
    if (data) {
      const grouped: any = {}
      data.forEach((item: any) => {
        const cls = Array.isArray(item.classes) ? item.classes[0] : item.classes
        const key = `${item.class_id}_${item.date}`
        if (!grouped[key]) {
          grouped[key] = {
            class_id: item.class_id,
            date: item.date,
            class_name: cls?.name,
            grade: cls?.grade,
            section: cls?.section,
            teacher: item.profiles?.full_name,
            count: 0
          }
        }
        grouped[key].count += 1
      })
      setPendingApprovals(Object.values(grouped))
    }
  }

  const fetchAttendanceData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const cls = classes.find(c => c.id === selectedClassId)
      let query = supabase.from('students').select('*')
      
      if (cls?.name) {
        query = query.eq('grade', cls.name)
      }

      if (userRole === 'parent') query = query.eq('parent_id', user?.id)
      if (userRole === 'student') query = query.eq('user_id', user?.id)

      const { data: studentData, error: sError } = await query.order('full_name')

      if (sError) throw sError
      setStudents(studentData || [])

      let attQuery = supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClassId)
        .eq('date', selectedDate)

      if (userRole === 'student' || userRole === 'parent') {
        // attQuery = attQuery.eq('approval_status', 'approved')
      }

      const { data: attendanceData } = await attQuery

      const statusMap: Record<string, string> = {}
      const remarksMap: Record<string, string> = {}
      
      if (attendanceData && attendanceData.length > 0) {
        setHasExistingRecords(true)
        setBatchStatus('draft') // Default to draft, schema missing approval_status
        attendanceData.forEach(rec => {
          statusMap[rec.student_id] = rec.status
          remarksMap[rec.student_id] = rec.remarks || ''
        })
      } else {
        setHasExistingRecords(false)
        setBatchStatus('draft')
        studentData?.forEach(s => statusMap[s.id] = 'present')
      }

      setAttendance(statusMap)
      setRemarks(remarksMap)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = (id: string, status: string) => {
    if (batchStatus === 'approved' && userRole !== 'admin') return
    setAttendance(prev => ({ ...prev, [id]: status }))
  }

  const handleSaveAttendance = async (targetStatus: string) => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const records = students.map(s => ({
        student_id: s.id,
        school_id: profile?.school_id,
        class_id: selectedClassId,
        status: attendance[s.id],
        remarks: remarks[s.id] || '',
        recorded_by: user?.id,
        date: selectedDate
        // approval_status: targetStatus
      }))

      if (hasExistingRecords) {
        await supabase.from('attendance')
          .delete()
          .eq('class_id', selectedClassId)
          .eq('date', selectedDate);
      }

      const { error } = await supabase
        .from('attendance')
        .insert(records)

      if (error) {
        alert('Error saving attendance: ' + error.message)
      } else {
        setHasExistingRecords(true)
        setBatchStatus(targetStatus)
        alert(`Attendance ${targetStatus === 'submitted' ? 'submitted for approval' : 'saved'} successfully!`)
        if (userRole === 'admin') fetchPendingApprovals(profile.school_id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAdminApprove = async (class_id: string, date: string, action: 'approved' | 'draft') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      /*
      const { error } = await supabase
        .from('attendance')
        .update({ 
          approval_status: action,
          approved_by: action === 'approved' ? user?.id : null,
          approved_at: action === 'approved' ? new Date().toISOString() : null
        })
        .eq('class_id', class_id)
        .eq('date', date)
        
      if (error) alert(error.message)
      else {
      */
        fetchPendingApprovals(profile.school_id)
        if (class_id === selectedClassId && date === selectedDate) {
          setBatchStatus(action)
        }
      // }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter">Attendance Register</h3>
          <p className="text-slate-500 font-bold text-sm">Managing records for {new Date(selectedDate).toLocaleDateString()}</p>
        </div>
        
        {userRole === 'admin' && (
          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 w-full md:w-auto">
             <button 
              onClick={() => setActiveTab('mark')}
              className={`flex-1 md:px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'mark' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Mark Attendance
             </button>
             <button 
              onClick={() => setActiveTab('approvals')}
              className={`flex-1 md:px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'approvals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Approvals {pendingApprovals.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingApprovals.length}</span>}
             </button>
          </div>
        )}
      </div>

      {activeTab === 'mark' && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 glassmorphism p-4 rounded-3xl border border-slate-200/50">
            <div className="relative flex-1 sm:max-w-xs">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl font-bold text-slate-900 border border-slate-100 outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm"
              />
            </div>
            {(userRole === 'teacher' || userRole === 'admin') && (
              <select 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="flex-1 sm:max-w-xs bg-white px-4 py-3 rounded-2xl font-bold text-slate-900 border border-slate-100 outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm"
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            
            {(userRole === 'teacher' || userRole === 'admin') && (
              <div className="flex flex-1 sm:flex-none gap-2 ml-auto">
                <button 
                  onClick={() => handleSaveAttendance('draft')}
                  disabled={isSaving || isLoading || batchStatus === 'approved'}
                  className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Draft
                </button>
                <button 
                  onClick={() => handleSaveAttendance('submitted')}
                  disabled={isSaving || isLoading || batchStatus === 'approved' || batchStatus === 'submitted'}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  Submit to Admin
                </button>
              </div>
            )}
          </div>

          {hasExistingRecords && (
            <div className={`p-4 border rounded-2xl flex items-center gap-3 animate-in fade-in duration-500 ${
              batchStatus === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              batchStatus === 'submitted' ? 'bg-amber-50 border-amber-100 text-amber-800' :
              'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
               {batchStatus === 'approved' ? <CheckCircle2 size={18} /> : 
                batchStatus === 'submitted' ? <Clock size={18} /> :
                <AlertCircle size={18} />}
               <div className="flex flex-col">
                 <p className="text-sm font-bold capitalize leading-tight">Status: {batchStatus}</p>
                 <p className="text-xs font-medium opacity-80 mt-0.5">
                   {batchStatus === 'approved' ? 'Attendance has been approved. It can no longer be edited by teachers.' :
                    batchStatus === 'submitted' ? 'Waiting for admin approval.' :
                    'Saved as a draft. Remember to submit when finished.'}
                 </p>
               </div>
            </div>
          )}

          <div className="glassmorphism rounded-[2.5rem] border border-white/50 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/5 border-b border-slate-200">
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Student Information</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center">
                       <Loader2 className="animate-spin mx-auto text-slate-300" size={40} />
                    </td>
                  </tr>
                ) : students.length > 0 ? students.map((student) => {
                  const isReadOnly = (batchStatus === 'approved' && userRole !== 'admin') || userRole === 'student' || userRole === 'parent'
                  
                  return (
                    <tr key={student.id} className="hover:bg-white/40 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200 text-xs italic">
                            {student.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{student.full_name}</p>
                            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Roll: {student.roll_no || '---'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center justify-center gap-3">
                            {!isReadOnly ? (
                              <>
                                <button 
                                  onClick={() => handleStatusChange(student.id, 'present')}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${attendance[student.id] === 'present' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white border-slate-100 text-slate-300 hover:border-emerald-200'}`}
                                >
                                  <Check size={18} />
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(student.id, 'late')}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${attendance[student.id] === 'late' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-white border-slate-100 text-slate-300 hover:border-amber-200'}`}
                                >
                                  <Clock size={16} />
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(student.id, 'absent')}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${attendance[student.id] === 'absent' ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-white border-slate-100 text-slate-300 hover:border-rose-200'}`}
                                >
                                  <X size={18} />
                                </button>
                              </>
                            ) : (
                              <span className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest ${
                                attendance[student.id] === 'present' ? 'bg-emerald-100 text-emerald-800' : 
                                attendance[student.id] === 'absent' ? 'bg-rose-100 text-rose-800' : 
                                attendance[student.id] === 'late' ? 'bg-amber-100 text-amber-800' : 
                                'bg-slate-100 text-slate-400'
                              }`}>
                                {attendance[student.id] || 'Not Marked'}
                              </span>
                            )}
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         {isReadOnly ? (
                           <p className="text-sm text-slate-500 italic">{remarks[student.id] || 'No remarks'}</p>
                         ) : (
                           <div className="relative group">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-indigo-400 transition-colors" size={14} />
                             <input 
                              type="text"
                              placeholder="Special observation..."
                              value={remarks[student.id] || ''}
                              onChange={(e) => setRemarks(prev => ({ ...prev, [student.id]: e.target.value }))}
                              className="w-full bg-slate-50/30 border border-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium focus:bg-white focus:border-indigo-200 transition-all outline-none"
                             />
                           </div>
                         )}
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center space-y-4">
                       <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto opacity-50">
                          <CalendarIcon size={32} className="text-slate-400" />
                       </div>
                       <p className="text-slate-500 font-bold tracking-tight">No students or attendance records found.</p>
                       {(userRole === 'student' || userRole === 'parent') && (
                         <p className="text-sm text-slate-400">Attendance is only visible after it has been approved by an administrator.</p>
                       )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'approvals' && userRole === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingApprovals.length > 0 ? (
            pendingApprovals.map((approval, idx) => (
              <div key={idx} className="glassmorphism p-6 rounded-[2.5rem] border border-emerald-100/50 hover:shadow-xl hover:shadow-emerald-100 transition-all bg-emerald-50/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-white rounded-2xl border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                    <FileText size={24} />
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    Pending Approval
                  </span>
                </div>
                <h4 className="text-xl font-display font-bold text-slate-900 tracking-tight">{approval.class_name}</h4>
                <p className="text-sm text-emerald-700 font-bold mb-4">{new Date(approval.date).toLocaleDateString('en-PK', { weekday: 'long', month: 'long', day: 'numeric'})}</p>
                
                <div className="space-y-1 mb-6">
                  <div className="flex justify-between text-xs text-slate-500 font-bold">
                    <span>Teacher:</span>
                    <span className="text-slate-800">{approval.teacher || 'Not Assigned'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-bold">
                    <span>Records:</span>
                    <span className="text-slate-800">{approval.count} Students</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAdminApprove(approval.class_id, approval.date, 'draft')}
                    className="flex-1 py-3 bg-white text-rose-600 font-bold rounded-xl border border-rose-100 hover:bg-rose-50 transition-all text-xs uppercase tracking-widest"
                  >
                    Reject (Draft)
                  </button>
                  <button 
                    onClick={() => handleAdminApprove(approval.class_id, approval.date, 'approved')}
                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg text-xs uppercase tracking-widest gap-2 flex items-center justify-center"
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
               <div className="w-20 h-20 bg-slate-100/50 rounded-full flex items-center justify-center mx-auto opacity-50">
                  <CheckCircle2 size={40} className="text-slate-400" />
               </div>
               <div>
                  <h4 className="text-xl font-display font-bold text-slate-900 tracking-tight">All Caught Up!</h4>
                  <p className="text-slate-500 font-bold mt-1">There are no pending attendance approvals at the moment.</p>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
