'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  CreditCard, Download, Loader2, Play, 
  CheckCircle2, Clock, User, TrendingUp,
  Receipt, Wallet, AlertCircle
} from 'lucide-react'

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  
  const supabase = createClient()

  useEffect(() => {
    fetchProfileAndPayroll()
  }, [])

  const fetchProfileAndPayroll = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)

      let query = supabase.from('payroll').select('*, profiles(full_name, role)').order('created_at', { ascending: false })
      
      if (profileData.role !== 'admin') {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query
      
      if (error) {
        console.error("Payroll Query Error:", error.message)
        if (error.message.includes('relation "payroll" does not exist')) {
           console.error("CRITICAL: 'payroll' table is missing. Run SQL in database_schema.md")
        }
      } else {
        setPayroll(data || [])
      }
    } catch (err) {
      console.error("Payroll Fetch Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRunPayroll = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: currentMonth })
      })
      const data = await res.json()
      if (data.success) {
        alert(`Successfully generated payroll for ${data.count} employees.`)
        fetchProfileAndPayroll()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (err) {
      console.error("Error running payroll:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleMarkAsPaid = async (id: string) => {
    const { error } = await supabase
      .from('payroll')
      .update({ status: 'paid', payment_date: new Date().toISOString() })
      .eq('id', id)
    
    if (error) alert('Error updating payment: ' + error.message)
    else fetchProfileAndPayroll()
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter italic">Compensation Hub</h3>
          <p className="text-slate-500 font-bold text-sm">Managing disbursements for {currentMonth}</p>
        </div>
        {profile?.role === 'admin' && (
          <button 
            onClick={handleRunPayroll}
            disabled={isGenerating}
            className="w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} className="fill-current" />}
            Generate {currentMonth} Payroll
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glassmorphism p-8 rounded-[2.5rem] border border-white/50 space-y-2 relative overflow-hidden group">
           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-2">
              <Wallet size={24} />
           </div>
           <p className="text-3xl font-display font-bold text-slate-900 tracking-tighter">
              Rs. {payroll.reduce((sum, p) => sum + Number(p.net_salary), 0).toLocaleString()}
           </p>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Monthly Commitment</p>
        </div>
        <div className="glassmorphism p-8 rounded-[2.5rem] border border-white/50 space-y-2">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-2">
              <CheckCircle2 size={24} />
           </div>
           <p className="text-3xl font-display font-bold text-slate-900 tracking-tighter">
              {payroll.filter(p => p.status === 'paid').length} / {payroll.length}
           </p>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salaries Disbursed</p>
        </div>
        <div className="glassmorphism p-8 rounded-[2.5rem] border border-white/50 bg-gradient-to-br from-indigo-900 to-slate-900 text-white flex flex-col justify-center">
           <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 italic">Financial Health</p>
           <h4 className="text-xl font-bold tracking-tight">Auto-Tax Scaling</h4>
           <p className="text-xs text-white/60 font-medium mt-1">System is monitoring latest tax brackets for automated adjustments.</p>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="glassmorphism rounded-[2.5rem] border border-white/50 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-white/30 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <Receipt className="text-slate-300" size={24} />
              <h4 className="font-bold text-xl tracking-tight text-slate-900">Recent Disbursements</h4>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/5 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Staff Member</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Base Salary</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Net Payable</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Payment Status</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                     <Loader2 className="animate-spin mx-auto text-slate-200" size={40} />
                  </td>
                </tr>
              ) : payroll.length > 0 ? payroll.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/40 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                        {entry.profiles?.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-none">{entry.profiles?.full_name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{entry.profiles?.role} | {entry.month}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-600 tracking-tight">Rs. {Number(entry.basic_salary).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold">Standard Grade</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <p className="text-lg font-display font-bold text-slate-900">Rs. {Number(entry.net_salary).toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-5">
                     <div className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                       entry.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                     }`}>
                        {entry.status === 'paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {entry.status}
                     </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {profile?.role === 'admin' && entry.status !== 'paid' && (
                         <button 
                          onClick={() => handleMarkAsPaid(entry.id)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                         >
                            Mark Paid
                         </button>
                       )}
                       <button className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 hover:shadow-sm transition-all">
                          <Download size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center space-y-4 opacity-50">
                      <CreditCard size={48} className="mx-auto text-slate-200" />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs tracking-widest">No payslips found for this cycle.</p>
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
