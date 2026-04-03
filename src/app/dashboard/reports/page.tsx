'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Wand2, Send, Loader2, Sparkles, CheckCircle2,
  AlertCircle, ChevronRight, User, BookOpen
} from 'lucide-react'

export default function ReportsPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [summaries, setSummaries] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Record<string, 'pending' | 'generating' | 'generated' | 'sent'>>({})
  const [isClassLoading, setIsClassLoading] = useState(false)
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user?.id).single()

    const { data: classData } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', profile?.school_id)
      .order('name')
    
    setClasses(classData || [])
  }

  const handleClassSelect = async (classId: string) => {
    setSelectedClassId(classId)
    if (!classId) {
      setStudents([])
      return
    }

    setIsClassLoading(true)
    const cls = classes.find(c => c.id === classId)
    
    const { data: studentData } = await supabase
      .from('students')
      .select('*')
      .eq('grade', cls.grade)
    
    setStudents(studentData || [])
    
    // Reset statuses
    const newStatus: Record<string, any> = {}
    studentData?.forEach(s => newStatus[s.id] = 'pending')
    setStatus(newStatus)
    setSummaries({})
    setIsClassLoading(false)
  }

  const generateReportForStudent = async (student: any) => {
    setStatus(prev => ({ ...prev, [student.id]: 'generating' }))
    try {
      const response = await fetch('/api/ai/daily-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.full_name,
        })
      })
      const data = await response.json()
      
      setSummaries(prev => ({ ...prev, [student.id]: data.report }))
      setStatus(prev => ({ ...prev, [student.id]: 'generated' }))
    } catch (err) {
      console.error(err)
      setStatus(prev => ({ ...prev, [student.id]: 'pending' }))
    }
  }

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true)
    // Run sequentially to avoid rate limits on AI API
    for (const student of students) {
      if (status[student.id] !== 'generated' && status[student.id] !== 'sent') {
        await generateReportForStudent(student)
      }
    }
    setIsGeneratingAll(false)
  }

  const handleBroadcast = async () => {
    if (!confirm('This will send all generated reports directly to the parents via messages. Proceed?')) return
    
    setIsBroadcasting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('school_id, full_name').eq('id', user?.id).single()

    const messages = students.map(s => {
      if (status[s.id] === 'generated' && summaries[s.id]) {
        return {
          school_id: profile?.school_id,
          sender_id: user?.id,
          receiver_id: s.parent_id || null, // Should go to parent dashboard
          sender_name: profile?.full_name,
          content: `Daily Spark Report for ${s.full_name}:\n\n${summaries[s.id]}`,
        }
      }
      return null
    }).filter(Boolean)

    if (messages.length > 0) {
      const { error } = await supabase.from('messages').insert(messages)
      if (error) alert(error.message)
      else {
        alert('Successfully broadcasted to parents!')
        // Update statuses to 'sent'
        const newStatus = { ...status }
        students.forEach(s => {
          if (newStatus[s.id] === 'generated') newStatus[s.id] = 'sent'
        })
        setStatus(newStatus)
      }
    }
    setIsBroadcasting(false)
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                <Sparkles size={24} />
             </div>
             <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter italic">AI Magic Wand</h3>
           </div>
           <p className="text-slate-500 font-bold text-sm">Generate personalized daily summaries for parents in seconds.</p>
        </div>
      </div>

      <div className="glassmorphism p-8 md:p-10 rounded-[2.5rem] border border-white/50 shadow-sm relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-end gap-6 border-b border-slate-100 pb-8">
           <div className="w-full md:w-80 space-y-2">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1">Select Class</label>
              <select 
                 value={selectedClassId}
                 onChange={(e) => handleClassSelect(e.target.value)}
                 className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800 outline-none"
              >
                 <option value="">Choose Class...</option>
                 {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
           </div>
           
           <div className="flex gap-4 w-full md:w-auto ml-auto">
              <button 
                disabled={!selectedClassId || students.length === 0 || isGeneratingAll}
                onClick={handleGenerateAll}
                className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-indigo-600/20"
              >
                 {isGeneratingAll ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                 Generate All
              </button>
              
              <button 
                disabled={!students.some(s => status[s.id] === 'generated') || isBroadcasting}
                onClick={handleBroadcast}
                className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-slate-900/20"
              >
                 {isBroadcasting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                 Broadcast to Parents
              </button>
           </div>
        </div>

        <div className="relative z-10 mt-8">
           {isClassLoading ? (
             <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-slate-300" size={40} />
             </div>
           ) : students.length > 0 ? (
             <div className="space-y-4">
                {students.map(student => (
                   <div key={student.id} className="bg-white/60 border border-slate-100 p-6 rounded-[2rem] flex flex-col items-start gap-4 transition-all hover:bg-white hover:shadow-md">
                      <div className="flex justify-between items-center w-full">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                               <User size={18} />
                            </div>
                            <div>
                               <p className="font-bold text-slate-900 text-sm">{student.full_name}</p>
                               <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Roll No: {student.roll_no}</p>
                            </div>
                         </div>
                         
                         <div>
                            {status[student.id] === 'pending' && (
                               <button 
                                 onClick={() => generateReportForStudent(student)}
                                 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors flex items-center gap-1.5 border border-indigo-100"
                               >
                                  <Wand2 size={12} /> Generate
                               </button>
                            )}
                            {status[student.id] === 'generating' && (
                               <div className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-full flex items-center gap-1.5 border border-amber-100">
                                  <Loader2 size={12} className="animate-spin"/> Writing...
                               </div>
                            )}
                            {status[student.id] === 'generated' && (
                               <div className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full flex items-center gap-1.5 border border-emerald-100">
                                  <CheckCircle2 size={12}/> Ready
                               </div>
                            )}
                            {status[student.id] === 'sent' && (
                               <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-full flex items-center gap-1.5 border border-slate-200">
                                  <Send size={12}/> Broadcasted
                               </div>
                            )}
                         </div>
                      </div>
                      
                      {/* Generated Text Area */}
                      {(status[student.id] === 'generated' || status[student.id] === 'sent') && (
                         <div className="w-full bg-white border border-indigo-50 p-4 rounded-2xl relative shadow-inner">
                            <Sparkles size={16} className="absolute top-4 right-4 text-indigo-200" />
                            <textarea 
                              value={summaries[student.id] || ''}
                              onChange={(e) => setSummaries(prev => ({...prev, [student.id]: e.target.value}))}
                              disabled={status[student.id] === 'sent'}
                              className="w-full bg-transparent outline-none resize-none text-sm font-medium text-slate-700 placeholder:text-slate-300 min-h-[80px]"
                            />
                         </div>
                      )}
                   </div>
                ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                   <BookOpen size={32} />
                </div>
                <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Select a class to load roster</p>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
