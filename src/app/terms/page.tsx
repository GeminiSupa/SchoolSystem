import Link from 'next/link'

export default function TermsPage() {
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

      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-5xl font-display font-bold text-slate-900 mb-4">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-12">Effective: March 2026 &mdash; Governing Law: Islamic Republic of Pakistan</p>

        {[
          { title: "1. Acceptance of Terms", body: "By registering your institution on POS School ERP, you agree to these Terms of Service. These terms constitute a legally binding agreement between your institution and UX4U (the platform operator) under the laws of Pakistan." },
          { title: "2. Eligibility", body: "POS ERP is available to registered educational institutions in Pakistan. By signing up, you confirm that the institution is legally registered with the relevant provincial or federal education authority." },
          { title: "3. Subscription & Payments", body: "Subscription fees are billed monthly in PKR. All payments are subject to applicable taxes including Sales Tax as per FBR regulations. Failure to pay may result in account suspension after a 14-day grace period." },
          { title: "4. Acceptable Use", body: "The platform must be used solely for school administration purposes. You agree not to: misuse student or parent data, attempt unauthorized access to other tenants' data, or use the platform for any activity prohibited under PECA 2016." },
          { title: "5. Data Ownership", body: "All academic and financial data entered by your institution remains your property. UX4U does not claim ownership of your data. Upon contract termination, you may request a full data export." },
          { title: "6. Service Availability", body: "We target 99.9% uptime. Planned maintenance is communicated 48 hours in advance. UX4U is not liable for downtime caused by force majeure events including PTCL/ISP outages." },
          { title: "7. Termination", body: "Either party may terminate the agreement with 30 days written notice. Upon termination, data is retained for 90 days for export before secure deletion." },
          { title: "8. Disputes", body: "Any disputes will be resolved under the jurisdiction of the courts of Lahore, Pakistan. We encourage amicable resolution before legal proceedings." },
        ].map((section, i) => (
          <div key={i} className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-3">{section.title}</h2>
            <p className="text-slate-500 leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>

      <footer className="bg-slate-50 py-8 px-6 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2026 POS School Management ERP — A <a href="https://ux4u.online" className="text-indigo-500 hover:underline" target="_blank" rel="noopener">UX4U</a> Product.
      </footer>
    </div>
  )
}
