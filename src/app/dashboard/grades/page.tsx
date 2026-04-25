'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Save, Search, Loader2, 
  GraduationCap, BookOpen, AlertCircle, CheckCircle2,
  FileText, BarChart3, Printer, Send, ShieldCheck,
  XCircle, Clock, Download
} from 'lucide-react'
import Link from 'next/link'
import { downloadCSV } from '@/lib/utils/export'

export default function GradebookPage() {
  const [students, setStudents] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedExam, setSelectedExam] = useState<string>('')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [marks, setMarks] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [gradeStatuses, setGradeStatuses] = useState<Record<string, string>>({})
  const [batchStatus, setBatchStatus] = useState<string | null>(null) // overall status for this exam/class/subject
  const [stats, setStats] = useState({ avg: 0, high: 0, failRate: 0, pending: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  
  const supabase = createClient()
  const role = profile?.role

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedExam && selectedClassId && selectedSubject) {
      fetchGrades()
    }
  }, [selectedExam, selectedClassId, selectedSubject])

  useEffect(() => {
    calculateStats()
  }, [marks, students])

  // When class changes, update subjects dropdown
  useEffect(() => {
    const cls = classes.find(c => c.id === selectedClassId)
    const subs = cls?.subjects || []
    setSubjects(subs)
    if (subs.length > 0 && !subs.includes(selectedSubject)) {
      setSelectedSubject(subs[0])
    }
  }, [selectedClassId, classes])

  const calculateStats = () => {
    const marksList = Object.values(marks)
    if (marksList.length === 0) {
      setStats({ avg: 0, high: 0, failRate: 0, pending: students.length })
      return
    }
    const avg = marksList.reduce((a, b) => a + b, 0) / marksList.length
    const high = Math.max(...marksList)
    const fails = marksList.filter(m => m < 40).length
    const failRate = students.length > 0 ? (fails / students.length) * 100 : 0
    const pending = students.length - marksList.length
    setStats({ avg: Math.round(avg), high, failRate: Math.round(failRate), pending })
  }

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase.from('profiles').select('id, role, school_id').eq('id', user.id).single()
      setProfile(profileData)
      const schoolId = profileData?.school_id
      const userRole = profileData?.role

      // Fetch exams — for teachers, only fetch exams linked to their classes
      let examQuery = supabase.from('exams').select('*').order('created_at', { ascending: false })
      if (schoolId) examQuery = examQuery.eq('school_id', schoolId)
      const { data: examData } = await examQuery
      setExams(examData || [])
      if (examData?.length) setSelectedExam(examData[0].id)

      // Fetch classes
      let classQuery = supabase.from('classes').select('*').order('name')
      if (schoolId) classQuery = classQuery.eq('school_id', schoolId)
      
      // Teachers only see their assigned classes
      if (userRole === 'teacher') {
        classQuery = classQuery.eq('teacher_id', user.id)
      }

      const { data: classData } = await classQuery
      setClasses(classData || [])
      if (classData?.length) {
        setSelectedClassId(classData[0].id)
        const subs = classData[0].subjects || []
        setSubjects(subs)
        if (subs.length > 0) setSelectedSubject(subs[0])
      }

    } catch (err) {
      console.error("Gradebook: Initial fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGrades = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !profile) return

      const schoolId = profile.school_id

      // Get Students in class
      const cls = classes.find(c => c.id === selectedClassId)
      let query = supabase.from('students').select('*')
      if (schoolId) query = query.eq('school_id', schoolId)
      if (cls?.grade) query = query.eq('grade', cls.grade)
      if (cls?.section) query = query.eq('section', cls.section)

      // Student/Parent scoping
      if (role === 'parent') query = query.eq('parent_id', user.id)
      if (role === 'student') query = query.eq('user_id', user.id)

      const { data: studentData } = await query.order('full_name')
      setStudents(studentData || [])

      // Get existing grades
      if (selectedExam && selectedSubject) {
        let gradeQuery = supabase
          .from('grades')
          .select('*')
          .eq('exam_id', selectedExam)
          .eq('subject', selectedSubject)

        if (schoolId) gradeQuery = gradeQuery.eq('school_id', schoolId)

        // For students/parents, filter to their own records
        if (role === 'student') {
          const studentIds = studentData?.map(s => s.id) || []
          if (studentIds.length > 0) gradeQuery = gradeQuery.in('student_id', studentIds)
        }
        if (role === 'parent') {
          const studentIds = studentData?.map(s => s.id) || []
          if (studentIds.length > 0) gradeQuery = gradeQuery.in('student_id', studentIds)
        }

        const { data: gradeData } = await gradeQuery

        const marksMap: Record<string, number> = {}
        const commentsMap: Record<string, string> = {}
        const statusMap: Record<string, string> = {}
        let commonStatus: string | null = null

        gradeData?.forEach(g => {
          marksMap[g.student_id] = g.marks_obtained
          commentsMap[g.student_id] = g.comments || ''
          statusMap[g.student_id] = g.status || 'draft'
          if (commonStatus === null) commonStatus = g.status || 'draft'
          else if (commonStatus !== g.status) commonStatus = 'mixed'
        })
        setMarks(marksMap)
        setComments(commentsMap)
        setGradeStatuses(statusMap)
        setBatchStatus(commonStatus)
      }
    } catch (err) {
      console.error("Unexpected error in fetchGrades:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveGrades = async (submitForApproval = false) => {
    setIsSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const status = submitForApproval ? 'submitted' : 'draft'

    const gradeRecords = students.map(s => ({
      student_id: s.id,
      exam_id: selectedExam,
      subject: selectedSubject,
      marks_obtained: marks[s.id] || 0,
      total_marks: 100,
      comments: comments[s.id] || '',
      recorded_by: user?.id,
      school_id: profile?.school_id,
      status
    }))

    const { error } = await supabase
      .from('grades')
      .upsert(gradeRecords, { onConflict: 'student_id,exam_id,subject' })

    if (error) {
      alert('Error saving grades: ' + error.message)
    } else {
      alert(submitForApproval ? 'Grades submitted for admin approval!' : 'Grades saved as draft!')
      fetchGrades()
    }
    
    setIsSaving(false)
  }

  const handleApproveReject = async (action: 'approved' | 'rejected') => {
    setIsSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('grades')
      .update({ 
        status: action, 
        approved_by: user?.id,
        approved_at: new Date().toISOString()
      })
      .eq('exam_id', selectedExam)
      .eq('subject', selectedSubject)
      .eq('school_id', profile?.school_id)

    if (error) alert('Error: ' + error.message)
    else alert(`Grades ${action} successfully!`)
    
    fetchGrades()
    setIsSaving(false)
  }

  const isReadOnly = role === 'student' || role === 'parent'
  const isSubmitted = batchStatus === 'submitted' || batchStatus === 'approved'
  const canEdit = !isReadOnly && batchStatus !== 'approved'

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return { label: 'Draft', style: 'bg-slate-100 text-slate-500 border-slate-200', icon: <Clock size={12} /> }
      case 'submitted': return { label: 'Submitted', style: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Send size={12} /> }
      case 'approved': return { label: 'Approved', style: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <ShieldCheck size={12} /> }
      case 'rejected': return { label: 'Rejected', style: 'bg-rose-50 text-rose-600 border-rose-100', icon: <XCircle size={12} /> }
      default: return { label: 'N/A', style: 'bg-slate-50 text-slate-400 border-slate-100', icon: null }
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter">
            {isReadOnly ? 'My Results' : 'Digital Gradebook'}
          </h3>
          <p className="text-slate-500 font-bold text-sm">
            {isReadOnly
              ? 'View your approved marks and performance across all exams.'
              : 'Enter marks, submit for approval, and manage student assessments.'}
          </p>
        </div>

        {/* Controls */}
        {!isReadOnly && (
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select 
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="flex-1 lg:w-48 glassmorphism px-4 py-3 rounded-2xl font-bold text-slate-900 border border-slate-200 outline-none"
            >
              {exams.length > 0 ? exams.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              )) : <option>No Exams Found</option>}
            </select>
            
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="flex-1 lg:w-40 glassmorphism px-4 py-3 rounded-2xl font-bold text-slate-900 border border-slate-200 outline-none"
            >
              {classes.length > 0 ? classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              )) : <option value="">No Classes</option>}
            </select>

            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="flex-1 lg:w-40 glassmorphism px-4 py-3 rounded-2xl font-bold text-slate-900 border border-slate-200 outline-none"
            >
              {subjects.length > 0 ? subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              )) : <option value="">No Subjects</option>}
            </select>
          </div>
        )}

        {/* Read-only selectors for students/parents */}
        {isReadOnly && (
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select 
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="flex-1 lg:w-48 glassmorphism px-4 py-3 rounded-2xl font-bold text-slate-900 border border-slate-200 outline-none"
            >
              {exams.length > 0 ? exams.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              )) : <option>No Exams</option>}
            </select>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="flex-1 lg:w-40 glassmorphism px-4 py-3 rounded-2xl font-bold text-slate-900 border border-slate-200 outline-none"
            >
              {subjects.length > 0 ? subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              )) : <option value="">All Subjects</option>}
            </select>
          </div>
        )}
      </div>

      {/* Status Banner */}
      {batchStatus && !isReadOnly && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border font-bold text-sm ${getStatusBadge(batchStatus).style}`}>
          {getStatusBadge(batchStatus).icon}
          <span>Grade Status: <span className="uppercase tracking-widest text-[10px]">{getStatusBadge(batchStatus).label}</span></span>
          {batchStatus === 'rejected' && <span className="text-xs font-medium ml-2">— Admin has requested corrections. Please review and resubmit.</span>}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Statistics Widgets */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glassmorphism p-6 rounded-[2rem] border border-white/50 bg-white/40">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <BarChart3 size={20} />
              </div>
              <h4 className="font-bold text-slate-900 tracking-tight">Class Stats</h4>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-bold uppercase tracking-widest text-[10px]">Average Score</span>
                <span className="text-xl font-display font-bold text-slate-900">{stats.avg}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-bold uppercase tracking-widest text-[10px]">Highest Marks</span>
                <span className="text-xl font-display font-bold text-emerald-600">{stats.high}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-bold uppercase tracking-widest text-[10px]">Failure Rate</span>
                <span className="text-xl font-display font-bold text-rose-500">{stats.failRate}%</span>
              </div>
            </div>
          </div>

          {!isReadOnly && (
            <div className="space-y-3">
              <div className="glassmorphism p-6 rounded-[2rem] border border-white/50 bg-white/40">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                    <AlertCircle size={20} />
                  </div>
                  <h4 className="font-bold text-slate-900 tracking-tight">Pending</h4>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  <span className="font-bold text-slate-900">{stats.pending}</span> students without marks in <span className="font-bold">{selectedSubject || 'this subject'}</span>.
                </p>
              </div>

              <button 
                onClick={() => {
                  const exportData = students.map(s => ({
                    Name: s.full_name,
                    Roll_No: s.roll_no,
                    Subject: selectedSubject,
                    Marks: marks[s.id] || 0,
                    Comments: comments[s.id] || ''
                  }))
                  downloadCSV(exportData, `grades_${selectedSubject}_${selectedClassId}`)
                }}
                className="w-full bg-white text-slate-700 px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm mb-3"
              >
                <Download size={18} /> Export Gradebook
              </button>
            </div>
          )}

          {/* Action Buttons for Staff */}
          {!isReadOnly && (
            <div className="space-y-3">
              {canEdit && (
                <>
                  <button 
                    onClick={() => handleSaveGrades(false)}
                    disabled={isSaving || !selectedExam || !selectedSubject}
                    className="w-full bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Draft
                  </button>

                  {role === 'teacher' && (
                    <button 
                      onClick={() => handleSaveGrades(true)}
                      disabled={isSaving || !selectedExam || !selectedSubject || Object.keys(marks).length === 0}
                      className="w-full bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                    >
                      <Send size={18} /> Submit for Approval
                    </button>
                  )}
                </>
              )}

              {role === 'admin' && batchStatus === 'submitted' && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleApproveReject('approved')}
                    disabled={isSaving}
                    className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 text-sm"
                  >
                    <ShieldCheck size={16} /> Approve
                  </button>
                  <button 
                    onClick={() => handleApproveReject('rejected')}
                    disabled={isSaving}
                    className="flex-1 bg-rose-600 text-white px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-500 transition-all shadow-lg shadow-rose-100 disabled:opacity-50 text-sm"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Grade Entry / View Table */}
        <div className="xl:col-span-3">
          <div className="glassmorphism rounded-[2.5rem] border border-white/50 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/5 border-b border-slate-200">
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-1/3">Student</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center w-24">Marks</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {isReadOnly ? 'Grade' : 'Teacher Comments'}
                  </th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-slate-300" size={40} />
                    </td>
                  </tr>
                ) : students.length > 0 ? students.map((student) => {
                  const studentStatus = gradeStatuses[student.id] || 'draft'
                  const badge = getStatusBadge(studentStatus)
                  const studentMarks = marks[student.id]

                  // For students/parents: only show approved grades
                  if (isReadOnly && studentStatus !== 'approved' && studentMarks !== undefined) {
                    return null // hide non-approved grades from students/parents
                  }

                  return (
                    <tr key={student.id} className="hover:bg-white/40 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200 font-display overflow-hidden">
                            {student.avatar_url 
                              ? <img src={student.avatar_url} className="w-full h-full object-cover" alt="" />
                              : student.full_name?.charAt(0)
                            }
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 tracking-tight">{student.full_name}</p>
                            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Roll: {student.roll_no || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {canEdit ? (
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={marks[student.id] ?? ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? undefined : Number(e.target.value)
                              setMarks(prev => {
                                const next = { ...prev }
                                if (val === undefined) delete next[student.id]
                                else next[student.id] = val
                                return next
                              })
                            }}
                            className={`w-20 text-center glassmorphism border rounded-xl px-2 py-2 font-display font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-colors ${
                              (marks[student.id] || 0) < 40 ? 'border-rose-200 text-rose-600 bg-rose-50/30' :
                              (marks[student.id] || 0) >= 80 ? 'border-emerald-200 text-emerald-600 bg-emerald-50/30' :
                              'border-slate-200 text-slate-900'
                            }`}
                            placeholder="0"
                          />
                        ) : (
                          <span className={`text-xl font-display font-bold ${
                            (studentMarks || 0) < 40 ? 'text-rose-600' :
                            (studentMarks || 0) >= 80 ? 'text-emerald-600' :
                            'text-slate-900'
                          }`}>
                            {studentMarks !== undefined ? studentMarks : '—'}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        {canEdit ? (
                          <input 
                            type="text"
                            placeholder="Ex: Excellent progress..."
                            value={comments[student.id] || ''}
                            onChange={(e) => setComments(prev => ({ ...prev, [student.id]: e.target.value }))}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-medium focus:bg-white focus:border-slate-300 transition-all outline-none"
                          />
                        ) : (
                          <div>
                            {studentMarks !== undefined && (
                              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                (studentMarks || 0) >= 80 ? 'bg-emerald-50 text-emerald-600' :
                                (studentMarks || 0) >= 60 ? 'bg-amber-50 text-amber-600' :
                                (studentMarks || 0) >= 40 ? 'bg-slate-100 text-slate-600' :
                                'bg-rose-50 text-rose-600'
                              }`}>
                                {(studentMarks || 0) >= 80 ? 'A' : (studentMarks || 0) >= 60 ? 'B' : (studentMarks || 0) >= 40 ? 'C' : 'F'}
                              </span>
                            )}
                            {comments[student.id] && (
                              <p className="text-xs text-slate-500 font-medium mt-1">{comments[student.id]}</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${badge.style}`}>
                          {badge.icon} {badge.label}
                        </span>
                      </td>
                    </tr>
                  )
                }).filter(Boolean) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                        <GraduationCap size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-bold">
                        {isReadOnly ? 'No approved results found for this exam.' : 'No students found in this class.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
