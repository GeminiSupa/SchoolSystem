import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function BlogPage() {
  const posts = [
    { category: "EdTech Pakistan", title: "How Digital Attendance is Reducing Absenteeism in Pakistani Schools by 40%", date: "March 2026", readTime: "5 min read", excerpt: "Schools across Punjab and Sindh are reporting dramatic improvements in student attendance after switching to digital ERP systems..." },
    { category: "Finance", title: "Online Fee Collection via JazzCash & EasyPaisa: A Game Changer for Private Schools", date: "February 2026", readTime: "4 min read", excerpt: "A deep dive into how mobile payment gateways are helping private schools recover 95%+ of fee on time..." },
    { category: "Government Schools", title: "EMIS Integration: How POS ERP Helps Government Schools Meet Reporting Deadlines", date: "February 2026", readTime: "6 min read", excerpt: "The Education Management Information System (EMIS) requires monthly reports from thousands of government schools. Here's how automation helps..." },
    { category: "Product Update", title: "New Feature: Urdu Report Cards and Parent Notifications", date: "January 2026", readTime: "3 min read", excerpt: "POS ERP now supports fully bilingual (Urdu/English) report cards and automated WhatsApp message alerts for parents..." },
    { category: "Success Story", title: "How City Grammar School Lahore Reduced Admin Work by 70% in 3 Months", date: "January 2026", readTime: "7 min read", excerpt: "A case study on how a 1,200-student school transformed their operations using POS School ERP..." },
    { category: "Tips & Guides", title: "5 Steps to Successfully Onboard Your Teaching Staff on a New ERP System", date: "December 2025", readTime: "5 min read", excerpt: "Change management is the hardest part of any ERP implementation. Here's a practical guide for Pakistani school principals..." },
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

      <section className="pt-32 pb-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-5xl font-display font-bold text-slate-900">Insights for Pakistani Educators</h1>
          <p className="text-xl text-slate-500">News, guides, and success stories from schools across Pakistan.</p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <div key={i} className="glassmorphism rounded-3xl overflow-hidden border border-white/50 hover:shadow-xl transition-all flex flex-col">
              <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <span className="text-6xl">📚</span>
              </div>
              <div className="p-6 flex flex-col gap-3 flex-1">
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">{post.category}</p>
                <h3 className="font-bold text-slate-900 leading-tight">{post.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-1">{post.excerpt}</p>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
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
