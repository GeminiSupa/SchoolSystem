import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "PKR 2,500",
      period: "/month",
      desc: "Perfect for small private schools with up to 200 students.",
      features: ["Up to 200 Students", "Admin + Teacher Portals", "Fee Management", "Attendance Tracking", "Email & SMS Alerts", "Standard Reports"],
      cta: "Start Free Trial",
      href: "/register",
      highlight: false,
    },
    {
      name: "Growth",
      price: "PKR 6,500",
      period: "/month",
      desc: "For growing institutions needing full feature access.",
      features: ["Up to 1,000 Students", "All Starter Features", "Payroll & HR Module", "Exam & Result Management", "Parent Mobile Portal", "Custom Branding", "Priority Support"],
      cta: "Get Started",
      href: "/register",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "For school chains, government systems, and large institutions.",
      features: ["Unlimited Students", "Multi-Campus Management", "Custom Integrations", "API Access", "Dedicated Account Manager", "SLA Guarantee", "On-premise Option"],
      cta: "Contact Sales",
      href: "/contact",
      highlight: false,
    },
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
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 leading-tight">
            Simple,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Transparent Pricing</span>
          </h1>
          <p className="text-xl text-slate-500">Affordable plans for every Pakistani institution. No hidden charges.</p>
          <p className="text-sm text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full inline-block">
            🎉 First 3 months FREE for government schools
          </p>
        </div>
      </section>

      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div key={i} className={`rounded-3xl p-8 md:p-10 flex flex-col gap-6 border transition-all hover:shadow-xl ${plan.highlight ? 'bg-slate-900 text-white border-slate-800' : 'glassmorphism border-white/50'}`}>
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${plan.highlight ? 'text-indigo-400' : 'text-slate-400'}`}>{plan.name}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-display font-bold">{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>{plan.period}</span>
                </div>
                <p className={`text-sm mt-2 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
              </div>
              <ul className="space-y-3 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 size={16} className={plan.highlight ? 'text-emerald-400' : 'text-emerald-500'} />
                    <span className={plan.highlight ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className={`w-full py-4 font-bold rounded-2xl text-center flex items-center justify-center gap-2 transition-all ${plan.highlight ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                {plan.cta} <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-400 text-sm mt-12">All prices in PKR. Taxes applicable as per FBR regulations. Contact us for NGO and government pricing.</p>
      </section>

      <footer className="bg-slate-50 py-8 px-6 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2026 POS School Management ERP — A <a href="https://ux4u.online" className="text-indigo-500 hover:underline" target="_blank" rel="noopener">UX4U</a> Product.
      </footer>
    </div>
  )
}
