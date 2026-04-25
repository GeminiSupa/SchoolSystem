import Image from "next/image";
import Link from "next/link";
import { 
  CheckCircle2, Users, Calendar, CreditCard, ClipboardCheck, 
  GraduationCap, ArrowRight, ShieldCheck, Zap, Sparkles, 
  AlertCircle, TrendingUp, Clock, Wand2, Loader2 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glassmorphism border-b border-slate-100 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="AIM HIGH Logo" 
              width={180} 
              height={50} 
              className="h-10 w-auto md:h-12 object-contain"
            />
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/login" className="md:hidden text-[10px] uppercase tracking-widest font-bold text-slate-900 border border-slate-200 px-3 py-2 rounded-xl bg-white/50">
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
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold leading-tight tracking-tight text-slate-900">
              Empower Your Institution with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Smart Management</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-xl leading-relaxed">
              Simplify administrative tasks, improve communication, and ensure data security with our unified school management complex. Focus on quality education while we automate the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/register" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200 transition-all group">
                Get Started Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="https://wa.link/souve5" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-all text-center shadow-sm hover:shadow-xl">
                Request a Demo
              </a>
            </div>
            <div className="flex items-center gap-6 pt-4 justify-center lg:justify-start">
              <div className="flex -space-x-3">
                {[
                  { bg: 'bg-indigo-500', icon: 'A' },
                  { bg: 'bg-emerald-500', icon: 'B' },
                  { bg: 'bg-violet-500', icon: 'C' },
                  { bg: 'bg-amber-500', icon: 'D' }
                ].map((school, i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-white ${school.bg} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                    {school.icon}
                  </div>
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

      {/* Intelligence Section */}
      <section className="py-24 px-6 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-extrabold border border-indigo-100 uppercase tracking-widest">
                <Sparkles size={14} />
                <span>Next-Gen Intelligence</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 leading-tight">
                Harness the Power of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Educational AI</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                Beyond simple management, AIM HIGH uses advanced AI to provide predictive insights and personalized communication, helping you stay ahead of student needs.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "Predictive Risk Analysis", desc: "Identify students at risk of falling behind before it happens.", icon: <AlertCircle className="text-rose-500" /> },
                  { title: "AI Daily Reports", desc: "Automated, encouraging progress summaries for parents.", icon: <CheckCircle2 className="text-emerald-500" /> },
                  { title: "Academic Sentiment", desc: "Deep analysis of student academic trajectory and growth.", icon: <TrendingUp className="text-indigo-500" /> },
                  { title: "Smart Reminders", desc: "Polite, AI-crafted fee reminders that prioritize relationships.", icon: <Clock className="text-amber-500" /> }
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                        {item.icon}
                      </div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed pl-11">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
               <div className="glassmorphism p-4 rounded-[40px] border border-white/50 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer" />
                  <div className="bg-slate-900 rounded-[32px] p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
                             <Wand2 size={24} />
                          </div>
                          <div>
                             <p className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest">AI Intelligence</p>
                             <h4 className="text-white font-bold">Analysis Running...</h4>
                          </div>
                       </div>
                       <Loader2 className="animate-spin text-white/20" />
                    </div>
                    
                    <div className="space-y-4">
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                          <div className="flex justify-between items-center">
                             <div className="h-2 w-24 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-indigo-500" />
                             </div>
                             <span className="text-[10px] font-bold text-indigo-400 uppercase">94% Growth</span>
                          </div>
                          <p className="text-sm text-slate-300 italic leading-relaxed">
                            "Student demonstrates exceptional analytical growth in STEM. Strong candidate for early advanced placement."
                          </p>
                       </div>
                       
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 border border-rose-500/30">
                             <AlertCircle size={20} />
                          </div>
                          <div className="flex-1">
                             <p className="text-xs font-bold text-white uppercase tracking-widest">Risk Alert</p>
                             <p className="text-xs text-slate-400">Attendance drop detected in Section B</p>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-4xl font-display font-bold text-slate-900">Comprehensive Features for Seamless Operations</h2>
            <p className="text-slate-500 text-lg">Designed specifically for the unique challenges of Pakistani educational institutions.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Users size={28} />, title: "Student Management", desc: "Centralized platform for academic history, personal details, and real-time fee status." },
              { icon: <Calendar size={28} />, title: "Smart Scheduling", desc: "Conflict-free timetables for classes and examinations generated in seconds." },
              { icon: <CreditCard size={28} />, title: "Online Fee Collection", desc: "Secure digital payments with automated receipt generation and overdue alerts." },
              { icon: <ClipboardCheck size={28} />, title: "Attendance Automation", desc: "Electronic tracking for students and staff with instant background reporting." },
              { icon: <GraduationCap size={28} />, title: "Exam Management", desc: "Automated exam setup, admit card generation, and instant results publishing." },
              { icon: <ShieldCheck size={28} />, title: "Data Security", desc: "Enterprise-grade protection for sensitive financial and academic records." }
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
            <div className="flex flex-wrap gap-4">
              <div className="px-6 py-3 glassmorphism-dark rounded-2xl text-white font-medium flex items-center gap-3">
                <span className="text-2xl font-bold font-display text-indigo-300">Urdu</span>
                <span className="text-slate-300 text-sm font-bold uppercase tracking-widest">Supported</span>
              </div>
              <div className="px-6 py-3 glassmorphism-dark rounded-2xl text-white font-medium flex items-center gap-3">
                <span className="text-2xl font-bold font-display text-violet-300">English</span>
                <span className="text-slate-300 text-sm font-bold uppercase tracking-widest">Supported</span>
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
              <Image 
                src="/logo.png" 
                alt="AIM HIGH Logo" 
                width={120} 
                height={40} 
                className="h-10 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
              />
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Pakistan's most trusted School ERP — built by <a href="https://ux4u.online" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">UX4U</a> for AIM HIGH.
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
          <p className="text-xs text-slate-500">© 2026 AIM HIGH School Management System — A <a href="https://ux4u.online" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">UX4U</a> Product. All rights reserved.</p>
          <p className="text-xs text-slate-400">🇵🇰 Made in Pakistan, for Pakistan</p>
        </div>
      </footer>
    </div>
  );
}
