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
          <img src="/logo.png" alt="AIM HIGH Logo" className="h-10 w-auto object-contain" />
        </Link>
        <Link href="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all">Login</Link>
      </nav>

      <section className="pt-32 pb-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 leading-tight">
            Careers at <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">AIM HIGH</span>
          </h1>
          <p className="text-xl text-slate-500">We appreciate your interest in joining our team. However, we are not currently hiring for any positions.</p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <svg xmlns="http://www.w3.org/2003/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Current Status: Not Hiring</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            While our team is currently at full capacity, we are always on the lookout for exceptional talent for future growth. Feel free to send your resume for our future records.
          </p>
          
          <div className="glassmorphism p-8 rounded-3xl border border-indigo-100 bg-indigo-50/50 text-center space-y-4 max-w-xl mx-auto mt-12">
            <p className="text-slate-700 font-medium font-display text-lg">Future Opportunities</p>
            <p className="text-sm text-slate-500">Interest in joining the mission? Send your profile to our talent pool.</p>
            <a href="mailto:info@ux4u.online?subject=Talent Pool Application - AIM HIGH" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline">
              Send an open application →
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-slate-50 py-8 px-6 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2026 AIM HIGH School Management System — A <a href="https://ux4u.online" className="text-indigo-500 hover:underline" target="_blank" rel="noopener">UX4U</a> Product.
      </footer>
    </div>
  )
}
