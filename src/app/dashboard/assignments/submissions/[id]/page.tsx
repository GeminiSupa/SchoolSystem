'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, CheckCircle2, Clock, Download, 
  Loader2, Save, Send, Upload, FileText 
} from 'lucide-react'
import Link from 'next/link'

export default function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const assignmentId = resolvedParams.id
  
  const [assignment, setAssignment] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<Record<string, any>>({})
  const [grades, setGrades] = useState<Record<string, number | ''>>({})
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [assignmentId])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // 1. Fetch assignment details
      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*, classes(name)')
        .eq('id', assignmentId)
        .single()
      
      setAssignment(assignmentData)
      
      if (!assignmentData) {
        setIsLoading(false)
        return
      }

      // 2. Fetch students in that class
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('grade', assignmentData.classes?.name?.split('-')[0]) // basic matching for demo
        .order('full_name')
      
      setStudents(studentData || [])

      // 3. Fetch submissions for this assignment
      const { data: subData } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
      
      const subMap: Record<string, any> = {}
      const grdMap: Record<string, number | ''> = {}
      const fbkMap: Record<string, string> = {}
      
      subData?.forEach(s => {
        subMap[s.student_id] = s
        grdMap[s.student_id] = s.grade || ''
        fbkMap[s.student_id] = s.feedback || ''
      })
      
      setSubmissions(subMap)
      setGrades(grdMap)
      setFeedback(fbkMap)
      
    } catch (err) {
      console.error("Error fetching submissions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveGrades = async () => {
    setIsSaving(true)
    try {
      // Create updates for any student that has a grade or feedback typed in
      const updates = students.map(s => {
        const hasSub = submissions[s.id]
        if (grades[s.id] !== undefined || feedback[s.id] !== undefined) {
           return {
             id: hasSub?.id, // undefined means it'll create a new one via upsert logic or we handle insert
             assignment_id: assignmentId,
             student_id: s.id,
             grade: grades[s.id] || null,
             feedback: feedback[s.id] || '',
             status: 'graded'
           }
        }
        return null
      }).filter(Boolean)

      // Only upsert valid records
      if (updates.length > 0) {
        const { error } = await supabase
          .from('assignment_submissions')
          .upsert(updates, { onConflict: 'assignment_id, student_id' })
        
        if (error) {
           console.error("Grade saving error:", error)
           alert("Error saving grades: " + error.message)
        } else {
           fetchData()
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-slate-300" size={40} />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Assignment not found</h2>
        <Link href="/dashboard/assignments" className="text-indigo-600 hover:underline">Return to Assignments</Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <Link href="/dashboard/assignments" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest mb-4">
             <ArrowLeft size={14} /> Back to Assignments
          </Link>
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter">{assignment.title}</h3>
          <p className="text-slate-500 font-bold text-sm mt-1">Class: {assignment.classes?.name} | Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
        </div>
        <button 
          onClick={handleSaveGrades}
          disabled={isSaving}
          className="w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Save Grading
        </button>
      </div>

      <div className="glassmorphism rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/5 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[30%]">Student</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[20%]">Submission</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center w-[15%]">Grade (/{assignment.max_points})</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Feedback / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length > 0 ? students.map((student) => {
                const sub = submissions[student.id]
                const isSubmitted = sub && sub.status !== 'returned' && (sub.content || sub.attachment_url)
                
                return (
                  <tr key={student.id} className="hover:bg-white/40 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                          {student.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none">{student.full_name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Roll: {student.roll_no || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {isSubmitted ? (
                        <div className="flex flex-col items-start gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-emerald-100">
                            <CheckCircle2 size={12} /> Received
                          </span>
                          {sub.attachment_url && (
                            <a 
                              href={sub.attachment_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-bold hover:bg-indigo-100 transition-all border border-indigo-100 max-w-[160px]"
                            >
                               <FileText size={12} />
                               <span className="truncate">{sub.attachment_name || 'View Work'}</span>
                               <Download size={10} />
                            </a>
                          )}
                          {sub.content && (
                            <div className="text-[10px] text-slate-500 font-medium truncate max-w-[150px] italic">"{sub.content}"</div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-amber-100">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <input 
                         type="number"
                         min="0"
                         max={assignment.max_points}
                         value={grades[student.id] ?? ''}
                         onChange={(e) => setGrades(prev => ({ ...prev, [student.id]: Number(e.target.value) }))}
                         className="w-20 text-center glassmorphism border border-slate-200 rounded-xl px-2 py-2 font-display font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
                         placeholder="—"
                      />
                    </td>
                    <td className="px-8 py-5">
                      <input 
                         type="text"
                         value={feedback[student.id] || ''}
                         onChange={(e) => setFeedback(prev => ({ ...prev, [student.id]: e.target.value }))}
                         placeholder="Add feedback..."
                         className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-medium focus:bg-white focus:border-slate-300 transition-all outline-none"
                      />
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={4} className="text-center py-20 text-slate-500">
                     No students in this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
