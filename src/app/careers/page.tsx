import Link from 'next/link'

export default function CareersPage() {
  const jobs = [
    { title: "Full-Stack Engineer (Next.js)", type: "Full-time", location: "Lahore / Remote", dept: "Engineering" },
    { title: "School Implementation Consultant", type: "Full-time", location: "Karachi, Lahore, Islamabad", dept: "Customer Success" },
    { title: "UX Designer", type: "Full-time", location: "Remote (Pakistan)", dept: "Design" },
    { title: "Sales Executive – EdTech", type: "Full-time", location: "Lahore / Karachi", dept: "Sales" },
    { title: "Urdu Content Writer", type: "Part-time", location: "Remote", dept: "Marketing" },
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
            Join the Team<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Shaping EdTech in Pakistan</span>
          </h1>
          <p className="text-xl text-slate-500">We're a growing team at UX4U building Pakistan's most advanced school management platform. Come build with us.</p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-display font-bold text-slate-900">Open Positions</h2>
          {jobs.map((job, i) => (
            <div key={i} className="glassmorphism p-8 rounded-3xl border border-white/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-lg transition-all">
              <div className="space-y-1">
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">{job.dept}</p>
                <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[11px] font-bold">{job.type}</span>
                  <span>📍 {job.location}</span>
                </div>
              </div>
              <a href="mailto:info@ux4u.online?subject=Application: Job at POS ERP" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm flex-shrink-0">
                Apply Now
              </a>
            </div>
          ))}
          <div className="glassmorphism p-8 rounded-3xl border border-indigo-100 bg-indigo-50/50 text-center space-y-4">
            <p className="text-slate-700 font-medium">Don't see your role? We're always looking for talented people.</p>
            <a href="mailto:info@ux4u.online?subject=Open Application - POS ERP" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline">
              Send an open application →
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-slate-50 py-8 px-6 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2026 POS School Management ERP — A <a href="https://ux4u.online" className="text-indigo-500 hover:underline" target="_blank" rel="noopener">UX4U</a> Product.
      </footer>
    </div>
  )
}
