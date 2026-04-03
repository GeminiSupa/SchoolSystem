import Link from 'next/link'

export default function IntegrationsPage() {
  const integrations = [
    { name: "JazzCash", category: "Payments", desc: "Accept fee payments via JazzCash wallet and mobile banking — the most popular payment method in Pakistan.", logo: "💚" },
    { name: "EasyPaisa", category: "Payments", desc: "Accept fee payments via EasyPaisa across all 47,000+ service centers and the mobile app.", logo: "🟠" },
    { name: "WhatsApp Business", category: "Communication", desc: "Send automated fee reminders, exam alerts, and attendance notifications directly to parents on WhatsApp.", logo: "💬" },
    { name: "SMS (Jazz/Telenor/Ufone/Zong)", category: "Communication", desc: "SMS notifications for all major Pakistani networks. No smartphone required — works on any mobile phone.", logo: "📱" },
    { name: "EMIS (Education Management)", category: "Government", desc: "Seamless data exchange with government EMIS portals for Punjab, Sindh, KPK, and Balochistan.", logo: "🏛️" },
    { name: "FBR Tax System", category: "Finance", desc: "Generate FBR-compliant tax invoices and auto-calculate applicable sales tax on fee collections.", logo: "🧾" },
    { name: "Google Workspace", category: "Productivity", desc: "Sync timetables, assignments, and school events with Google Calendar and share documents via Drive.", logo: "📅" },
    { name: "Microsoft 365", category: "Productivity", desc: "Import student data from Excel, export reports to Word/Excel, and integrate with Teams for online classes.", logo: "🖥️" },
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
          <h1 className="text-5xl lg:text-6xl font-display font-bold text-slate-900 leading-tight">
            Connects with the Tools<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Pakistan Uses Every Day</span>
          </h1>
          <p className="text-xl text-slate-500">From JazzCash to EMIS, POS integrates with the local services your school already relies on.</p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {integrations.map((item, i) => (
            <div key={i} className="glassmorphism p-6 rounded-3xl border border-white/50 space-y-3 hover:shadow-xl transition-all text-center">
              <div className="text-5xl">{item.logo}</div>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">{item.category}</p>
              <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="max-w-4xl mx-auto mt-16 glassmorphism p-8 rounded-3xl border border-indigo-100 bg-indigo-50/50 text-center space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Need a custom integration?</h3>
          <p className="text-slate-500">We offer API access on Growth and Enterprise plans. Connect any local or global service.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm">
            Talk to our team →
          </Link>
        </div>
      </section>

      <footer className="bg-slate-50 py-8 px-6 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2026 POS School Management ERP — A <a href="https://ux4u.online" className="text-indigo-500 hover:underline" target="_blank" rel="noopener">UX4U</a> Product.
      </footer>
    </div>
  )
}
