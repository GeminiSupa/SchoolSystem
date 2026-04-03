'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { 
  Printer, Download, ShieldCheck, Mail, Phone, 
  MapPin, Loader2, ArrowLeft, CreditCard 
} from 'lucide-react'

export default function InvoiceDetail() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchInvoice()
  }, [])

  const fetchInvoice = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, students(*), schools(*)')
      .eq('id', params.id)
      .single()
    
    if (error) {
      console.error(error)
      router.push('/dashboard/finance')
    } else {
      setInvoice(data)
    }
    setIsLoading(false)
  }

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
       <Loader2 className="animate-spin text-slate-400" size={48} />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors"
      >
        <ArrowLeft size={16} /> Back to Invoices
      </button>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 print:shadow-none print:border-none">
        {/* Header Ribbon */}
        <div className={`h-4 ${invoice.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        
        <div className="p-12 md:p-20 space-y-12">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-xl">S</div>
                 <h1 className="text-3xl font-display font-extrabold tracking-tighter text-slate-900 italic">EduOS</h1>
              </div>
              <div className="space-y-1 text-sm font-medium text-slate-500">
                <p className="flex items-center gap-2"><MapPin size={14} /> Main Campus, Education City</p>
                <p className="flex items-center gap-2"><Phone size={14} /> +92 (300) 123-4567</p>
                <p className="flex items-center gap-2"><Mail size={14} /> accounts@school.edu.pk</p>
              </div>
            </div>
            
            <div className="text-left md:text-right space-y-2">
               <h2 className="text-5xl font-display font-bold text-slate-900 tracking-tighter uppercase opacity-10">Invoice</h2>
               <p className="font-bold text-slate-500 tracking-widest uppercase text-xs">#INV-{invoice.id.slice(0, 8)}</p>
               <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border mt-4 ${
                 invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
               }`}>
                  {invoice.status}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-100">
             <div className="space-y-4">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Bill To</p>
                <div className="space-y-1">
                   <p className="text-xl font-bold text-slate-900 tracking-tight">{invoice.students?.full_name}</p>
                   <p className="text-sm font-bold text-slate-500">Grade: {invoice.students?.grade}-{invoice.students?.section}</p>
                   <p className="text-sm font-bold text-slate-500 italic">Student ID: {invoice.student_id.slice(0, 8)}</p>
                </div>
             </div>
             
             <div className="space-y-4 md:text-right">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Date Info</p>
                <div className="space-y-1">
                   <p className="text-sm font-bold text-slate-500">Issued: {new Date(invoice.created_at).toLocaleDateString()}</p>
                   <p className={`text-sm font-extrabold ${invoice.status === 'overdue' ? 'text-rose-500' : 'text-slate-900'}`}>
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                   </p>
                </div>
             </div>
          </div>

          {/* Table */}
          <div className="pt-12">
             <table className="w-full text-left">
                <thead>
                   <tr className="border-b-2 border-slate-900/5">
                      <th className="py-4 font-extrabold text-xs uppercase tracking-widest text-slate-500">Description</th>
                      <th className="py-4 font-extrabold text-xs uppercase tracking-widest text-slate-500 text-right">Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   <tr>
                      <td className="py-6">
                         <p className="font-bold text-slate-900">{invoice.fee_type === 'tuition' ? 'Tuition Fee' : invoice.fee_type}</p>
                         <p className="text-xs text-slate-400 mt-1 font-medium">{invoice.description}</p>
                      </td>
                      <td className="py-6 text-right font-bold text-slate-900">Rs. {Number(invoice.amount).toLocaleString()}</td>
                   </tr>
                   {/* Add other rows if needed */}
                </tbody>
                <tfoot>
                   <tr className="bg-slate-50/50">
                      <td className="py-6 px-4 text-right font-bold text-slate-500">Total Amount</td>
                      <td className="py-6 px-4 text-right text-2xl font-display font-bold text-slate-900 tracking-tighter">Rs. {Number(invoice.amount).toLocaleString()}</td>
                   </tr>
                </tfoot>
             </table>
          </div>

          <div className="pt-12 space-y-8">
             <div className="bg-slate-900 text-white p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                   <CreditCard className="text-slate-400" size={32} />
                   <div>
                      <p className="font-bold tracking-tight">Payment Instructions</p>
                      <p className="text-xs text-slate-400 mt-1">Please pay before the due date to avoid late fees.</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <button 
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                   >
                      <Printer size={16} /> Print
                   </button>
                   <button className="px-6 py-3 bg-white text-slate-900 rounded-xl text-sm font-bold transition-all shadow-xl shadow-black/20 flex items-center gap-2">
                      <ShieldCheck size={16} /> Pay Securely
                   </button>
                </div>
             </div>
             
             <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                This is a computer generated invoice and does not require a signature.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
