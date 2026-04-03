import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function CompliancePage() {
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

      <section className="pt-32 pb-16 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-5xl font-display font-bold text-slate-900">Compliance & Regulatory Standards</h1>
          <p className="text-xl text-slate-500">POS ERP is built to meet all applicable Pakistani laws and education regulations.</p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {[
            {
              title: "PECA 2016 — Prevention of Electronic Crimes Act",
              items: ["Data is stored and processed within legally compliant infrastructure", "User access logging for all administrative actions", "Mandatory breach notification within 72 hours", "Zero storage of unauthorized personal identifiable information"],
            },
            {
              title: "FBR — Federal Board of Revenue",
              items: ["Fee invoices are FBR-compliant with proper tax registration", "Sales tax applied as per applicable provincial regulations", "Annual financial summaries exportable for tax filing", "POS ERP does not process cash — only digital, traceable payments"],
            },
            {
              title: "Provincial Education Departments",
              items: ["Compatible with Punjab School Education Department (SED) reporting", "Supports Sindh Education Foundation (SEF) data formats", "KPK Elementary & Secondary Education Department compatible", "Balochistan Education Department EMIS integration ready"],
            },
            {
              title: "Data Protection Bill (Forthcoming)",
              items: ["POS ERP is designed ahead of Pakistan's upcoming Personal Data Protection Bill", "Consent management for data collection", "Right to erasure support for students and parents", "Data minimization principles applied throughout the platform"],
            },
          ].map((section, i) => (
            <div key={i} className="glassmorphism p-8 rounded-3xl border border-white/50 space-y-4">
              <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-slate-50 py-8 px-6 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2026 POS School Management ERP — A <a href="https://ux4u.online" className="text-indigo-500 hover:underline" target="_blank" rel="noopener">UX4U</a> Product.
      </footer>
    </div>
  )
}
