'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, Calendar, ClipboardCheck, Loader2, X, 
  FileText, CheckCircle2, Clock, AlertCircle,
  Trash2, ChevronDown, GraduationCap, BookOpen, Search
} from 'lucide-react'

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filteredClasses, setFilteredClasses] = useState<any[]>([])

  const [newExam, setNewExam] = useState({
    title: '',
    exam_type: 'midterm',
    description: '',
    start_date: '',
    end_date: '',
    status: 'upcoming',
    selectedClasses: [] as string[]
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

      const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user.id).single()
      setUserRole(profile?.role || 'teacher')
      setSchoolId(profile?.school_id)
      setUserId(user.id)

      // Fetch exams
      const { data: examData } = await supabase
        .from('exams')
        .select('*')
        .eq('school_id', profile?.school_id)
        .order('created_at', { ascending: false })
      setExams(examData || [])

      // Fetch classes
      const { data: classData } = await supabase
        .from('classes')
        .select('*, profiles(full_name)')
        .eq('school_id', profile?.school_id)
        .order('name')
      setClasses(classData || [])
      setFilteredClasses(classData || [])

    } catch (err) {
      console.error("Exams fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchExamClasses = async (examId: string) => {
    const { data } = await supabase
      .from('exam_classes')
      .select('class_id')
      .eq('exam_id', examId)
    return data?.map(ec => ec.class_id) || []
  }

  const handleViewExam = async (exam: any) => {
    const linkedClasses = await fetchExamClasses(exam.id)
    setSelectedExam({ ...exam, linkedClasses })
  }

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExam.title) { setError('Exam title is required'); return }
    setIsSaving(true)
    setError(null)

    try {
      // 1. Create the exam
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .insert({
          title: newExam.title,
          exam_type: newExam.exam_type,
          description: newExam.description,
          start_date: newExam.start_date || null,
          end_date: newExam.end_date || null,
          status: newExam.status,
          school_id: schoolId,
          created_by: userId
        })
        .select()
        .single()

      if (examError) throw examError

      // 2. Link to selected classes
      if (newExam.selectedClasses.length > 0 && examData) {
        const links = newExam.selectedClasses.map(classId => ({
          exam_id: examData.id,
          class_id: classId
        }))

        const { error: linkError } = await supabase
          .from('exam_classes')
          .insert(links)

        if (linkError) console.error("Error linking classes:", linkError)
      }

      alert('Exam created successfully!')
      setShowCreateModal(false)
      setNewExam({ title: '', exam_type: 'midterm', description: '', start_date: '', end_date: '', status: 'upcoming', selectedClasses: [] })
      fetchInitialData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Delete this exam? All linked grades will also be removed.')) return
    const { error } = await supabase.from('exams').delete().eq('id', examId)
    if (error) alert('Failed: ' + error.message)
    else { fetchInitialData(); setSelectedExam(null) }
  }

  const toggleClassSelection = (classId: string) => {
    setNewExam(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter(id => id !== classId)
        : [...prev.selectedClasses, classId]
    }))
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-amber-50 text-amber-700 border-amber-100'
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'completed': return 'bg-slate-100 text-slate-600 border-slate-200'
      default: return 'bg-slate-50 text-slate-500 border-slate-100'
    }
  }

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = { midterm: 'Midterm', final: 'Final Term', unit_test: 'Unit Test', monthly: 'Monthly Test', assignment: 'Assignment' }
    return map[type] || type
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter">Exam Management</h3>
          <p className="text-slate-500 font-bold text-sm">Create exams, assign to classes, and track grade submission progress.</p>
        </div>
        {userRole === 'admin' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={20} /> Create Exam
          </button>
        )}
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="animate-spin text-slate-300" size={48} />
          </div>
        ) : exams.length > 0 ? exams.map((exam) => (
          <div 
            key={exam.id} 
            onClick={() => handleViewExam(exam)}
            className="glassmorphism p-7 rounded-[2.5rem] border border-white/50 hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 bg-indigo-500" />
            
            <div className="flex justify-between items-start mb-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                exam.exam_type === 'final' ? 'bg-rose-50 text-rose-600' :
                exam.exam_type === 'midterm' ? 'bg-indigo-50 text-indigo-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                <ClipboardCheck size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(exam.status)}`}>
                {exam.status}
              </span>
            </div>

            <div className="space-y-1 mb-4">
              <h4 className="text-lg font-bold text-slate-900 tracking-tight">{exam.title}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{getTypeLabel(exam.exam_type || 'midterm')}</p>
            </div>

            {exam.description && (
              <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4">{exam.description}</p>
            )}

            <div className="pt-4 border-t border-slate-100/50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                <Calendar size={14} />
                {exam.start_date ? new Date(exam.start_date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }) : 'No date'}
                {exam.end_date && ` – ${new Date(exam.end_date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}`}
              </div>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">View →</span>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto opacity-50">
              <ClipboardCheck size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold tracking-tight">No exams created yet.</p>
            {userRole === 'admin' && <p className="text-sm text-slate-400">Click "Create Exam" to schedule your first examination.</p>}
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <form onSubmit={handleCreateExam} className="w-full max-w-2xl glassmorphism p-8 md:p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium mb-6">{error}</div>
            )}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900">Create New Exam</h2>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-900 transition-all bg-white shadow-sm p-2 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Exam Title</label>
                  <input 
                    required
                    value={newExam.title}
                    onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900"
                    placeholder="Ex: Term 1 Midterm Examination 2026"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Exam Type</label>
                  <select 
                    value={newExam.exam_type}
                    onChange={(e) => setNewExam({...newExam, exam_type: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900 bg-white/80"
                  >
                    <option value="midterm">Midterm</option>
                    <option value="final">Final Term</option>
                    <option value="unit_test">Unit Test</option>
                    <option value="monthly">Monthly Test</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    value={newExam.status}
                    onChange={(e) => setNewExam({...newExam, status: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900 bg-white/80"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active (In Progress)</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input 
                    type="date"
                    value={newExam.start_date}
                    onChange={(e) => setNewExam({...newExam, start_date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                  <input 
                    type="date"
                    value={newExam.end_date}
                    onChange={(e) => setNewExam({...newExam, end_date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                  <textarea 
                    value={newExam.description}
                    onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-900"
                    placeholder="Coverage details, instructions for invigilators..."
                    rows={2}
                  />
                </div>

                {/* Class Selection */}
                <div className="space-y-3 md:col-span-2">
                  <div className="flex justify-between items-end gap-4 ml-1">
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Assign to Classes</label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setNewExam(prev => ({ ...prev, selectedClasses: classes.map(c => c.id) }))}
                        className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                      >Select All</button>
                      <button 
                        type="button"
                        onClick={() => setNewExam(prev => ({ ...prev, selectedClasses: [] }))}
                        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:underline"
                      >Clear</button>
                    </div>
                  </div>
                  
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text"
                      placeholder="Filter classes by name or grade..."
                      onChange={(e) => {
                        const term = e.target.value.toLowerCase()
                        const filtered = classes.filter(cls => 
                          cls.name.toLowerCase().includes(term) || 
                          cls.grade.toLowerCase().includes(term)
                        )
                        setFilteredClasses(filtered)
                      }}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-100 bg-slate-50/50 text-xs font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredClasses.map(cls => (
                      <button
                        type="button"
                        key={cls.id}
                        onClick={() => toggleClassSelection(cls.id)}
                        className={`p-3 rounded-xl border text-left text-sm font-bold transition-all ${
                          newExam.selectedClasses.includes(cls.id)
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200'
                            : 'bg-white/50 text-slate-600 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <p className="truncate">{cls.name}</p>
                        <p className={`text-[10px] uppercase tracking-widest mt-0.5 ${
                          newExam.selectedClasses.includes(cls.id) ? 'text-slate-300' : 'text-slate-400'
                        }`}>{cls.grade} • {cls.section}</p>
                      </button>
                    ))}
                    {filteredClasses.length === 0 && <p className="col-span-full text-sm text-slate-400 italic py-4 text-center">No matching classes found.</p>}
                  </div>
                  {newExam.selectedClasses.length > 0 && (
                    <p className="text-xs text-indigo-600 font-bold">{newExam.selectedClasses.length} class(es) selected total</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 glassmorphism font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all text-slate-600">Cancel</button>
              <button 
                disabled={isSaving}
                type="submit" 
                className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Create Exam'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exam Details Modal */}
      {selectedExam && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
          <div className="w-full max-w-2xl glassmorphism p-8 md:p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 -mr-32 -mt-32 rounded-full" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  selectedExam.exam_type === 'final' ? 'bg-rose-50 text-rose-600' :
                  selectedExam.exam_type === 'midterm' ? 'bg-indigo-50 text-indigo-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  <ClipboardCheck size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">{selectedExam.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{getTypeLabel(selectedExam.exam_type || 'midterm')}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(selectedExam.status)}`}>
                      {selectedExam.status}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedExam(null)} className="text-slate-400 hover:text-slate-900 transition-all bg-white shadow-sm p-2 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Start Date</p>
                  <p className="font-bold text-slate-700">{selectedExam.start_date ? new Date(selectedExam.start_date).toLocaleDateString('en-PK', { year:'numeric', month:'long', day:'numeric' }) : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">End Date</p>
                  <p className="font-bold text-slate-700">{selectedExam.end_date ? new Date(selectedExam.end_date).toLocaleDateString('en-PK', { year:'numeric', month:'long', day:'numeric' }) : 'Not set'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Description</p>
                  <p className="font-bold text-slate-700 text-sm leading-relaxed">{selectedExam.description || 'No description provided.'}</p>
                </div>
              </div>
            </div>

            {/* Linked Classes */}
            <div className="mt-8 relative z-10">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Assigned Classes</p>
              <div className="flex flex-wrap gap-2">
                {selectedExam.linkedClasses?.length > 0 ? (
                  selectedExam.linkedClasses.map((classId: string) => {
                    const cls = classes.find(c => c.id === classId)
                    return cls ? (
                      <span key={classId} className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
                        {cls.name} <span className="text-slate-400">({cls.grade})</span>
                      </span>
                    ) : null
                  })
                ) : (
                  <p className="text-sm text-slate-400 italic font-medium">No classes assigned to this exam.</p>
                )}
              </div>
            </div>

            {userRole === 'admin' && (
              <div className="mt-10 pt-8 border-t border-slate-100 flex gap-4 relative z-10">
                <button 
                  onClick={() => handleDeleteExam(selectedExam.id)}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Delete Exam
                </button>
                <button className="flex-1 px-6 py-3 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                  <FileText size={16} /> View Grades
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
