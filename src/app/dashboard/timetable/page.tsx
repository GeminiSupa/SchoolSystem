'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar, Clock, User, BookOpen, Plus, 
  Loader2, Trash2, Edit2, Filter, ChevronRight,
  Monitor, Info, CheckCircle2, XCircle, Search
} from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TIME_SLOTS = [
  '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', 
  '11:00 - 11:30 (Break)', '11:30 - 12:30', '12:30 - 01:30'
]

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  
  const supabase = createClient()
  const role = profile?.role

  const [newSlot, setNewSlot] = useState({
    class_id: '',
    teacher_id: '',
    subject: '',
    day: 'Monday',
    time_slot: '08:00 - 09:00',
    room: ''
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

      const { data: classData } = await supabase.from('classes').select('*').order('name')
      setClasses(classData || [])

      const { data: teacherData } = await supabase.from('profiles').select('*').eq('role', 'teacher')
      setTeachers(teacherData || [])

      if (profileData.role === 'student') {
        const { data: stu } = await supabase.from('students').select('class_id').eq('user_id', user.id).single()
        if (stu?.class_id) setSelectedClassId(stu.class_id)
      } else if (profileData.role === 'parent') {
        const { data: kids } = await supabase.from('students').select('class_id').eq('parent_id', user.id)
        if (kids && kids.length > 0) setSelectedClassId(kids[0].class_id)
      } else if (classData && classData.length > 0) {
        setSelectedClassId(classData[0].id)
      }

      fetchTimetable()
    } catch (err) {
      console.error("Timetable fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTimetable = async () => {
    const { data } = await supabase.from('timetable').select('*, profiles(full_name), classes(name, grade, section)')
    setTimetable(data || [])
  }

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('timetable').insert({
      ...newSlot,
      school_id: profile.school_id
    })
    if (error) alert(error.message)
    else {
      setShowAddModal(false)
      fetchTimetable()
    }
  }

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return
    const { error } = await supabase.from('timetable').delete().eq('id', id)
    if (error) alert(error.message)
    else fetchTimetable()
  }

  const getSlot = (day: string, time: string) => {
    return timetable.find(t => t.day === day && t.time_slot === time && t.class_id === selectedClassId)
  }

  if (isLoading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin text-slate-900" size={40} />
    </div>
  )

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter">School Timetable</h3>
          <p className="text-slate-500 font-bold text-sm">Schedule management for classes, subjects, and teachers.</p>
        </div>
        
        {role === 'admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={20} /> Add Schedule Slot
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 space-y-6">
          <div className="glassmorphism p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
               <Filter size={16} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Select Class</span>
            </div>
            <div className="space-y-2">
              {classes.map(cls => (
                <button 
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                    selectedClassId === cls.id 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white/50 text-slate-500 border-white hover:bg-white'
                  }`}
                >
                  {cls.name} <span className="text-[10px] opacity-60 ml-1">({cls.grade}-{cls.section})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glassmorphism p-6 rounded-3xl bg-indigo-50/30 border-indigo-100">
             <div className="flex items-center gap-2 mb-3 text-indigo-400">
                <Info size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Guide</span>
             </div>
             <p className="text-xs text-indigo-700 font-medium leading-relaxed">
               Admins can click slots to edit or delete. Teachers see their own classes highlighted in their personal view.
             </p>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="flex-1">
          <div className="glassmorphism rounded-[2.5rem] border border-white/50 overflow-x-auto shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-6 bg-slate-50/50 border-r border-b border-slate-100"></th>
                  {DAYS.map(day => (
                    <th key={day} className="p-6 bg-slate-50/50 border-b border-r last:border-r-0 border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(time => (
                  <tr key={time}>
                    <td className="p-4 bg-slate-50/30 border-r border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase text-center w-32">
                      {time}
                    </td>
                    {DAYS.map(day => {
                      const slot = getSlot(day, time)
                      const isBreak = time.includes('Break')
                      
                      return (
                        <td 
                          key={`${day}-${time}`} 
                          className={`p-2 border-r last:border-r-0 border-b border-slate-100 min-h-[100px] align-top transition-all ${isBreak ? 'bg-slate-50/50' : 'hover:bg-white/40'}`}
                        >
                          {slot ? (
                            <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2 group relative">
                              {role === 'admin' && (
                                <button 
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                              <p className="text-xs font-bold text-indigo-600 line-clamp-1">{slot.subject}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                <User size={10} />
                                <span className="truncate">{slot.profiles?.full_name}</span>
                              </div>
                              {slot.room && (
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                  <Monitor size={10} />
                                  <span>Room {slot.room}</span>
                                </div>
                              )}
                            </div>
                          ) : isBreak ? (
                            <div className="flex flex-col items-center justify-center p-3 text-slate-300">
                               <Clock size={16} className="mb-1" />
                               <span className="text-[10px] font-bold uppercase tracking-widest">Break</span>
                            </div>
                          ) : null}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <form onSubmit={handleAddSlot} className="w-full max-w-lg glassmorphism p-8 md:p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Add Schedule Slot</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 transition-all bg-white shadow-sm p-2 rounded-xl">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Class</label>
                  <select 
                    required
                    value={newSlot.class_id}
                    onChange={(e) => setNewSlot({...newSlot, class_id: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900 bg-white/50"
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.grade}-{c.section})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Teacher</label>
                  <select 
                    required
                    value={newSlot.teacher_id}
                    onChange={(e) => setNewSlot({...newSlot, teacher_id: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900 bg-white/50"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                  <input 
                    required
                    placeholder="e.g. Mathematics"
                    value={newSlot.subject}
                    onChange={(e) => setNewSlot({...newSlot, subject: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Room No</label>
                  <input 
                    placeholder="e.g. 101"
                    value={newSlot.room}
                    onChange={(e) => setNewSlot({...newSlot, room: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Day</label>
                  <select 
                    value={newSlot.day}
                    onChange={(e) => setNewSlot({...newSlot, day: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900 bg-white/50"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Time Slot</label>
                  <select 
                    value={newSlot.time_slot}
                    onChange={(e) => setNewSlot({...newSlot, time_slot: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900 bg-white/50"
                  >
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 glassmorphism font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all text-slate-600">Cancel</button>
              <button 
                type="submit" 
                className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Create Schedule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
