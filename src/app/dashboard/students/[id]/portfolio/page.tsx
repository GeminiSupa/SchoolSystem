'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileUpload } from '@/components/ui/file-upload'
import Link from 'next/link'
import { 
  Loader2, Plus, Trash2, Camera, Trophy, Star, 
  FileText, Wand2, Sparkles, X, Share2, Clipboard, TrendingUp
} from 'lucide-react'

export default function StudentPortfolioPage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<any>(null)
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiReport, setAiReport] = useState<string | null>(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const [trajectory, setTrajectory] = useState<string | null>(null)
  const [isAnalyzingTrajectory, setIsAnalyzingTrajectory] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchStudentData = async () => {
      const { data: studentData, error: sError } = await supabase
        .from('students')
        .select('*')
        .eq('id', params.id)
        .single()

      if (sError) console.error(sError)
      else {
        setStudent(studentData)
        // Auto-analyze trajectory if not already done
        analyzeAcademicTrajectory(studentData.full_name)
      }

      // Fetch sample portfolios from storage/table
      // For now we use the student record's avatar and some mock data
      setIsLoading(false)
    }

    fetchStudentData()
  }, [params.id])

  const analyzeAcademicTrajectory = async (name: string) => {
    setIsAnalyzingTrajectory(true)
    try {
      // Mock some grades for analysis
      const mockGrades = [
        { subject: 'Math', marks: 85 },
        { subject: 'Science', marks: 92 },
        { subject: 'English', marks: 78 }
      ]
      
      const res = await fetch('/api/ai/academic-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: name, grades: mockGrades })
      })
      const data = await res.json()
      setTrajectory(data.trajectory)
    } catch (err) {
      console.error(err)
    } finally {
      setIsAnalyzingTrajectory(false)
    }
  }

  const handleUpdateAvatar = async (url: string) => {
    await supabase
      .from('students')
      .update({ avatar_url: url })
      .eq('id', params.id)
    
    setStudent({ ...student, avatar_url: url })
  }

  const handleGenerateAIReport = async () => {
    setIsGeneratingAI(true)
    try {
      const response = await fetch('/api/ai/daily-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentName: student?.full_name,
          attendance: [], // Could fetch actual data
          grades: []
        })
      })
      const data = await response.json()
      setAiReport(data.report)
      setShowAIModal(true)
    } catch (err) {
      console.error(err)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  if (isLoading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin text-slate-900" size={40} />
    </div>
  )

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8">
      {/* Student Profile Header */}
      <div className="glassmorphism p-8 rounded-3xl flex flex-col md:row items-center gap-8">
        <div className="w-32 h-32 relative">
          <img 
            src={student?.avatar_url || 'https://via.placeholder.com/150'} 
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl"
            alt={student?.full_name}
          />
          <button className="absolute bottom-0 right-0 w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center border-4 border-slate-50">
            <Camera size={16} />
          </button>
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl font-display font-bold text-slate-900">{student?.full_name}</h2>
          <p className="text-slate-500 font-medium">Grade 2 | Section B | School ID: {student?.school_id.slice(0,8)}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <div className="px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100 flex items-center gap-2">
              <Trophy size={14} /> Star Performer
            </div>
            <div className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-2">
              <Star size={14} /> Top Attendance
            </div>
            <Link 
              href={`/dashboard/grades/report-cards/${params.id}`}
              className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200 flex items-center gap-2 hover:bg-slate-200 transition-colors"
            >
              <FileText size={14} /> View Report Card
            </Link>
            <button 
              onClick={handleGenerateAIReport}
              disabled={isGeneratingAI}
              className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs font-bold border border-indigo-400 flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              {isGeneratingAI ? 'Conjuring...' : 'AI Magic Wand'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Trajectory Insights */}
        {(trajectory || isAnalyzingTrajectory) && (
          <div className="mx-6 md:mx-12 mt-6 p-6 rounded-[2rem] bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100/50 backdrop-blur-sm flex flex-col md:flex-row items-center gap-6">
             <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 border border-indigo-100 flex-shrink-0 animate-pulse">
                <TrendingUp size={24} />
             </div>
             <div className="flex-1 text-center md:text-left space-y-1">
                <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">AI Academic Trajectory Insight</p>
                {isAnalyzingTrajectory ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-indigo-400" />
                    <p className="text-sm font-medium text-slate-400">Analyzing performance patterns...</p>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                    "{trajectory}"
                  </p>
                )}
             </div>
             {!isAnalyzingTrajectory && (
               <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-indigo-100 shadow-sm text-[10px] font-bold text-indigo-600 uppercase">
                  <Sparkles size={12} /> Predictive
               </div>
             )}
          </div>
        )}

      {/* AI Report Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
              {/* Animated Header */}
              <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 animate-gradient-x" />
              
              <div className="p-10 md:p-14 space-y-8 overflow-y-auto custom-scrollbar">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                          <Sparkles size={24} />
                       </div>
                       <div>
                          <h2 className="text-2xl font-display font-extrabold tracking-tighter text-slate-900">AI Daily Spirit</h2>
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Generative Insight • {student?.full_name}</p>
                       </div>
                    </div>
                    <button onClick={() => setShowAIModal(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                       <X size={20} />
                    </button>
                 </div>

                 <div className="glassmorphism p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50/30">
                    <p className="text-lg leading-relaxed text-slate-800 font-medium italic tracking-tight">
                       "{aiReport}"
                    </p>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                       <Clipboard size={18} /> Copy to Clipboard
                    </button>
                    <button className="flex-1 bg-slate-50 text-slate-600 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-slate-100 hover:bg-white transition-all">
                       <Share2 size={18} /> Share with Parent
                    </button>
                 </div>
              </div>
              
              <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
                 <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Powered by EduOS Generative Engine</p>
              </div>
           </div>
        </div>
      )}

      {/* Portfolio Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-display font-bold text-slate-900">Achievement Portfolio</h3>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition-all">
            <Plus size={18} /> Add Item
          </button>
        </div>

        <div className="bento-grid">
          {/* Main Profile Photo Upload */}
          <div className="glassmorphism p-6 rounded-3xl col-span-1 md:col-span-2">
            <h4 className="font-bold mb-4">Official Student Photo</h4>
            <FileUpload 
              bucket="avatars" 
              path={`students/${params.id}`} 
              currentUrl={student?.avatar_url}
              onUploadComplete={handleUpdateAvatar}
            />
          </div>

          {/* Sample Portfolio Item */}
          <div className="glassmorphism p-6 rounded-3xl group">
             <div className="aspect-square rounded-2xl bg-slate-100 mb-4 overflow-hidden relative">
                <img src="https://via.placeholder.com/300" className="w-full h-full object-cover" />
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={16} className="text-white" />
                </button>
             </div>
             <h4 className="font-bold text-slate-900">Art Project: Abstract World</h4>
             <p className="text-xs text-slate-500 mt-1">Uploaded April 12, 2026</p>
          </div>

          <div className="glassmorphism p-6 rounded-3xl border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-center space-y-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
               <Plus className="text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-500">Upload Certificate</p>
          </div>
        </div>
      </div>
    </div>
  )
}
