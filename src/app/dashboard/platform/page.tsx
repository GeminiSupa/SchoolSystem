import { Globe, Shield, CreditCard, Users, Loader2 } from "lucide-react"

export default function PlatformPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h3 className="text-3xl font-display font-bold text-slate-900">Platform Overview</h3>
        <p className="text-slate-500 font-medium tracking-tight">Super Admin Global Control Center</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Schools", value: "124", icon: <Globe />, color: "text-blue-600" },
          { label: "Total Students", value: "48,201", icon: <Users />, color: "text-emerald-600" },
          { label: "Monthly Revenue", value: "$1.2M", icon: <CreditCard />, color: "text-indigo-600" },
          { label: "Security Alerts", value: "0", icon: <Shield />, color: "text-emerald-600" },
        ].map((stat, i) => (
          <div key={i} className="glassmorphism p-6 rounded-3xl">
            <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 ${stat.color} shadow-sm`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-display font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="glassmorphism rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
           <h4 className="font-bold text-slate-900">Tenant Management</h4>
           <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
             Add New Institution
           </button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
               <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">School Name</th>
               <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Plan</th>
               <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
               <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {[
              { name: "City Grammar School", plan: "Enterprise", status: "Active" },
              { name: "Beacon House Academy", plan: "Pro", status: "Active" },
              { name: "Roots International", plan: "Basic", status: "Pending" },
            ].map((school, i) => (
              <tr key={i} className="hover:bg-white/40 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900">{school.name}</p>
                  <p className="text-xs text-slate-500">Slug: {school.name.toLowerCase().replace(/ /g, '-')}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-700">{school.plan}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${school.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {school.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-indigo-600 text-xs font-bold hover:underline">Impersonate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="glassmorphism rounded-3xl overflow-hidden border border-white/50">
        <div className="p-6 border-b border-slate-100">
           <h4 className="font-bold text-slate-900">Global User Overview</h4>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { role: "Super Admins", count: "12", icon: <Shield size={16} /> },
             { role: "School Admins", count: "342", icon: <Users size={16} /> },
             { role: "Total Staff", count: "1,520", icon: <Users size={16} /> },
           ].map((item, i) => (
             <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-white">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400">
                      {item.icon}
                   </div>
                   <span className="text-sm font-bold text-slate-700">{item.role}</span>
                </div>
                <span className="text-lg font-display font-bold text-slate-900">{item.count}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
