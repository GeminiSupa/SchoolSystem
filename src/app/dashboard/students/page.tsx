'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, Search, Users, BookOpen, MoreVertical, 
  GraduationCap, X, Loader2, User, CheckCircle2, AlertCircle,
  Filter, Download, Trash2, Edit, ExternalLink, Camera, Wand2,
  Sparkles, TrendingUp, Info
} from 'lucide-react'
import { FileUpload } from '@/components/ui/file-upload'
import { downloadCSV } from '@/lib/utils/export'

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [parents, setParents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [newStudent, setNewStudent] = useState({ 
    full_name: '', 
    grade: '', 
    section: 'A', 
    roll_no: '',
    parent_phone: '',
    dob: '',
    address: '',
    avatar_url: '',
    parent_id: '',
  })
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [riskAlerts, setRiskAlerts] = useState<any[]>([])
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleAnalyzeRisk = async () => {
    if (students.length === 0) return
    setIsAnalyzingRisk(true)
    try {
      const res = await fetch('/api/ai/analyze-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: students.slice(0, 10) }) // Analyze first 10 for demo
      })
      const data = await res.json()
      setRiskAlerts(data.alerts || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsAnalyzingRisk(false)
    }
  }

  const fetchStudents = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get current user's profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', user.id)
        .single()
      
      setUserRole(profile?.role || 'teacher')

      if (profileError || !profile) {
        console.warn("Profile not found or error fetching profile:", profileError)
        setIsLoading(false)
        return
      }

      // 1. Fetch Classes
      const { data: classData } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('name')
      
      setClasses(classData || [])
      if (classData?.length && !newStudent.grade) {
        setNewStudent(prev => ({ ...prev, grade: classData[0].name }))
      }

      // 2. Fetch Parents
      const { data: parentData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'parent')
        .eq('school_id', profile.school_id)
        .order('full_name')
      
      setParents(parentData || [])

      let query = supabase.from('students').select('*')
      
      // Filter by school_id if available
      if (profile.school_id) {
        query = query.eq('school_id', profile.school_id)
      }
      
      // Filter by parent_id if user is a parent
      if (profile.role === 'parent') {
        query = query.eq('parent_id', user.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) {
        console.error("Supabase Query Error:", error.message)
        // If the error is about a missing column 'parent_id', it means the database needs update
        if (error.message.includes('column "parent_id" does not exist')) {
          console.error("CRITICAL: 'parent_id' column is missing in 'students' table. Please run the SQL in database_schema.md")
        }
      } else {
        setStudents(data || [])
      }
    } catch (err) {
      console.error("Unexpected error in fetchStudents:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get current user's school_id from their profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      alert('Permission Denied: Only administrators can register students.')
      setIsSaving(false)
      return
    }

    const { error } = await supabase
      .from('students')
      .insert({
        ...newStudent,
        school_id: profile?.school_id,
        status: 'active'
      })

    if (error) {
      alert('Failed to add student: ' + error.message)
    } else {
      setShowAddModal(false)
      fetchStudents()
      setNewStudent({ 
        full_name: '', 
        grade: 'Grade 5', 
        section: 'A', 
        roll_no: '', 
        parent_phone: '',
        dob: '',
        address: '',
        avatar_url: '',
        parent_id: ''
      })
    }
    setIsSaving(false)
  }

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    const { error } = await supabase
      .from('students')
      .update({
        full_name: editingStudent.full_name,
        grade: editingStudent.grade,
        section: editingStudent.section,
        roll_no: editingStudent.roll_no,
        parent_phone: editingStudent.parent_phone,
        dob: editingStudent.dob,
        address: editingStudent.address,
        avatar_url: editingStudent.avatar_url,
        parent_id: editingStudent.parent_id
      })
      .eq('id', editingStudent.id)

    if (error) {
      alert('Failed to update student: ' + error.message)
    } else {
      setEditingStudent(null)
      fetchStudents()
    }
    setIsSaving(false)
  }

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student record?')) return
    
    try {
      const { error } = await supabase.from('students').delete().eq('id', id)
      if (error) throw error
      alert('Student record deleted successfully')
      fetchStudents()
    } catch (err: any) {
      alert('Failed to delete student: ' + err.message)
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tight">Students & Portfolios</h3>
          <p className="text-slate-500 font-medium">Browse student profiles, academic progress, and digital portfolios.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleAnalyzeRisk}
            disabled={isAnalyzingRisk || students.length === 0}
            className="flex-1 md:flex-none bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {isAnalyzingRisk ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            {isAnalyzingRisk ? 'Analyzing...' : 'AI Risk Analysis'}
          </button>
          <button 
            onClick={() => downloadCSV(students, 'student_list')}
            className="flex-1 md:flex-none glassmorphism px-6 py-3 rounded-2xl font-bold text-slate-900 flex items-center justify-center gap-2 hover:bg-white transition-all border border-slate-200"
          >
            <Download size={18} /> Export
          </button>
          {userRole === 'admin' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <Plus size={18} /> New Student
            </button>
          )}
        </div>
      </div>

       {/* AI Risk Alerts Section */}
       {riskAlerts.length > 0 && (
         <div className="space-y-6 animate-in slide-in-from-top duration-500">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                     <AlertCircle size={20} />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-slate-900">AI Predictive Alerts</h2>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Early Intervention Required</p>
                  </div>
               </div>
               <button onClick={() => setRiskAlerts([])} className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Dismiss All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {riskAlerts.map((alert, i) => (
                  <div key={i} className="glassmorphism p-6 rounded-3xl border-l-4 border-l-rose-500 space-y-4 hover:shadow-xl transition-all">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                              {alert.name?.charAt(0)}
                           </div>
                           <div>
                              <p className="font-bold text-slate-900">{alert.name}</p>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest border ${
                                 alert.riskLevel === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                 {alert.riskLevel} Risk
                              </span>
                           </div>
                        </div>
                        <Info size={14} className="text-slate-300" />
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed font-bold">"{alert.reason || alert.riskLevel}"</p>
                     <div className="flex gap-2">
                        <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">Contact Parent</button>
                        <button className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-100 hover:bg-white transition-all">Plan Review</button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
       )}

      <div className="grid grid-cols-1 md:flex items-center gap-4">
        <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold"
            placeholder="Search by student name or Roll No..."
           />
        </div>
        <button className="px-6 py-3 glassmorphism rounded-xl border border-slate-200 font-bold text-slate-600 flex items-center gap-2 hover:bg-white transition-all">
          <Filter size={18} /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center">
             <Loader2 className="animate-spin text-slate-400" size={40} />
          </div>
        ) : students.filter(s => 
            s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.roll_no?.toLowerCase().includes(searchTerm.toLowerCase())
          ).length > 0 ? students.filter(s => 
            s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.roll_no?.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((student) => (
          <div key={student.id} className="glassmorphism p-5 rounded-[2rem] group hover:scale-[1.02] transition-all cursor-pointer border border-white/50">
            <div className="relative w-full aspect-square rounded-[1.5rem] bg-slate-100 mb-4 overflow-hidden border border-slate-200/50 flex items-center justify-center">
              {student.avatar_url ? (
                <img src={student.avatar_url} className="absolute inset-0 w-full h-full object-cover" alt={student.full_name} />
              ) : (
                <div className="text-slate-200 group-hover:scale-110 transition-transform">
                  <User size={80} strokeWidth={1.5} />
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900 leading-tight">{student.full_name}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">{student.grade} | {student.section}</p>
              </div>
              <div className="flex items-center gap-1">
                 <button 
                  onClick={() => handleDeleteStudent(student.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                  title="Delete"
                 >
                    <Trash2 size={14} />
                 </button>
                 <button 
                  onClick={() => setSelectedStudent(student)}
                  className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors" 
                  title="View Details"
                 >
                    <ExternalLink size={14} />
                 </button>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200/50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Roll: {student.roll_no || 'N/A'}</span>
              <span className="flex items-center gap-1">Portfolio (0)</span>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto opacity-50">
                <GraduationCap size={32} className="text-slate-400" />
             </div>
             <p className="text-slate-500 font-medium tracking-tight">No students found. Add your first student to get started.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <form onSubmit={handleAddStudent} className="w-full max-w-xl glassmorphism p-8 md:p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-display font-bold">Register New Student</h2>
                 <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors bg-white/50 p-2 rounded-xl">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 md:col-span-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Profile Photo</label>
                    <FileUpload 
                      bucket="avatars"
                      path="students"
                      currentUrl={newStudent.avatar_url}
                      onUploadComplete={(url) => setNewStudent({...newStudent, avatar_url: url})}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                       <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                        required
                        value={newStudent.full_name}
                        onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold" 
                        placeholder="Ex: Sarah Johnson" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Grade</label>
                    <select 
                      value={newStudent.grade}
                      onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium bg-white/80"
                    >
                       {classes.length > 0 ? classes.map(c => (
                         <option key={c.id} value={c.name}>{c.name}</option>
                       )) : <option value="">No Classes Defined</option>}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Section</label>
                    <select 
                      value={newStudent.section}
                      onChange={(e) => setNewStudent({...newStudent, section: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium bg-white/80"
                    >
                       <option>A</option>
                       <option>B</option>
                       <option>C</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Roll Number</label>
                    <input 
                      value={newStudent.roll_no}
                      onChange={(e) => setNewStudent({...newStudent, roll_no: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
                      placeholder="Ex: 50A-24" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Parent Phone</label>
                    <input 
                      value={newStudent.parent_phone}
                      onChange={(e) => setNewStudent({...newStudent, parent_phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
                      placeholder="+92 300 1234567" 
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Linked Parent User</label>
                    <select 
                      value={newStudent.parent_id || ''}
                      onChange={(e) => setNewStudent({...newStudent, parent_id: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium bg-white/80"
                    >
                      <option value="">-- Do not link parent right now --</option>
                      {parents.map(p => (
                        <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1 ml-1 px-1">Connecting a parent account allows them to log in and view this child's data.</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                    <input 
                      type="date"
                      value={newStudent.dob}
                      onChange={(e) => setNewStudent({...newStudent, dob: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Residential Address</label>
                    <textarea 
                      value={newStudent.address}
                      onChange={(e) => setNewStudent({...newStudent, address: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium" 
                      placeholder="Street, City, Country"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 glassmorphism font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all">Cancel</button>
                  <button 
                    disabled={isSaving}
                    type="submit" 
                    className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Register Student'}
                  </button>
                </div>
              </div>
           </form>
        </div>
      )}
      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
           <div className="w-full max-w-2xl glassmorphism p-8 md:p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 -mr-32 -mt-32 rounded-full" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 flex-shrink-0">
                       <GraduationCap size={40} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{selectedStudent.full_name}</h2>
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedStudent.grade} • Section {selectedStudent.section}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-900 transition-all bg-white shadow-sm p-2 rounded-xl">
                    <X size={20} />
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-8 relative z-10">
                 <div className="space-y-4">
                    <div>
                       <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Roll Number</p>
                       <p className="font-bold text-slate-700">{selectedStudent.roll_no || 'N/A'}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Date of Birth</p>
                       <p className="font-bold text-slate-700">{selectedStudent.dob || 'N/A'}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                       <p className="font-bold text-slate-700">{selectedStudent.parent_phone || 'N/A'}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div>
                       <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                       <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Active</span>
                    </div>
                    <div>
                       <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Address</p>
                       <p className="font-bold text-slate-700 leading-relaxed text-sm">{selectedStudent.address || 'No address provided'}</p>
                    </div>
                 </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 flex gap-4 relative z-10">
                 <button 
                  onClick={() => {
                    handleDeleteStudent(selectedStudent.id)
                    setSelectedStudent(null)
                  }}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                 >
                    <Trash2 size={16} /> Delete Student
                 </button>
                 <button 
                  onClick={() => {
                    setEditingStudent(selectedStudent)
                    setSelectedStudent(null)
                  }}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                 >
                    <Edit size={16} /> Edit Profile
                 </button>
              </div>
           </div>
        </div>
      )}
      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] flex items-center justify-center p-6">
           <div className="w-full max-w-2xl glassmorphism p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Edit Student Profile</h2>
                 <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-900 transition-all bg-white shadow-sm p-2 rounded-xl">
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleUpdateStudent} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Name & Roll No</label>
                          <input 
                            required
                            value={editingStudent.full_name}
                            onChange={(e) => setEditingStudent({...editingStudent, full_name: e.target.value})}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all font-bold"
                          />
                          <input 
                            required
                            value={editingStudent.roll_no}
                            onChange={(e) => setEditingStudent({...editingStudent, roll_no: e.target.value})}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all font-bold"
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Profile Photo</label>
                          <FileUpload 
                            bucket="avatars"
                            path="students"
                            currentUrl={editingStudent.avatar_url}
                            onUploadComplete={(url) => setEditingStudent({...editingStudent, avatar_url: url})}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                          <input 
                            required
                            value={editingStudent.parent_phone}
                            onChange={(e) => setEditingStudent({...editingStudent, parent_phone: e.target.value})}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all font-bold"
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Date of Birth</label>
                          <input 
                            type="date"
                            value={editingStudent.dob}
                            onChange={(e) => setEditingStudent({...editingStudent, dob: e.target.value})}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all font-bold"
                          />
                       </div>
                       <div className="space-y-4 md:col-span-2">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Linked Parent User</label>
                          <select 
                            value={editingStudent.parent_id || ''}
                            onChange={(e) => setEditingStudent({...editingStudent, parent_id: e.target.value})}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all font-bold bg-white/80"
                          >
                            <option value="">-- No Parent Linked --</option>
                            {parents.map(p => (
                              <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                            ))}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Current Address</label>
                       <textarea 
                        rows={2}
                        value={editingStudent.address}
                        onChange={(e) => setEditingStudent({...editingStudent, address: e.target.value})}
                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all font-bold"
                       />
                    </div>

                    <button 
                       type="submit"
                       disabled={isSaving}
                       className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                       {isSaving ? (
                         <>
                           <Loader2 className="animate-spin" size={20} />
                           Updating...
                         </>
                       ) : (
                         <>
                           <CheckCircle2 size={20} />
                           Update Student Record
                         </>
                       )}
                    </button>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
