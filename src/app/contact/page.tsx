import Link from 'next/link'
import { Mail, Phone, MapPin, MessageSquare, ArrowRight } from 'lucide-react'

export default function ContactPage() {
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
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-5xl lg:text-6xl font-display font-bold text-slate-900 leading-tight">
            Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Talk</span>
          </h1>
          <p className="text-xl text-slate-500">Our team is ready to help you digitize your institution. Reach out in English or Urdu.</p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="glassmorphism p-10 rounded-[2.5rem] border border-white/50 space-y-6">
            <h2 className="text-2xl font-display font-bold text-slate-900">Send us a message</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <input className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all" placeholder="Muhammad Ali" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Institution</label>
                <input className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all" placeholder="City Grammar School" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all" placeholder="principal@school.edu.pk" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone (WhatsApp)</label>
              <input type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all" placeholder="+92 300 0000000" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Message</label>
              <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 transition-all resize-none" placeholder="I'm interested in a demo for our school..." />
            </div>
            <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
              Send Message <ArrowRight size={18} />
            </button>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold text-slate-900">Get in touch</h2>
              <p className="text-slate-500 leading-relaxed">Whether you need a demo, have a technical question, or want to discuss pricing — we are here to help. Based in Pakistan, serving Pakistan.</p>
            </div>
            <div className="space-y-6">
              {[
                { icon: <Mail className="text-indigo-600" size={22} />, label: "Email", value: "info@ux4u.online", href: "mailto:info@ux4u.online" },
                { icon: <Phone className="text-emerald-600" size={22} />, label: "WhatsApp / Phone", value: "+92 349 0554179", href: "https://wa.me/923490554179" },
                { icon: <MapPin className="text-rose-500" size={22} />, label: "Location", value: "I 16-3, service road east, Islamabad", href: "#" },
                { icon: <MessageSquare className="text-violet-600" size={22} />, label: "Support Hours", value: "Mon–Sat, 9am – 6pm PKT", href: "#" },
              ].map((item, i) => (
                <a key={i} href={item.href} className="flex items-start gap-4 p-5 glassmorphism rounded-2xl border border-white/50 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>
            <div className="glassmorphism p-6 rounded-2xl border border-indigo-100 bg-indigo-50/50">
              <p className="text-sm text-indigo-700 font-medium">💬 <strong>Speak Urdu?</strong> Our support team is fully bilingual. Feel free to reach out in Urdu!</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-50 py-8 px-6 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2026 POS School Management ERP — A <a href="https://ux4u.online" className="text-indigo-500 hover:underline" target="_blank" rel="noopener">UX4U</a> Product.
      </footer>
    </div>
  )
}
