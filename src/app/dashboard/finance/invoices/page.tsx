'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  CreditCard, ExternalLink, Download, Clock, 
  CheckCircle2, AlertCircle, Loader2, Calendar
} from 'lucide-react'
import Link from 'next/link'

export default function ParentInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    fetchMyInvoices()
  }, [])

  const fetchMyInvoices = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('invoices')
      .select('*, students(full_name)')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) console.error(error)
    else setInvoices(data || [])
    setIsLoading(false)
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-1">
        <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter">My Invoices</h3>
        <p className="text-slate-500 font-bold text-sm">View and pay your children's school fees.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center">
             <Loader2 className="animate-spin text-slate-300" size={40} />
          </div>
        ) : invoices.length > 0 ? invoices.map((invoice) => (
          <div key={invoice.id} className="glassmorphism p-6 rounded-[2.5rem] border border-white/50 space-y-5 flex flex-col relative overflow-hidden group">
            {/* Status Ribon */}
            <div className={`absolute top-4 right-[-35px] rotate-45 w-32 py-1 text-center text-[10px] font-extrabold uppercase tracking-widest border transition-all ${
              invoice.status === 'paid' ? 'bg-emerald-500 text-white border-emerald-400' : 
              invoice.status === 'overdue' ? 'bg-rose-500 text-white border-rose-400' : 
              'bg-amber-500 text-white border-amber-400'
            }`}>
              {invoice.status}
            </div>

            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                  <CreditCard size={20} />
               </div>
               <div>
                  <h4 className="text-lg font-bold text-slate-900 tracking-tight">{invoice.students?.full_name}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{invoice.fee_type} Fee</p>
               </div>
            </div>

            <div className="space-y-2 py-2 border-y border-slate-100/50">
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium tracking-tight">Amount Due:</span>
                  <span className="font-extrabold text-slate-900">Rs. {Number(invoice.amount).toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium tracking-tight">Due Date:</span>
                  <span className={`font-bold ${invoice.status === 'overdue' ? 'text-rose-500' : 'text-slate-600'}`}>
                     {new Date(invoice.due_date).toLocaleDateString()}
                  </span>
               </div>
            </div>

            <div className="flex gap-3 pt-2">
               <Link 
                href={`/dashboard/finance/invoices/${invoice.id}`}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
               >
                  <ExternalLink size={14} /> View Bill
               </Link>
               {invoice.status !== 'paid' && (
                 <button className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
                    Pay Now
                 </button>
               )}
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar size={32} className="text-slate-300" />
             </div>
             <p className="text-slate-500 font-bold">No invoices found for your account.</p>
          </div>
        )}
      </div>
    </div>
  )
}
