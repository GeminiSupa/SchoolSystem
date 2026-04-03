'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Printer, ArrowLeft, Loader2, GraduationCap, 
  CheckCircle2, TrendingUp, Award
} from 'lucide-react'

function BulkReportsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [data, setData] = useState<any[]>([])
  const [exam, setExam] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const selectedClass = searchParams.get('class') || ''
  const selectedExam = searchParams.get('exam') || ''
  const supabase = createClient()

  useEffect(() => {
    if (selectedClass && selectedExam) {
      fetchBulkData()
    }
  }, [selectedClass, selectedExam])

  const fetchBulkData = async () => {
    setIsLoading(true)
    
    // 1. Fetch Exam Details
    const { data: examData } = await supabase.from('exams').select('*').eq('id', selectedExam).single()
    setExam(examData)

    // 2. Fetch Students in class
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('grade', selectedClass.split('-')[0])
      .order('full_name')

    if (!students) return

    // 3. Fetch ALL grades for these students for this exam
    const { data: grades } = await supabase
      .from('grades')
      .select('*')
      .eq('exam_id', selectedExam)
      .in('student_id', students.map(s => s.id))

    // 4. Group grades by student
    const combined = students.map(s => {
      const studentGrades = grades?.filter(g => g.student_id === s.id) || []
      const totalObtained = studentGrades.reduce((sum, g) => sum + Number(g.marks_obtained), 0)
      const totalMax = studentGrades.reduce((sum, g) => sum + Number(g.total_marks), 0)
      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0
      
      return {
        ...s,
        grades: studentGrades,
        percentage,
        gradeLetter: getLetterGrade(percentage)
      }
    })

    setData(combined)
    setIsLoading(false)
  }

  const getLetterGrade = (pct: number) => {
    if (pct >= 90) return 'A+'
    if (pct >= 80) return 'A'
    if (pct >= 70) return 'B'
    if (pct >= 60) return 'C'
    return 'D'
  }

  if (isLoading) return (
     <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" size={48} />
     </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center print:hidden">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm"
        >
          <ArrowLeft size={16} /> Back to Gradebook
        </button>
        <button 
          onClick={() => window.print()}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl"
        >
          <Printer size={18} /> Print All ({data.length})
        </button>
      </div>

      <div className="space-y-12">
        {data.map((student, index) => (
          <div key={student.id} className="bg-white p-12 md:p-16 border border-slate-100 rounded-[3rem] shadow-xl print:shadow-none print:border-none print:p-0 print:m-0 break-after-page">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900/5 pb-10">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-2xl font-display italic">S</div>
                  <div>
                     <h2 className="text-2xl font-display font-extrabold tracking-tighter text-slate-900 uppercase italic">EduOS Academy</h2>
                     <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Academic Result Sheet</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Exam Cycle</p>
                  <p className="font-bold text-slate-900">{exam?.title}</p>
               </div>
            </div>

            {/* Profile */}
            <div className="mt-10 flex gap-8 items-center bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
               <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xl font-display font-bold text-slate-400">
                  {student.full_name.charAt(0)}
               </div>
               <div className="flex-1">
                  <h3 className="text-2xl font-display font-bold text-slate-900">{student.full_name}</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Roll: {student.roll_no} | {student.grade}-{student.section}</p>
               </div>
               <div className="text-center bg-slate-900 text-white px-6 py-2 rounded-2xl">
                  <p className="text-[9px] font-bold uppercase opacity-60">Final Grade</p>
                  <p className="text-xl font-display font-bold">{student.gradeLetter}</p>
               </div>
            </div>

            {/* Results */}
            <div className="mt-10">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b-2 border-slate-100">
                        <th className="py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Subject</th>
                        <th className="py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Marks</th>
                        <th className="py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Max</th>
                        <th className="py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Progress</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-bold text-sm text-slate-900">
                     {student.grades.map((g: any) => (
                        <tr key={g.id}>
                           <td className="py-5">{g.subject}</td>
                           <td className="py-5 text-center">{g.marks_obtained}</td>
                           <td className="py-5 text-center text-slate-400">{g.total_marks}</td>
                           <td className="py-5 text-right font-display text-lg">
                              {(g.marks_obtained/g.total_marks*100).toFixed(0)}%
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Footer Summary */}
            <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-2 gap-12">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600">
                     <TrendingUp size={16} />
                     <p className="text-[10px] font-extrabold uppercase tracking-widest">Performance Insights</p>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                     Academic summary for student {student.full_name} indicates a {student.percentage > 40 ? 'Satisfactory' : 'Critical'} completion of the syllabus. Recommended attention in areas of logic and structured review.
                  </p>
               </div>
               <div className="flex flex-col justify-end items-end gap-1">
                  <div className="w-32 h-px bg-slate-900/10 mb-2" />
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Authorized Signatory</p>
               </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @media print {
          body * { margin: 0; padding: 0; }
          .break-after-page { page-break-after: always; }
          .glassmorphism { border: none !important; backdrop-filter: none !important; background: white !important; }
        }
      `}</style>
    </div>
  )
}

export default function BulkReportsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" size={48} />
      </div>
    }>
      <BulkReportsContent />
    </Suspense>
  )
}
