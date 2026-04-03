import Link from 'next/link'
import { Shield, Lock, Server, Eye, CheckCircle2 } from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full z-50 glassmorphism border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-display font-bold text-xl">P</span>
          </div>
          <span className="text-2xl font-display font-bold tracking-tight">POS</span>
        </Link>
        <Link href="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all">Login</Link>
      </nav>

      <section className="pt-32 pb-20 px-6 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold text-white">Enterprise-Grade Security<br />for Pakistani Schools</h1>
          <p className="text-xl text-slate-400">Protecting 50,000+ students' data with the highest security standards.</p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: <Lock className="text-indigo-600" size={28} />, title: "End-to-End Encryption", body: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256. Your student and financial records are never readable by unauthorized parties." },
            { icon: <Server className="text-emerald-600" size={28} />, title: "Multi-Tenant Isolation", body: "Each school's data is completely isolated at the database level using Row-Level Security (RLS). It is architecturally impossible for one school to see another's data." },
            { icon: <Eye className="text-violet-600" size={28} />, title: "Audit Logs", body: "Every action taken by every user is logged with timestamps. Admins can review who accessed what data and when — crucial for PECA compliance." },
            { icon: <Shield className="text-amber-600" size={28} />, title: "Role-Based Access Control", body: "Granular permissions ensure teachers only see their classes, accountants only see financial data, and parents only see their own children's information." },
          ].map((item, i) => (
            <div key={i} className="glassmorphism p-10 rounded-3xl border border-white/50 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">{item.icon}</div>
              <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl font-display font-bold text-slate-900 text-center">Security Certifications & Compliance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "PECA 2016 Compliant", desc: "Fully compliant with Pakistan's Prevention of Electronic Crimes Act" },
              { label: "PCI-DSS for Payments", desc: "Payment processing meets international card security standards" },
              { label: "ISO 27001 Aligned", desc: "Information security management following ISO best practices" },
            ].map((cert, i) => (
              <div key={i} className="glassmorphism p-6 rounded-2xl border border-white/50 text-center space-y-2">
                <CheckCircle2 className="text-emerald-500 mx-auto" size={32} />
                <p className="font-bold text-slate-900">{cert.label}</p>
                <p className="text-xs text-slate-500">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white py-8 px-6 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2026 POS School Management ERP — A <a href="https://ux4u.online" className="text-indigo-500 hover:underline" target="_blank" rel="noopener">UX4U</a> Product.
      </footer>
    </div>
  )
}
