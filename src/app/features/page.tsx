import Link from 'next/link'
import { CheckCircle2, Users, BarChart2, Shield, Zap, CreditCard, ClipboardCheck, GraduationCap, BookOpen, Bell } from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    { icon: <Users size={24} />, title: "Multi-Role Dashboards", desc: "Dedicated portals for Super Admin, School Admin, Teacher, Parent, and Student — each tailored to their daily tasks.", highlight: true },
    { icon: <ClipboardCheck size={24} />, title: "Smart Attendance", desc: "Digital biometric-ready attendance for students and staff with instant SMS alerts to parents.", highlight: false },
    { icon: <GraduationCap size={24} />, title: "Result & Exam Management", desc: "Automated result cards, grade booklets, and board-format transcripts compliant with Pakistani boards (BISE).", highlight: false },
    { icon: <CreditCard size={24} />, title: "Fee Management & Vouchers", desc: "Generate fee challan slips, track installments, and accept JazzCash / EasyPaisa payments online.", highlight: true },
    { icon: <BarChart2 size={24} />, title: "Analytics & Reports", desc: "Data-driven reports for attendance trends, fee recovery rates, and academic performance — exportable to PDF/Excel.", highlight: false },
    { icon: <Bell size={24} />, title: "Real-time Notifications", desc: "Push and SMS notifications for fee reminders, exam alerts, and school announcements in Urdu & English.", highlight: false },
    { icon: <BookOpen size={24} />, title: "Timetable & Scheduling", desc: "Conflict-free class scheduling, teacher allocation, and substitute management.", highlight: false },
    { icon: <Shield size={24} />, title: "Multi-Tenant Security", desc: "Enterprise-grade data isolation — each school's data is completely separate and encrypted at rest.", highlight: true },
    { icon: <Zap size={24} />, title: "Payroll & HR", desc: "Staff salary processing, provident fund, EOBI deductions, and payslip generation — following Pakistan labour law.", highlight: false },
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
            Every Feature Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">School Needs</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">Built for the unique needs of Pakistani educational institutions — from KG to Matric, private to government.</p>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className={`glassmorphism p-8 rounded-3xl border space-y-4 transition-all hover:shadow-xl ${f.highlight ? 'border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-violet-50/50' : 'border-white/50'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${f.highlight ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-900 mx-6 mb-16 rounded-[3rem]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-display font-bold text-white">Ready to modernize your school?</h2>
          <p className="text-slate-400 text-lg">Join 500+ Pakistani institutions already using POS ERP.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all">
            Start Free Trial
          </Link>
        </div>
      </section>

      <footer className="bg-slate-50 py-8 px-6 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2026 POS School Management ERP — A <a href="https://ux4u.online" className="text-indigo-500 hover:underline" target="_blank" rel="noopener">UX4U</a> Product.
      </footer>
    </div>
  )
}
