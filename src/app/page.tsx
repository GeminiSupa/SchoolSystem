import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Users, Calendar, CreditCard, ClipboardCheck, GraduationCap, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glassmorphism border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-display font-bold text-xl">P</span>
          </div>
          <span className="text-2xl font-display font-bold tracking-tight">POS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="md:hidden text-sm font-bold text-slate-900 border border-slate-200 px-4 py-2 rounded-xl">
            Login
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-slate-900 transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-slate-900 transition-colors">Solutions</Link>
            <Link href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-900 text-sm font-semibold border border-slate-200">
              <Zap size={14} className="text-amber-500" />
              <span>Next-Generation School ERP</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight tracking-tight text-slate-900">
              Empower Your Institution with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Smart Management</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-xl leading-relaxed">
              Simplify administrative tasks, improve communication, and ensure data security with our unified school management complex. Focus on quality education while we automate the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/register" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200 transition-all group">
                Get Started Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="https://wa.link/souve5" target="_blank" rel="noopener noreferrer" className="px-8 py-4 glassmorphism rounded-2xl font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-all text-center shadow-sm hover:shadow-xl">
                Request a Demo
              </a>
            </div>
            <div className="flex items-center gap-6 pt-4 justify-center lg:justify-start">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">Joined by <span className="text-slate-900 font-bold">500+</span> elite institutions</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-3xl blur-3xl opacity-50" />
            <div className="relative glassmorphism p-2 rounded-3xl overflow-hidden shadow-2xl border border-white/50">
              <img 
                src="/images/hero_school_management_1774885213388.png" 
                alt="School Dashboard Preview" 
                className="rounded-2xl w-full object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-4xl font-display font-bold text-slate-900">Comprehensive Features for Seamless Operations</h2>
            <p className="text-slate-500 text-lg">Designed specifically for the unique challenges of Pakistani educational institutions.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Users />, title: "Student Management", desc: "Centralized platform for academic history, personal details, and real-time fee status." },
              { icon: <Calendar />, title: "Smart Scheduling", desc: "Conflict-free timetables for classes and examinations generated in seconds." },
              { icon: <CreditCard />, title: "Online Fee Collection", desc: "Secure digital payments with automated receipt generation and overdue alerts." },
              { icon: <ClipboardCheck />, title: "Attendance Automation", desc: "Electronic tracking for students and staff with instant background reporting." },
              { icon: <GraduationCap />, title: "Exam Management", desc: "Automated exam setup, admit card generation, and instant results publishing." },
              { icon: <ShieldCheck />, title: "Data Security", desc: "Enterprise-grade protection for sensitive financial and academic records." }
            ].map((feature, i) => (
              <div key={i} className="glassmorphism p-8 rounded-3xl group hover:bg-slate-900 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 mb-6 group-hover:bg-white/10 group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-white transition-colors">{feature.title}</h3>
                <p className="text-slate-500 group-hover:text-slate-300 transition-colors leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Sections */}
      <section id="solutions" className="py-24 px-6 space-y-32">
        {/* Solution 1 */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <img 
              src="/images/teacher_dashboard_preview_1774885343158.png" 
              alt="Teacher Dashboard" 
              className="rounded-3xl shadow-2xl border border-slate-100"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
              <Zap />
            </div>
            <h2 className="text-4xl font-display font-bold text-slate-900 leading-tight">Elevate Classroom Efficiency with Teacher Portals</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Empower your educators with tools that save time. From real-time attendance marking to automated grading and resource sharing, our teacher portal keeps everyone aligned.
            </p>
            <ul className="space-y-4">
              {["Digital Study Resources", "Instant Gradebooks", "Automated Attendance"].map(item => (
                <li key={item} className="flex items-center gap-3 font-medium text-slate-700">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Solution 2 */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CreditCard />
            </div>
            <h2 className="text-4xl font-display font-bold text-slate-900 leading-tight">Total Financial Transparency & Control</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Manage your institution's finances with precision. Multiple payment gateways, automated invoicing, and detailed payroll management in one secure platform.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Installments", value: "Flexible Plans" },
                { label: "Payroll", value: "Auto-Runs" },
              ].map(stat => (
                <div key={stat.label} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <img 
              src="/images/finance_dashboard_preview_1774885366312.png" 
              alt="Finance Analytics" 
              className="rounded-3xl shadow-2xl border border-slate-100"
            />
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-24 px-6 bg-slate-900 rounded-[3rem] mx-6 mb-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-indigo-500/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8 py-10">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight">Keep Parents Engaged, Anytime, Anywhere</h2>
            <p className="text-xl text-slate-400 leading-relaxed">
              Our bilingual mobile app ensures that parents are always in the loop. Real-time updates on attendance, exam results, and fee payments give them the peace of mind they deserve.
            </p>
            <div className="flex gap-4">
              <div className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-white font-medium flex items-center gap-3">
                <span className="text-2xl">Urdu</span>
                <span className="text-slate-400">Supported</span>
              </div>
              <div className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl text-white font-medium flex items-center gap-3">
                <span className="text-2xl">English</span>
                <span className="text-slate-400">Supported</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center flex-col items-center">
            <img 
              src="/images/parent_mobile_preview_mockup_1774885391434.png" 
              alt="Mobile App Mockup" 
              className="w-full max-w-sm drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 pt-20 pb-10 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-display font-bold text-slate-900">POS</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Pakistan's most trusted School ERP — built by <a href="https://ux4u.online" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">UX4U</a> for Pakistani institutions.
            </p>
            <a href="https://ux4u.online" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
              A UX4U Initiative ↗
            </a>
          </div>
          {[
            { title: "Product", links: [
              { label: "Features", href: "/features" },
              { label: "Solutions", href: "/solutions" },
              { label: "Pricing", href: "/pricing" },
              { label: "Integrations", href: "/integrations" },
            ]},
            { title: "Company", links: [
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Careers", href: "/careers" },
              { label: "Blog", href: "/blog" },
            ]},
            { title: "Legal", links: [
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Compliance", href: "/compliance" },
              { label: "Security", href: "/security" },
            ]},
          ].map(column => (
            <div key={column.title} className="space-y-6">
              <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">© 2026 POS School Management ERP — A <a href="https://ux4u.online" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">UX4U</a> Product. All rights reserved.</p>
          <p className="text-xs text-slate-400">🇵🇰 Made in Pakistan, for Pakistan</p>
        </div>
      </footer>
    </div>
  );
}
