'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, Search, Users, BookOpen, MoreVertical, 
  GraduationCap, X, Loader2, User, CheckCircle2, AlertCircle,
  Trash2, Edit, ExternalLink
} from 'lucide-react'

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [newClass, setNewClass] = useState({
    name: '',
    teacher_id: '',
    grade: 'Grade 5',
    section: 'A',
    subjects: ''
  })
  
  const supabase = createClient()

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setUserRole(profile?.role || 'teacher')
      }
      
      await Promise.all([
        fetchClasses(),
        fetchTeachers()
      ])
    } catch (err) {
      console.error("Error fetching initial data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user.id).single()

      const { data, error } = await supabase
        .from('classes')
        .select('*, profiles(full_name)')
        .eq('school_id', profile?.school_id)
        .order('name')
      
      if (error) throw error

      // 2. Fetch Student counts for these classes
      const { data: studentData } = await supabase
        .from('students')
        .select('grade, section')
        .eq('school_id', profile?.school_id)

      const classesWithCounts = (data || []).map(cls => ({
        ...cls,
        studentCount: studentData?.filter(s => s.grade === cls.grade && s.section === cls.section).length || 0
      }))

      setClasses(classesWithCounts)
    } catch (err) {
      console.error("Classes: Fetch error:", err)
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class? This will not delete students but they will lose their class association.')) return
    
    try {
      const { error } = await supabase.from('classes').delete().eq('id', id)
      if (error) throw error
      alert('Class deleted successfully')
      fetchClasses()
    } catch (err: any) {
      alert('Failed to delete class: ' + err.message)
    }
  }

  const fetchTeachers = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user?.id).single()

    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('school_id', profile?.school_id)
      .eq('role', 'teacher')
    
    setTeachers(data || [])
    if (data?.length) setNewClass(prev => ({ ...prev, teacher_id: data[0].id }))
  }

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user?.id).single()

      if (profile?.role !== 'admin') {
        alert('Permission Denied: Only administrators can create classes.')
        setIsSaving(false)
        return
      }

      const subjectsArray = newClass.subjects.split(',').map(s => s.trim()).filter(s => s !== '')

      const { error } = await supabase
        .from('classes')
        .insert({
          name: newClass.name,
          teacher_id: newClass.teacher_id,
          grade: newClass.grade,
          section: newClass.section,
          subjects: subjectsArray,
          school_id: profile?.school_id
        })

      if (error) {
        alert('Failed to add class: ' + error.message)
      } else {
        setShowAddModal(false)
        fetchClasses()
        setNewClass({ name: '', teacher_id: teachers[0]?.id || '', grade: 'Grade 5', section: 'A', subjects: '' })
      }
    } catch (err) {
      console.error("Error adding class:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter">Classes & Sections</h3>
          <p className="text-slate-500 font-bold text-sm">Manage academic groups, teachers, and student allocations.</p>
        </div>
        {userRole === 'admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={20} /> Create New Class
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:flex items-center gap-4">
        <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all"
            placeholder="Search classes or teachers..."
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center">
             <Loader2 className="animate-spin text-slate-300" size={48} />
          </div>
        ) : classes.length > 0 ? classes.map((cls) => (
          <div key={cls.id} className="glassmorphism p-6 rounded-[2.5rem] border border-white/50 hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 bg-indigo-500`} />
            
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-700 shadow-sm font-bold text-lg`}>
                <GraduationCap size={24} />
              </div>
              <button className="text-slate-300 hover:text-slate-900 transition-all p-2 rounded-xl hover:bg-white/60">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold text-slate-900 tracking-tight">{cls.name}</h4>
              <p className="text-sm text-slate-500 font-bold flex items-center gap-2">
                <User size={14} className="text-slate-400" /> {cls.profiles?.full_name || 'No Teacher Assigned'}
              </p>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">{cls.grade} | Section {cls.section}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-500">{cls.studentCount || 0} Students</span>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => handleDeleteClass(cls.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Delete Class"
                 >
                    <Trash2 size={16} />
                 </button>
                 <button 
                  onClick={() => setSelectedClass(cls)}
                  className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="View Details"
                 >
                    <ExternalLink size={16} />
                 </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {cls.subjects?.slice(0, 3).map((sub: string) => (
                <span key={sub} className="px-2 py-1 bg-white/50 border border-slate-200 text-[10px] font-extrabold rounded-lg text-slate-600 uppercase tracking-tighter">
                  {sub}
                </span>
              ))}
              {cls.subjects?.length > 3 && (
                <span className="px-2 py-1 bg-slate-100 text-[10px] font-extrabold rounded-lg text-slate-400">
                  +{cls.subjects.length - 3}
                </span>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto opacity-50">
                <GraduationCap size={32} className="text-slate-300" />
             </div>
             <p className="text-slate-500 font-bold tracking-tight">No classes found. Create your first class to get started.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <form onSubmit={handleAddClass} className="w-full max-w-xl glassmorphism p-8 md:p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900">Create New Class</h2>
                 <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 transition-all bg-white shadow-sm p-2 rounded-xl">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Class Name</label>
                  <input 
                    required
                    value={newClass.name}
                    onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900" 
                    placeholder="Ex: Grade 5-A Blue" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Grade</label>
                  <select 
                    value={newClass.grade}
                    onChange={(e) => setNewClass({...newClass, grade: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900 bg-white/80"
                  >
                     {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map(g => (
                       <option key={g}>{g}</option>
                     ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Section</label>
                  <select 
                    value={newClass.section}
                    onChange={(e) => setNewClass({...newClass, section: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900 bg-white/80"
                  >
                     {['A', 'B', 'C', 'D'].map(s => (
                       <option key={s}>{s}</option>
                     ))}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Assigned Teacher</label>
                  <select 
                    required
                    value={newClass.teacher_id}
                    onChange={(e) => setNewClass({...newClass, teacher_id: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900 bg-white/80"
                  >
                     <option value="">Select Teacher</option>
                     {teachers.map(t => (
                       <option key={t.id} value={t.id}>{t.full_name}</option>
                     ))}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Subjects (Comma separated)</label>
                  <input 
                    value={newClass.subjects}
                    onChange={(e) => setNewClass({...newClass, subjects: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900" 
                    placeholder="Ex: Math, English, Science" 
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 glassmorphism font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all text-slate-600">Cancel</button>
                <button 
                  disabled={isSaving}
                  type="submit" 
                  className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Create Class'}
                </button>
              </div>
           </form>
        </div>
      )}
      {/* Class Details Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
           <div className="w-full max-w-2xl glassmorphism p-8 md:p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 -mr-32 -mt-32 rounded-full" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 flex-shrink-0">
                       <GraduationCap size={40} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{selectedClass.name}</h2>
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Grade {selectedClass.grade} • Section {selectedClass.section}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedClass(null)} className="text-slate-400 hover:text-slate-900 transition-all bg-white shadow-sm p-2 rounded-xl">
                    <X size={20} />
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-8 relative z-10">
                 <div className="space-y-4">
                    <div>
                       <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Class Teacher</p>
                       <p className="font-bold text-slate-700 flex items-center gap-2">
                          <User size={14} className="text-slate-400" /> {selectedClass.profiles?.full_name || 'No Teacher Assigned'}
                       </p>
                    </div>
                    <div>
                       <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
                       <p className="font-bold text-slate-700">{selectedClass.studentCount || 0} enrolled</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Created At</p>
                       <p className="font-bold text-slate-700">{new Date(selectedClass.created_at).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div>
                       <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Subjects</p>
                       <div className="flex flex-wrap gap-2 mt-2">
                          {selectedClass.subjects?.map((sub: string) => (
                             <span key={sub} className="px-2 py-1 bg-white border border-slate-100 text-[10px] font-bold rounded-lg text-slate-600 uppercase tracking-widest shadow-sm">
                                {sub}
                             </span>
                          )) || <p className="text-xs text-slate-400 font-medium italic">No subjects assigned</p>}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 flex gap-4 relative z-10">
                 <button 
                  onClick={() => {
                    handleDeleteClass(selectedClass.id)
                    setSelectedClass(null)
                  }}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                 >
                    <Trash2 size={16} /> Delete Class
                 </button>
                 <button className="flex-1 px-6 py-3 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                    <Edit size={16} /> Edit Class
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
