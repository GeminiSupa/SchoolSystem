'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { 
  Printer, Download, ShieldCheck, ArrowLeft, 
  Loader2, GraduationCap, Award, TrendingUp, 
  CheckCircle2, AlertCircle, User
} from 'lucide-react'

export default function ReportCardPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [grades, setGrades] = useState<any[]>([])
  const [exam, setExam] = useState<any>(null)
  const [trajectory, setTrajectory] = useState<string>('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    setIsLoading(true)
    
    // 1. Fetch Student
    const { data: studentData } = await supabase
      .from('students')
      .select('*, schools(*)')
      .eq('id', params.id)
      .single()
    
    setStudent(studentData)

    // 2. Fetch Grades for this student (all subjects for latest exam)
    const { data: gradeData, error } = await supabase
      .from('grades')
      .select('*, exams(*)')
      .eq('student_id', params.id)
      .order('created_at', { ascending: false })
    
    if (gradeData && gradeData.length > 0) {
      setGrades(gradeData)
      setExam(gradeData[0].exams)
      
      // Fetch AI Trajectory
      setIsGeneratingAI(true)
      try {
        const aiRes = await fetch('/api/ai/academic-sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentName: studentData.full_name, grades: gradeData })
        })
        const aiData = await aiRes.json()
        setTrajectory(aiData.trajectory)
      } catch (err) {
        console.error(err)
      } finally {
        setIsGeneratingAI(false)
      }
    }
    
    setIsLoading(false)
  }

  // Calculation Logic
  const totalMarksObtained = grades.reduce((sum, g) => sum + Number(g.marks_obtained), 0)
  const totalMaxMarks = grades.reduce((sum, g) => sum + Number(g.total_marks), 0)
  const percentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0
  
  const getLetterGrade = (pct: number) => {
    if (pct >= 90) return 'A+'
    if (pct >= 80) return 'A'
    if (pct >= 70) return 'B'
    if (pct >= 60) return 'C'
    return 'D'
  }

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
       <Loader2 className="animate-spin text-slate-400" size={48} />
    </div>
  )

  if (!student) return <div>Student not found</div>

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center print:hidden">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Back to Gradebook
        </button>
        <div className="flex gap-4">
           <button 
            onClick={() => window.print()}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
           >
              <Printer size={18} /> Print Report
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 print:shadow-none print:border-none p-12 md:p-16 space-y-12">
        {/* Academic Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 border-b-2 border-slate-900/5 pb-12">
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white font-bold text-3xl">S</div>
                 <div>
                    <h1 className="text-3xl font-display font-extrabold tracking-tighter text-slate-900 uppercase italic">EduOS Academy</h1>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mt-1">Official Academic Record</p>
                 </div>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div>
                 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Exam Type</p>
                 <p className="font-bold text-slate-900 tracking-tight">{exam?.title || 'Annual Assessment'}</p>
              </div>
              <div>
                 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Academic Year</p>
                 <p className="font-bold text-slate-900 tracking-tight">2026-27</p>
              </div>
              <div>
                 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Roll Number</p>
                 <p className="font-bold text-slate-900 tracking-tight">{student.roll_no || 'N/A'}</p>
              </div>
              <div>
                 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Status</p>
                 <p className="font-bold text-emerald-600 tracking-tight uppercase tracking-widest text-xs">Finalized</p>
              </div>
           </div>
        </div>

        {/* Student Profile Ribbon */}
        <div className="glassmorphism p-8 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center gap-10">
           <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-display font-bold text-slate-400">
              {student.full_name.charAt(0)}
           </div>
           <div className="flex-1 text-center md:text-left space-y-1">
              <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tighter">{student.full_name}</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Class: {student.grade}-{student.section}</p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 p-4 rounded-2xl border border-white text-center">
                 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Percentage</p>
                 <p className="text-2xl font-display font-bold text-slate-900">{percentage.toFixed(1)}%</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl text-center">
                 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Grade</p>
                 <p className="text-2xl font-display font-bold text-white">{getLetterGrade(percentage)}</p>
              </div>
           </div>
        </div>

        {/* Results Table */}
        <div className="space-y-6">
           <h4 className="text-xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <GraduationCap size={20} className="text-slate-400" /> Subject-wise Performance
           </h4>
           <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                       <th className="px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Subject</th>
                       <th className="px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest text-center">Max Marks</th>
                       <th className="px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest text-center">Obtained</th>
                       <th className="px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest text-center">Grade</th>
                       <th className="px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Comments</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 uppercase tracking-tight">
                    {grades.map((g) => (
                       <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 font-bold text-slate-900">{g.subject}</td>
                          <td className="px-8 py-5 text-center font-bold text-slate-500">{g.total_marks}</td>
                          <td className="px-8 py-5 text-center font-extrabold text-slate-900">{g.marks_obtained}</td>
                          <td className="px-8 py-5 text-center">
                             <span className="font-display font-bold text-slate-900">
                                {getLetterGrade((g.marks_obtained/g.total_marks)*100)}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-xs font-medium text-slate-500 italic max-w-xs truncate">
                             {g.comments || '-'}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Footer Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-slate-100">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  < Award className="text-amber-500" size={18} />
                  <p className="font-bold text-slate-900 tracking-tight">Academic Standing</p>
               </div>
               {isGeneratingAI ? (
                  <div className="flex items-center gap-2 text-slate-400 italic text-sm">
                     <Loader2 size={14} className="animate-spin" /> Analyzing trajectory...
                  </div>
               ) : (
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                     {trajectory || `Student has shown ${percentage > 70 ? 'Excellent' : 'Steady'} progress this term. Key strengths observed in logical reasoning.`}
                  </p>
               )}
            </div>
           
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <TrendingUp className="text-emerald-500" size={18} />
                 <p className="font-bold text-slate-900 tracking-tight">Progress Trajectory</p>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed uppercase tracking-tighter">
                 ↑ 4.2% improvement compared to Mid-term assessments.
              </p>
           </div>

           <div className="bg-slate-100/50 p-8 rounded-[2rem] space-y-4 text-center">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Aggregate Result</p>
              <p className="text-4xl font-display font-bold text-slate-900 tracking-tighter">PASS</p>
              <p className="text-xs text-slate-500 font-bold italic">Promoted to next Grade</p>
           </div>
        </div>

        {/* Signing Area */}
        <div className="pt-20 flex flex-col md:flex-row justify-between items-end gap-12 text-center md:text-left">
           <div className="space-y-4">
              <div className="w-48 h-px bg-slate-900/10 mb-4" />
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Class Teacher Signature</p>
           </div>
           <div className="space-y-4 text-right">
              <div className="w-48 h-px bg-slate-900/10 mb-4 ml-auto" />
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">School Principal / Controller</p>
           </div>
        </div>
      </div>
    </div>
  )
}
