import Link from 'next/link'
import { ArrowRight, Users, Globe, Zap, Heart, Award, Target } from 'lucide-react'

export default function AboutPage() {
  const team = [
    { name: "Omer Farooq", role: "Psychologist & UX Researcher / Founder", bio: "Helping businesses worldwide turn complex user problems into simple, effective digital experiences." },
    { name: "Abu Bakar", role: "Digital Marketing Specialist", bio: "Marketing strategist with expertise in driving growth through targeted campaigns and creative storytelling." },
    { name: "Ayesha Siddiqua", role: "UX Designer", bio: "Skilled in developing considerate, user-centered designs that streamline interactions." },
    { name: "Maaz Akram", role: "AI Marketing Specialist", bio: "Specializes in AI, marketing automation, and chatbots to optimize workflows." },
    { name: "Qudsia", role: "Graphic Designer", bio: "Focuses on captivating visual designs and brand identities to improve user interaction." },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glassmorphism border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-display font-bold text-xl">P</span>
          </div>
          <span className="text-2xl font-display font-bold tracking-tight">POS</span>
        </Link>
        <Link href="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all">
          Login
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold border border-indigo-100">
            <Globe size={14} /> A UX4U Initiative
          </div>
          <h1 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 leading-tight">
            Built in Pakistan.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">For Pakistan.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            POS School ERP is a product of <a href="https://ux4u.online" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">UX4U</a> — a design & technology company dedicated to empowering Pakistani institutions with world-class digital tools. We understand local challenges because we live them.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "500+", label: "Institutions Served" },
            { value: "50,000+", label: "Students Managed" },
            { value: "4+", label: "Countries Reached" },
            { value: "15+", label: "Happy Clients" },
          ].map((s, i) => (
            <div key={i} className="text-center glassmorphism p-6 rounded-3xl border border-slate-100">
              <p className="text-4xl font-display font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Target className="text-indigo-600" size={28} />, title: "Our Mission", body: "To digitize Pakistani education — making administration seamless for government, private and semi-government schools across Punjab, Sindh, KPK, Balochistan and AJK." },
            { icon: <Heart className="text-rose-500" size={28} />, title: "Our Values", body: "We believe in affordability, accessibility and excellence. Every school — from an elite institution in Lahore to a community school in rural Balochistan — deserves premium software." },
            { icon: <Award className="text-amber-500" size={28} />, title: "Our Heritage", body: "POS is built by UX4U — a multidisciplinary team of psychologists, designers, engineers, and marketers who put users first in everything they create." },
          ].map((item, i) => (
            <div key={i} className="glassmorphism p-8 rounded-3xl space-y-4 border border-white/50">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">{item.icon}</div>
              <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parent Company */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glassmorphism p-10 md:p-16 rounded-[3rem] border border-white/50 text-center space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-violet-50 opacity-50 pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Parent Company</p>
              <h2 className="text-4xl font-display font-bold text-slate-900">UX4U: Innovative Design<br />Powered by Psychology</h2>
              <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
                We blend psychology, design, and strategy to craft seamless, user-friendly experiences. Our team of researchers, designers, and marketers work together to deliver measurable results.
              </p>
              <a href="https://ux4u.online" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all">
                Visit UX4U <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Our Products */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">The UX4U Ecosystem</p>
            <h2 className="text-4xl font-display font-bold text-slate-900">Our Products</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">POS ERP is part of a growing suite of digital products built by UX4U to serve businesses and institutions worldwide.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                emoji: "🏫",
                name: "POS School ERP",
                url: null,
                badge: "You are here",
                badgeColor: "bg-indigo-100 text-indigo-700",
                desc: "Pakistan's most advanced multi-tenant School Management System. Covers academics, finance, payroll, attendance, and parent communication.",
                tags: ["EdTech", "Pakistan", "SaaS"],
              },
              {
                emoji: "⚖️",
                name: "Vakeel Diary",
                url: "https://vakeeldiary.com",
                badge: "Legal Tech",
                badgeColor: "bg-emerald-100 text-emerald-700",
                desc: "A comprehensive case and client management platform for Pakistani lawyers and law firms. Digital diary, hearing reminders, document vault, and client billing in one place.",
                tags: ["LegalTech", "Pakistan", "Lawyers"],
              },
              {
                emoji: "🛒",
                name: "Einfach Shop 24",
                url: "https://einfachshop24.com",
                badge: "E-Commerce",
                badgeColor: "bg-amber-100 text-amber-700",
                desc: "A German-market e-commerce and shop management platform. Streamlined product management, orders, and customer communication — built for European sellers.",
                tags: ["E-Commerce", "Germany", "Retail"],
              },
              {
                emoji: "🍽️",
                name: "Resto Manage",
                url: "https://restromanage.com",
                badge: "Restaurant Tech",
                badgeColor: "bg-rose-100 text-rose-700",
                desc: "End-to-end restaurant management software. Table reservations, order management, kitchen display system, and revenue analytics — for modern F&B businesses.",
                tags: ["RestaurantTech", "F&B", "SaaS"],
              },
            ].map((product, i) => (
              <div key={i} className="glassmorphism p-8 rounded-3xl border border-white/50 space-y-4 hover:shadow-xl transition-all flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-5xl">{product.emoji}</div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${product.badgeColor}`}>
                    {product.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900">{product.name}</h3>
                  {product.url && (
                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-500 hover:underline font-medium">
                      {product.url.replace('https://', '')} ↗
                    </a>
                  )}
                </div>
                <p className="text-slate-500 leading-relaxed flex-1">{product.desc}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.tags.map(tag => (
                    <span key={tag} className="text-[11px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-display font-bold text-slate-900">Meet Our Team</h2>
            <p className="text-slate-500 text-lg">A multidisciplinary team bringing research, design, and marketing together.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <div key={i} className="glassmorphism p-8 rounded-3xl border border-white/50 space-y-3 hover:shadow-xl transition-all">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-display font-bold text-2xl">
                  {member.name[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">{member.name}</p>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{member.role}</p>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <section className="py-16 px-6 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-3xl font-display font-bold text-white">Have Questions?</h2>
          <p className="text-slate-400">Reach us at <a href="mailto:info@ux4u.online" className="text-indigo-400 hover:underline">info@ux4u.online</a> or call <a href="tel:+4915560190572" className="text-indigo-400 hover:underline">+49 1556 019 0572</a></p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all">
            Contact Us <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-8 px-6 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2026 POS School Management ERP — A <a href="https://ux4u.online" className="text-indigo-500 hover:underline" target="_blank" rel="noopener">UX4U</a> Product. All rights reserved.
      </footer>
    </div>
  )
}
