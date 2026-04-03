import Link from 'next/link'
import { School, Building2, Users, BookOpen, ArrowRight } from 'lucide-react'

export default function SolutionsPage() {
  const solutions = [
    {
      icon: <School size={32} className="text-indigo-600" />,
      title: "Private Schools",
      subtitle: "O & A Level, Cambridge, Matric",
      desc: "Complete administration suite for fee management, parent communication, and academic tracking. Supports Cambridge grading, BISE result formats and O-Level mark sheets.",
      features: ["Multi-class timetabling", "Parent WhatsApp alerts", "BISE compatible transcripts", "Online fee collection"],
    },
    {
      icon: <Building2 size={32} className="text-emerald-600" />,
      title: "Government Schools",
      subtitle: "Primary, Middle, High Schools",
      desc: "Designed to work within the constraints of government institutions — offline-capable, minimal hardware requirements, and supports Urdu interface.",
      features: ["Urdu language support", "Works on low-speed internet", "Free for government", "EMIS integration ready"],
    },
    {
      icon: <Users size={32} className="text-violet-600" />,
      title: "School Chains & Networks",
      subtitle: "Multi-campus management",
      desc: "Manage dozens of campuses from a single Super Admin dashboard. Unified reporting, cross-campus transfers, and centralized fee management.",
      features: ["Multi-campus dashboard", "Cross-campus reporting", "Centralized payroll", "Brand customization"],
    },
    {
      icon: <BookOpen size={32} className="text-amber-600" />,
      title: "Colleges & Institutes",
      subtitle: "Intermediate, Vocational & Technical",
      desc: "Support for intermediate-level academics, department management, and HSSC exam preparation. Ideal for private colleges and vocational institutes.",
      features: ["Department management", "HSSC board compatibility", "Scholarship tracking", "Hostel management"],
    },
  ]

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

      <section className="pt-32 pb-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 leading-tight">
            Solutions for Every<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Pakistani Institution</span>
          </h1>
          <p className="text-xl text-slate-500">From a 50-student primary school in Quetta to a 10,000-student network in Karachi — POS adapts to you.</p>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((s, i) => (
            <div key={i} className="glassmorphism p-10 rounded-3xl border border-white/50 hover:shadow-xl transition-all space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">{s.icon}</div>
              <div>
                <h3 className="text-2xl font-display font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mt-1">{s.subtitle}</p>
              </div>
              <p className="text-slate-500 leading-relaxed">{s.desc}</p>
              <ul className="space-y-2">
                {s.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="inline-flex items-center gap-2 text-slate-900 font-bold hover:text-indigo-600 transition-colors text-sm">
                Get Started <ArrowRight size={16} />
              </Link>
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
