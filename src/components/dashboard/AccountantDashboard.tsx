'use client'

import { 
  CreditCard, TrendingUp, TrendingDown, Clock, 
  AlertCircle, FileText, Download, ArrowRight,
  PieChart, BarChart3, Loader2, Plus
} from 'lucide-react'
import Link from 'next/link'

interface AccountantDashboardProps {
  stats: any
}

export default function AccountantDashboard({ stats }: AccountantDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-800 tracking-tighter italic">Financial Control Center</h3>
          <p className="text-slate-500 font-bold text-sm">Monitor revenue, pending fees, and school expenses.</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 text-xs uppercase tracking-widest">
              <Plus size={16} /> Create Invoice
           </button>
           <button className="glassmorphism px-5 py-2.5 rounded-xl font-bold text-slate-600 flex items-center gap-2 border border-slate-100 hover:bg-white transition-all text-xs uppercase tracking-widest">
              <Download size={16} /> Export Report
           </button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 space-y-2">
           <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <TrendingUp size={24} />
           </div>
           <p className="text-4xl font-display font-bold text-slate-900 leading-none">Rs. {stats.feesCollected?.toLocaleString() || '450,000'}</p>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Collected (Month)</p>
           <div className="pt-2 text-emerald-600 text-[10px] font-bold">↑ 14% vs last month</div>
        </div>

        <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 space-y-2">
           <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Clock size={24} />
           </div>
           <p className="text-4xl font-display font-bold text-slate-900 leading-none">Rs. {stats.totalPending?.toLocaleString() || '125,000'}</p>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Invoices</p>
           <div className="pt-2 text-amber-600 text-[10px] font-bold">42 Unpaid Invoices</div>
        </div>

        <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 space-y-2">
           <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <TrendingDown size={24} />
           </div>
           <p className="text-4xl font-display font-bold text-slate-900 leading-none">Rs. 85,000</p>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operating Expenses</p>
           <div className="pt-2 text-rose-600 text-[10px] font-bold">Salary & Utilities</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 glassmorphism rounded-[3rem] border border-white/50 overflow-hidden shadow-sm">
           <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-transparent">
              <h4 className="font-bold text-xl tracking-tight text-slate-900">Recent Transactions</h4>
              <Link href="/dashboard/finance" className="text-indigo-600 font-bold text-xs uppercase tracking-widest">All Finance</Link>
           </div>
           <div className="p-4 space-y-2">
              {[
                { name: "Ahmed Khan", type: "Tuition Fee", amount: "12,000", status: "Paid", date: "Today" },
                { name: "Zoya Khan", type: "Admission Fee", amount: "25,000", status: "Paid", date: "Yesterday" },
                { name: "Sami Ullah", type: "Library Fine", amount: "500", status: "Pending", date: "2 days ago" },
              ].map((tx, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-white/40 transition-all rounded-2xl cursor-pointer border border-transparent hover:border-slate-100">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${tx.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                         <CreditCard size={20} />
                      </div>
                      <div>
                         <p className="font-bold text-slate-900">{tx.name}</p>
                         <p className="text-xs text-slate-500 font-medium">{tx.type} • {tx.date}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-bold text-slate-900">Rs. {tx.amount}</p>
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest ${tx.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{tx.status}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Charts & Analysis */}
        <div className="space-y-8">
           <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 shadow-sm relative overflow-hidden bg-slate-900 text-white">
              <PieChart className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
              <h4 className="font-bold text-lg mb-6">Revenue Mix</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tuition Fees</span>
                    <span className="text-sm font-bold text-white">70%</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Admissions</span>
                    <span className="text-sm font-bold text-white">20%</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Transport</span>
                    <span className="text-sm font-bold text-white">10%</span>
                 </div>
              </div>
           </div>

           <div className="glassmorphism p-8 rounded-[3rem] border border-white/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                 <AlertCircle size={20} className="text-rose-500" />
                 <h4 className="font-bold text-lg text-slate-900 tracking-tight">Audit Alerts</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"3 invoices are past their due date by more than 15 days."</p>
           </div>
        </div>
      </div>
    </div>
  )
}
