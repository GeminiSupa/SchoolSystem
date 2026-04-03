import Link from 'next/link'

export default function PrivacyPage() {
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

      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto prose prose-slate">
        <h1 className="text-5xl font-display font-bold text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: March 2026 &mdash; Applies to all POS School ERP users in Pakistan</p>

        {[
          { title: "1. Data We Collect", body: "We collect information necessary to operate the School ERP platform, including: school registration details (name, EMIS code, address), staff and student records entered by the school administration, attendance and academic data, fee payment records, and device & usage data for security purposes. We do not collect unnecessary personal data." },
          { title: "2. How We Use Your Data", body: "Your data is used exclusively to deliver POS ERP services. This includes: processing fee transactions, generating reports and transcripts, sending notifications to parents and staff, and improving platform performance. Your data is never sold to third parties." },
          { title: "3. Data Residency & Storage", body: "All data for Pakistani institutions is stored on servers compliant with Pakistan's Prevention of Electronic Crimes Act (PECA) 2016 and the Personal Data Protection Bill. We use Supabase infrastructure with optional on-premise deployment for government clients." },
          { title: "4. Data Access & Security", body: "Access to data is role-based and strictly controlled. Super Admins can only access platform-wide metadata. School Admins can only view their own school's data. No cross-tenant data access is permitted. Data is encrypted at rest (AES-256) and in transit (TLS 1.3)." },
          { title: "5. Parent & Student Rights", body: "Parents and students have the right to: request access to their personal data, request corrections to inaccurate records, and request deletion of data when withdrawing from the institution. Requests can be submitted via the school administration." },
          { title: "6. Data Retention", body: "Academic records are retained for 7 years as required by Pakistani education authorities. Financial records are retained for 6 years as per FBR requirements. After these periods, data is securely deleted." },
          { title: "7. Contact", body: "For any privacy-related concerns, contact our Data Protection Officer at: info@ux4u.online or via the Contact page." },
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
