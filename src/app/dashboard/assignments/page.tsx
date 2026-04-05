'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, Clock, Users, BookOpen, Send, 
  MoreVertical, X, Loader2, Save, Calendar as CalendarIcon,
  CheckCircle2, AlertCircle, Upload
} from 'lucide-react'
import Link from 'next/link'

export default function AssignmentsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [assignments, setAssignments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [profile, setProfile] = useState<any>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [submissionContent, setSubmissionContent] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    class_id: '',
    subject: '',
    due_date: '',
    description: '',
    max_points: 100
  })

  const supabase = createClient()

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

      // 1. Fetch Classes for dropdown
      if (profileData?.role === 'admin') {
        const { data: classData } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', profileData?.school_id)
          .order('name')
        setClasses(classData || [])
        if (classData?.length) setFormData(prev => ({ ...prev, class_id: classData[0].id }))
      } else if (profileData?.role === 'teacher') {
        const { data: teacherSubjects } = await supabase
          .from('timetable')
          .select('subject, class_id, classes(name)')
          .eq('teacher_id', user.id)
        
        const mappedClasses = (teacherSubjects || []).map((ts: any) => ({
          id: ts.class_id,
          name: `${ts.classes?.name || 'Class'} - ${ts.subject}`,
          subject_name: ts.subject
        }))
        
        setClasses(mappedClasses)
        if (mappedClasses.length) {
          setFormData(prev => ({ ...prev, class_id: mappedClasses[0].id, subject: mappedClasses[0].subject_name }))
        }
      }

      // 2. Fetch Assignments
      let assignmentQuery = supabase
        .from('assignments')
        .select('*, classes(name)')
        .eq('school_id', profileData?.school_id)


      if (profileData?.role === 'student') {
        const { data: student } = await supabase.from('students').select('grade, section').eq('user_id', user?.id).single()
        if (student) {
          const { data: cls } = await supabase.from('classes').select('id').eq('school_id', profileData.school_id).eq('grade', student.grade).eq('section', student.section).maybeSingle()
          if (cls) {
            assignmentQuery = assignmentQuery.eq('class_id', cls.id)
          }
        }
      }

      if (profileData?.role === 'parent') {
        const { data: children } = await supabase.from('students').select('grade, section').eq('parent_id', user?.id)
        if (children && children.length > 0) {
          const gradeSections = children.map(c => `(grade.eq.${c.grade},section.eq.${c.section})`).join(',')
          const { data: classIds } = await supabase.from('classes')
            .select('id')
            .eq('school_id', profileData.school_id)
            .or(gradeSections)
          
          if (classIds && classIds.length > 0) {
            assignmentQuery = assignmentQuery.in('class_id', classIds.map(c => c.id))
          }
        }
      }

      if (profileData?.role === 'teacher') {
        assignmentQuery = assignmentQuery.eq('teacher_id', user.id)
      }

      assignmentQuery = assignmentQuery.order('created_at', { ascending: false })
      
      const { data: assignmentData, error: aError } = await assignmentQuery
      
      if (aError) {
        console.error("Assignment Query Error:", aError.message)
        if (aError.message.includes('relation "assignments" does not exist')) {
          console.error("CRITICAL: 'assignments' table is missing. Run SQL in database_schema.md")
        }
      } else {
        setAssignments(assignmentData || [])
      }
    } catch (err) {
      console.error("Assignments: Fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user?.id).single()

      const { max_points, status, subject, ...dataToInsert } = formData;
      const { error } = await supabase
        .from('assignments')
        .insert({
          ...dataToInsert,
          school_id: profile?.school_id,
          teacher_id: user?.id
        })

      if (error) {
        alert('Failed to post assignment: ' + error.message)
      } else {
        setShowCreateModal(false)
        fetchInitialData()
        setFormData({ title: '', class_id: classes[0]?.id || '', subject: classes[0]?.subject_name || '', due_date: '', description: '', max_points: 100 })
      }
    } catch (err) {
      console.error("Error creating assignment:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter italic">Academic Tasks</h3>
          <p className="text-slate-500 font-bold text-sm">Distribute and track assignments across your classes.</p>
        </div>
        {profile?.role !== 'parent' && profile?.role !== 'student' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={20} /> New Assignment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
             <Loader2 className="animate-spin mx-auto text-slate-200" size={64} />
             <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Academic Records...</p>
          </div>
        ) : assignments.length > 0 ? assignments.map((assignment, i) => (
          <div key={i} className="glassmorphism p-8 rounded-[3rem] border border-white/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:scale-[1.01] transition-all cursor-pointer relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-slate-900 opacity-0 group-hover:opacity-100 transition-all" />
            
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold rounded-full uppercase tracking-tighter border border-indigo-100`}>
                  {assignment.classes?.name || 'Class N/A'}
                </span>
                {assignment.subject && (
                  <span className={`px-3 py-1 bg-sky-50 text-sky-700 text-[10px] font-extrabold rounded-full uppercase tracking-widest border border-sky-100`}>
                    {assignment.subject}
                  </span>
                )}
                <span className={`px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-extrabold rounded-full uppercase tracking-widest`}>
                  {assignment.status}
                </span>
              </div>
              <h4 className="text-2xl font-display font-bold text-slate-900 tracking-tight leading-tight">{assignment.title}</h4>
              <p className="text-sm text-slate-500 font-medium line-clamp-2">{assignment.description}</p>
              
              <div className="flex items-center gap-6 pt-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <CalendarIcon size={14} className="text-rose-400" /> Due: {new Date(assignment.due_date).toLocaleDateString()}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Users size={14} className="text-emerald-400" /> 0 Submissions
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex-1 md:text-right">
                {profile?.role === 'parent' || profile?.role === 'student' ? (
                  <button 
                    onClick={() => { setSelectedAssignment(assignment); setShowSubmitModal(true); }}
                    className="text-emerald-600 text-[10px] font-extrabold uppercase tracking-widest hover:underline flex items-center justify-end gap-2 group/btn"
                  >
                    Submit Work <Upload size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                ) : (
                  <Link href={`/dashboard/assignments/submissions/${assignment.id}`} className="text-indigo-600 text-[10px] font-extrabold uppercase tracking-widest hover:underline flex items-center justify-end gap-2 group/btn">
                    View Submissions <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
              <button className="text-slate-300 hover:text-slate-900 transition-colors p-3 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 shadow-sm">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center space-y-4 opacity-50">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <BookOpen size={40} className="text-slate-300" />
             </div>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active assignments found.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
           <form onSubmit={handleCreateAssignment} className="w-full max-w-2xl glassmorphism p-10 md:p-14 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 -mr-16 -mt-16 rounded-full opacity-50" />
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                 <div>
                    <h2 className="text-3xl font-display font-bold tracking-tighter text-slate-900 italic">Publish Assignment</h2>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Distribute academic tasks to your class</p>
                 </div>
                 <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-900 transition-all bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                   <X size={20} />
                 </button>
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1">Assignment Title</label>
                    <input 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-800 placeholder:text-slate-300" 
                      placeholder="Ex: First Term Science Project" 
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1">Target Class</label>
                    <select 
                      required
                      value={formData.class_id}
                      onChange={(e) => {
                        const selectedCls = classes.find(c => c.id === e.target.value)
                        setFormData({
                          ...formData, 
                          class_id: e.target.value,
                          subject: selectedCls?.subject_name || formData.subject
                        })
                      }}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-800 bg-white/80"
                    >
                       <option value="">{classes.length > 0 ? 'Select Class (Subject)' : 'No Subjects Assigned'}</option>
                       {classes.map((c, idx) => (
                         <option key={idx} value={c.id}>{c.name}</option>
                       ))}
                    </select>
                    {classes.length === 0 && (
                      <div className="text-[10px] font-bold text-rose-500 ml-1">
                        You have not been assigned any subjects yet. Contact your admin to add you in the Timetable.
                      </div>
                    )}
                  </div>
                  
                  {profile?.role === 'admin' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1">Subject Name</label>
                      <input 
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-100 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-800 placeholder:text-slate-300" 
                        placeholder="Ex: Mathematics" 
                      />
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1">Submission Deadline</label>
                    <input 
                      type="date" 
                      required
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-800" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1">Task Instructions</label>
                  <textarea 
                    rows={4} 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-800 placeholder:text-slate-300" 
                    placeholder="Provide detailed instructions for the students..." 
                  />
                </div>
                
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 glassmorphism font-bold py-5 rounded-2xl hover:bg-slate-50 transition-all text-slate-500 uppercase tracking-widest text-xs">Discard</button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-[2] bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Post Assignment
                  </button>
                </div>
              </div>
           </form>
        </div>
      )}

      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
           <div className="w-full max-w-xl glassmorphism p-10 md:p-14 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 relative z-10">
                 <div>
                    <h2 className="text-2xl font-display font-bold text-slate-900 italic">Submit Work</h2>
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">For: {selectedAssignment.title}</p>
                 </div>
                 <button onClick={() => setShowSubmitModal(false)} className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm text-slate-400 hover:text-slate-900 transition-all"><X size={20}/></button>
              </div>
              <div className="space-y-6 relative z-10">
                 <div className="space-y-2">
                   <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1">Your Submission / Link</label>
                   <textarea 
                     rows={4}
                     value={submissionContent}
                     onChange={(e) => setSubmissionContent(e.target.value)}
                     className="w-full px-5 py-4 rounded-2xl border border-slate-100 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-800 placeholder:text-slate-300"
                     placeholder="Paste your document link or write your submission here..."
                   />
                 </div>
                 <button 
                   disabled={isSaving || !submissionContent.trim()}
                   onClick={async () => {
                     setIsSaving(true)
                     const { data: { user } } = await supabase.auth.getUser()
                     
                     // Helper: if parent is submitting, find their student id 
                     const { data: student } = await supabase.from('students').select('id').eq('parent_id', user?.id).limit(1).single()
                     const studentIdToSubmit = student ? student.id : user?.id

                     const { error } = await supabase.from('assignment_submissions').upsert({
                       assignment_id: selectedAssignment.id,
                       student_id: studentIdToSubmit,
                       content: submissionContent,
                       status: 'submitted'
                     }, { onConflict: 'assignment_id, student_id' })

                     if (error) alert(error.message)
                     else {
                       alert('Submitted successfully!')
                       setShowSubmitModal(false)
                       setSubmissionContent('')
                     }
                     setIsSaving(false)
                   }}
                   className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                 >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18}/>}
                    Turn In Assignment
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
