"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useNotificationStore } from "@/store/useNotificationStore"
import { 
  Bell, LogOut, User as UserIcon, Settings, Menu, Zap, 
  CreditCard, ClipboardCheck, GraduationCap, Calendar, 
  MessageSquare, Briefcase, CheckSquare, Loader2
} from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const router = useRouter()
  const { unreadCount, fetchNotifications, subscribeToNotifications, notifications } = useNotificationStore()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profileData)
        fetchNotifications()
        subscribeToNotifications(user.id)
      } else {
        router.push('/login')
      }
      setIsLoading(false)
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const role = profile?.role || 'admin'
  const isSuperAdmin = profile?.is_super_admin

  interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    roles: string[];
    superAdminOnly?: boolean;
  }

  const allNavItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: <Menu size={18} />, roles: ['admin', 'teacher', 'parent', 'student', 'accountant'] },
    { name: "Platform", href: "/dashboard/platform", icon: <Zap size={18} />, roles: [], superAdminOnly: true },
    { name: "Users", href: "/dashboard/users", icon: <UserIcon size={18} />, roles: ['admin'] },
    { name: "Classes", href: "/dashboard/classes", icon: <GraduationCap size={18} />, roles: ['admin', 'teacher'] },
    { name: "Gradebook", href: "/dashboard/grades", icon: <ClipboardCheck size={18} />, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: "Exams", href: "/dashboard/exams", icon: <GraduationCap size={18} />, roles: ['admin', 'teacher'] },
    { name: "My Children", href: "/dashboard/students", icon: <UserIcon size={18} />, roles: ['parent'] },
    { name: "Students", href: "/dashboard/students", icon: <UserIcon size={18} />, roles: ['admin', 'teacher'] },
    { name: "Timetable", href: "/dashboard/timetable", icon: <Calendar size={18} />, roles: ['admin', 'teacher', 'parent', 'student'] },
    { name: "Attendance", href: "/dashboard/attendance", icon: <CheckSquare size={18} />, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: "Leaves", href: "/dashboard/leaves", icon: <Briefcase size={18} />, roles: ['admin', 'teacher', 'student', 'parent', 'accountant'] },
    { name: "Finance", href: "/dashboard/finance", icon: <CreditCard size={18} />, roles: ['admin', 'parent', 'accountant', 'teacher'] },
    { name: "Payroll", href: "/dashboard/payroll", icon: <ClipboardCheck size={18} />, roles: ['admin', 'accountant'] },
    { name: "Assignments", href: "/dashboard/assignments", icon: <Menu size={18} />, roles: ['admin', 'teacher', 'parent', 'student'] },
    { name: "Messages", href: "/dashboard/messages", icon: <MessageSquare size={18} />, roles: ['admin', 'teacher', 'parent', 'student'] }, 
    { name: "Reports", href: "/dashboard/reports", icon: <ClipboardCheck size={18} />, roles: ['admin', 'teacher'] },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings size={18} />, roles: ['admin', 'teacher', 'parent', 'student', 'accountant'] },
  ]

  const filteredNavItems = allNavItems.filter(item => {
    if (item.superAdminOnly) return isSuperAdmin
    return item.roles.includes(role)
  })

  // Role Protection
  const pathname = usePathname()
  useEffect(() => {
    if (!isLoading && role) {
      const currentPath = pathname || ''
      const isAllowed = filteredNavItems.some(item => currentPath === item.href || currentPath.startsWith(item.href + '/'))
      
      // Allow root dashboard and ignore non-dashboard routes (if any outside layout)
      if (!isAllowed && currentPath !== '/dashboard' && currentPath.startsWith('/dashboard/')) {
        console.warn(`Access Denied: ${role} not allowed on ${currentPath}`)
        router.push('/dashboard')
      }
    }
  }, [isLoading, role, pathname, filteredNavItems])

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
       <Loader2 className="animate-spin text-slate-900" size={48} />
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 glassmorphism border-r border-slate-200 m-3 rounded-3xl p-6 hidden md:flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-10 px-2 justify-center">
          <img 
            src="/logo.png" 
            alt="AIM HIGH Logo" 
            className="h-16 w-auto object-contain"
          />
        </div>
        
        <nav className="space-y-1 flex-1">
          {filteredNavItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/50 cursor-pointer transition-all text-slate-600 hover:text-slate-900 font-bold text-sm tracking-tight"
            >
              <span className="text-slate-400 group-hover:text-slate-900">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-slate-200/50">
          <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/40 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-400 overflow-hidden">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
               ) : (
                 <UserIcon size={20} />
               )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate leading-none">{profile?.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mt-1">{role}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          <header className="flex justify-between items-center mb-10 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 py-2">
            <div className="space-y-1">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tighter">Daily Overview</h3>
              <p className="hidden md:block text-slate-500 font-bold text-sm tracking-tight">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <button className="w-12 h-12 glassmorphism rounded-2xl flex items-center justify-center hover:bg-white transition-all shadow-sm border border-white">
                  <Bell size={20} className="text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Dropdown Placeholder */}
                <div className="absolute right-0 mt-3 w-80 glassmorphism p-4 rounded-3xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-2xl z-50 border border-white">
                  <h4 className="font-bold text-sm mb-4 px-2">Notifications</h4>
                  <div className="space-y-1 max-h-96 overflow-auto custom-scrollbar">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} className="p-3 rounded-2xl hover:bg-white/50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                        <p className="text-sm font-bold">{n.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{n.body}</p>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-500 text-center py-8 italic font-medium">No new notifications</p>
                    )}
                  </div>
                </div>
              </div>
              
              <Link href="/dashboard/reports" className="hidden md:flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 tracking-tight">
                Quick Action
              </Link>
            </div>
          </header>
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 glassmorphism rounded-2xl border border-white/50 flex items-center justify-around px-4 shadow-2xl z-50">
          {filteredNavItems.slice(0, 4).map((item, i) => (
            <Link key={i} href={item.href} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
              {item.icon}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
