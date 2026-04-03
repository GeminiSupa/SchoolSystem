'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Wallet, Receipt, CreditCard, Plus, Search, 
  Loader2, Filter, Download, ArrowUpRight, 
  ArrowDownLeft, CheckCircle2, AlertCircle, 
  Clock, XCircle, Printer, Pencil, Coins
} from 'lucide-react'

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'fees' | 'payroll' | 'my-fees' | 'my-salary'>('overview')
  const [invoices, setInvoices] = useState<any[]>([])
  const [studentFees, setStudentFees] = useState<any[]>([])
  const [payroll, setPayroll] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [showFeeModal, setShowFeeModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  
  const supabase = createClient()
  const role = profile?.role

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

      if (profileData.role === 'admin' || profileData.role === 'accountant') {
        const { data: invData } = await supabase.from('invoices').select('*, students(full_name, grade, section)').order('created_at', { ascending: false })
        setInvoices(invData || [])

        const { data: feeData } = await supabase.from('student_fees').select('*, students(full_name, grade, section)')
        setStudentFees(feeData || [])

        const { data: payData } = await supabase.from('payroll').select('*, profiles(full_name, role)').order('month', { ascending: false })
        setPayroll(payData || [])

        const { data: stuData } = await supabase.from('students').select('*').order('full_name')
        setStudents(stuData || [])
        
        setActiveTab('overview')
      } else if (profileData.role === 'parent') {
        // Find kids
        const { data: myKids } = await supabase.from('students').select('id').eq('parent_id', user.id)
        const kidIds = myKids?.map(k => k.id) || []
        
        if (kidIds.length > 0) {
          const { data: invData } = await supabase.from('invoices').select('*, students(full_name)').in('student_id', kidIds).order('created_at', { ascending: false })
          setInvoices(invData || [])
        }
        setActiveTab('my-fees')
      } else {
        // Teacher/Staff
        const { data: payData } = await supabase.from('payroll').select('*, profiles(full_name, role)').eq('employee_id', user.id).order('month', { ascending: false })
        setPayroll(payData || [])
        setActiveTab('my-salary')
      }

    } catch (err) {
      console.error("Finance fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateMonthlyInvoices = async () => {
    const defaultFee = prompt('Enter the standard monthly fee for students without a custom fee set:', '2000')
    if (defaultFee === null) return
    const defaultAmount = Number(defaultFee)

    if (!confirm(`This will generate pending invoices for ALL students. Students with custom fees will use their set amount. Others will use Rs. ${defaultAmount}. Proceed?`)) return
    
    setIsLoading(true)
    try {
      const monthLabel = new Date().toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })
      const { data: students } = await supabase.from('students').select('id')
      const { data: fees } = await supabase.from('student_fees').select('*')

      const invoiceData = students?.map(s => {
        const studentFee = fees?.find(f => f.student_id === s.id)
        const amount = studentFee ? (studentFee.monthly_fee - studentFee.discount) : defaultAmount
        
        return {
          student_id: s.id,
          school_id: profile.school_id,
          amount,
          fee_type: `Monthly Fee - ${monthLabel}`,
          status: 'pending',
          due_date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0]
        }
      })

      if (invoiceData && invoiceData.length > 0) {
        const { error } = await supabase.from('invoices').insert(invoiceData)
        if (error) throw error
        alert(`${invoiceData.length} invoices generated successfully!`)
        fetchInitialData()
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateInvoice = async (studentId: string, feeType: string, amount: number) => {
    const { error } = await supabase.from('invoices').insert({
      student_id: studentId,
      school_id: profile.school_id,
      amount,
      fee_type: feeType,
      status: 'pending',
      due_date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0]
    })
    if (error) alert(error.message)
    else fetchInitialData()
  }

  const handleUpdateFee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const monthly_fee = Number(formData.get('monthly_fee'))
    const discount = Number(formData.get('discount'))
    
    const { error } = await supabase.from('student_fees').upsert({
      student_id: selectedStudent.id,
      school_id: profile.school_id,
      monthly_fee,
      discount,
    }, { onConflict: 'student_id' })

    if (error) alert(error.message)
    else {
      setShowFeeModal(false)
      fetchInitialData()
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100'
      case 'overdue': return 'bg-rose-50 text-rose-700 border-rose-100'
      default: return 'bg-slate-50 text-slate-500 border-slate-100'
    }
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
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter">Finance Hub</h3>
          <p className="text-slate-500 font-bold text-sm">Manage school fees, staff payroll, and financial reports.</p>
        </div>
        
        {/* Role-based Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          {(role === 'admin' || role === 'accountant') && (
            <>
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >Overview</button>
              <button 
                onClick={() => setActiveTab('fees')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'fees' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >Student Fees</button>
              <button 
                onClick={() => setActiveTab('payroll')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'payroll' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >Staff Payroll</button>
            </>
          )}
          {role === 'parent' && (
            <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-sm">My Children's Fees</button>
          )}
          {role === 'teacher' && (
            <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-sm">My Salary</button>
          )}
        </div>
      </div>

      {/* Stats Overview for Admin/Accountant */}
      {activeTab === 'overview' && (role === 'admin' || role === 'accountant') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glassmorphism p-6 rounded-3xl border border-white/50 bg-indigo-50/30">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600"><Wallet size={24} /></div>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-white/80 px-2 py-1 rounded-lg">Collected</span>
            </div>
            <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">
              Rs. {invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </p>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">Total Fee Revenue</p>
          </div>
          <div className="glassmorphism p-6 rounded-3xl border border-white/50 bg-amber-50/30">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600"><Clock size={24} /></div>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-white/80 px-2 py-1 rounded-lg">Pending</span>
            </div>
            <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">
              Rs. {invoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </p>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">Outstanding Dues</p>
          </div>
          <div className="glassmorphism p-6 rounded-3xl border border-white/50 bg-rose-50/30">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-rose-600"><CreditCard size={24} /></div>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-white/80 px-2 py-1 rounded-lg">Payroll</span>
            </div>
            <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">
              Rs. {payroll.filter(p => !p.month.startsWith('2025')).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </p>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">Current Month Salary</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="glassmorphism rounded-[2.5rem] border border-white/50 overflow-hidden shadow-sm">
        {/* Student Fees Tab (Accountant) */}
        {activeTab === 'fees' && (
          <div className="p-0">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/20">
              <h4 className="font-bold text-slate-800">Student Fee Management</h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 outline-none w-64" placeholder="Search student..." />
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Class</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Fee</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(student => {
                  const fee = studentFees.find(f => f.student_id === student.id)
                  return (
                    <tr key={student.id} className="hover:bg-white/40 group">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-900">{student.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Roll: {student.roll_no || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">{student.grade} - {student.section}</span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-display font-bold text-indigo-600">Rs. {fee?.monthly_fee?.toLocaleString() || '0'}</p>
                        {fee?.discount > 0 && <p className="text-[10px] text-emerald-500 font-bold uppercase">Discount: Rs. {fee.discount}</p>}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => { setSelectedStudent(student); setShowFeeModal(true); }}
                          className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-indigo-600"
                        >
                          <Pencil size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Overview Tab (Accountant) - List of Invoices */}
        {activeTab === 'overview' && (
          <div className="p-0">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/20">
              <h4 className="font-bold text-slate-800">Recent Invoices & Collections</h4>
              <button 
                onClick={handleGenerateMonthlyInvoices}
                className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
              >
                <Plus size={16} /> Generate Monthly Invoices
              </button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student / Payee</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-white/40 group">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900">{inv.students?.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{inv.students?.grade} - {inv.students?.section}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded-lg text-slate-500">{inv.fee_type}</span>
                    </td>
                    <td className="px-8 py-5 font-display font-bold text-slate-900">Rs. {inv.amount.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">
                      {new Date(inv.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* My Fees Tab (Parent) */}
        {activeTab === 'my-fees' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4 p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600"><AlertCircle size={24} /></div>
              <div>
                <p className="font-bold text-indigo-900">Payment Reminder</p>
                <p className="text-sm text-indigo-700 font-medium tracking-tight">Your child's monthly fee for April is due by the 10th. Please pay at the counter or online.</p>
              </div>
            </div>
            <div className="space-y-4">
              {invoices.map(inv => (
                <div key={inv.id} className="flex justify-between items-center p-6 bg-white/50 border border-white rounded-[2rem] hover:shadow-lg hover:shadow-slate-100 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      <Receipt size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{inv.fee_type} — {inv.students?.full_name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Dated: {new Date(inv.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-display font-bold text-slate-900">Rs. {inv.amount.toLocaleString()}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(inv.status)}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payroll Tab (Accountant / Staff) */}
        {(activeTab === 'payroll' || activeTab === 'my-salary') && (
          <div className="p-0">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/20">
              <h4 className="font-bold text-slate-800">{activeTab === 'payroll' ? 'Staff Payroll Management' : 'My Salary History'}</h4>
              {activeTab === 'payroll' && (
                <button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Coins size={16} /> Run Payroll
                </button>
              )}
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {activeTab === 'payroll' && <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</th>}
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Month</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Gross Pay</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payroll.map(pay => (
                  <tr key={pay.id} className="hover:bg-white/40 group">
                    {activeTab === 'payroll' && (
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-900">{pay.profiles?.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase capitalize">{pay.profiles?.role}</p>
                      </td>
                    )}
                    <td className="px-8 py-5 text-center">
                      <span className="font-bold text-slate-600">{new Date(pay.month).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}</span>
                    </td>
                    <td className="px-8 py-5 font-display font-bold text-emerald-600">Rs. {pay.amount.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(pay.status)}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fee Editor Modal */}
      {showFeeModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <form onSubmit={handleUpdateFee} className="w-full max-w-lg glassmorphism p-8 md:p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Set Unique Fee</h2>
              <button type="button" onClick={() => setShowFeeModal(false)} className="text-slate-400 hover:text-slate-900 transition-all bg-white shadow-sm p-2 rounded-xl">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Student</p>
                <p className="font-bold text-slate-900">{selectedStudent.full_name}</p>
                <p className="text-xs text-slate-500">{selectedStudent.grade} — {selectedStudent.section}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Monthly Fee (Rs.)</label>
                  <input 
                    name="monthly_fee"
                    type="number"
                    defaultValue={studentFees.find(f => f.student_id === selectedStudent.id)?.monthly_fee || 0}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-1">Monthly Discount (Rs.)</label>
                  <input 
                    name="discount"
                    type="number"
                    defaultValue={studentFees.find(f => f.student_id === selectedStudent.id)?.discount || 0}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button type="button" onClick={() => setShowFeeModal(false)} className="flex-1 glassmorphism font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all text-slate-600">Cancel</button>
              <button 
                type="submit" 
                className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                Save Fee Configuration
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
