'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileUpload } from '@/components/ui/file-upload'
import { User, Mail, Shield, Bell, Loader2, Save, School } from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [school, setSchool] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'personal' | 'school'>('personal')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Fetch Profile
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
          
          // Fetch School if admin
          if (profileData.role === 'admin' && profileData.school_id) {
            const { data: schoolData } = await supabase
              .from('schools')
              .select('*')
              .eq('id', profileData.school_id)
              .single()
            setSchool(schoolData)
          }
        }
      }
      setIsLoading(false)
    }
    fetchInitialData()
  }, [])

  const handleUpdateAvatar = async (url: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', profile.id)
    
    if (error) setMessage({ type: 'error', text: 'Failed to update avatar' })
    else {
      setProfile({ ...profile, avatar_url: url })
      setMessage({ type: 'success', text: 'Avatar updated successfully' })
    }
  }

  const handleUpdateSchoolLogo = async (url: string) => {
    const { error } = await supabase
      .from('schools')
      .update({ logo_url: url })
      .eq('id', school.id)
    
    if (error) setMessage({ type: 'error', text: 'Failed to update school logo' })
    else {
      setSchool({ ...school, logo_url: url })
      setMessage({ type: 'success', text: 'School logo updated successfully' })
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
      })
      .eq('id', profile.id)

    if (error) setMessage({ type: 'error', text: error.message })
    else setMessage({ type: 'success', text: 'Profile updated successfully' })
    
    setIsSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    
    setIsChangingPassword(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) setMessage({ type: 'error', text: error.message })
    else {
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setNewPassword('')
      setConfirmPassword('')
    }
    
    setIsChangingPassword(false)
  }

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('schools')
      .update({
        name: school.name,
        address: school.address,
        phone: school.phone,
        email: school.email
      })
      .eq('id', school.id)

    if (error) setMessage({ type: 'error', text: error.message })
    else setMessage({ type: 'success', text: 'School profile updated successfully' })
    
    setIsSaving(false)
  }

  if (isLoading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin text-slate-900" size={40} />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Settings</h3>
          <p className="text-slate-500 font-medium">Manage your personal profile and school preferences.</p>
        </div>
        
        {profile?.role === 'admin' && (
          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
             <button 
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'personal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Personal
             </button>
             <button 
              onClick={() => setActiveTab('school')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'school' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                School
             </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
        } animate-in fade-in slide-in-from-top-2 duration-300 font-medium text-sm`}>
          {message.text}
        </div>
      )}

      {activeTab === 'personal' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="glassmorphism p-8 rounded-3xl space-y-6">
            <div className="text-center space-y-4">
               <div className="w-24 h-24 mx-auto relative group">
                  <img 
                    src={profile?.avatar_url || 'https://via.placeholder.com/150'} 
                    className="w-full h-full rounded-2xl object-cover border-4 border-white shadow-lg"
                    alt="Avatar"
                  />
               </div>
               <div>
                  <h4 className="font-bold text-lg">{profile?.full_name}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{profile?.role}</p>
               </div>
            </div>
            
            <div className="pt-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Photo</p>
              <FileUpload 
                bucket="avatars" 
                path={`profiles/${profile?.id}`} 
                currentUrl={profile?.avatar_url}
                onUploadComplete={handleUpdateAvatar}
              />
            </div>
          </div>

          {/* Detailed Settings */}
          <div className="md:col-span-2 space-y-8">
            <form onSubmit={handleSaveProfile} className="glassmorphism p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                 <User className="text-slate-400" size={20} />
                 <h4 className="font-bold">Personal Information</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input 
                    value={profile?.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input 
                    value={profile?.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div className="space-y-1 md:col-span-2 opacity-60">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address (Read-only)</label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input 
                      value={profile?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Changes
                </button>
              </div>
            </form>

            <div className="glassmorphism p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                 <Shield className="text-slate-400" size={20} />
                 <h4 className="font-bold">Security & Status</h4>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-white">
                <div>
                   <p className="font-bold text-slate-900">Account Role</p>
                   <p className="text-xs text-slate-500">Your current access level across the platform.</p>
                </div>
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                  {profile?.role}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100">
                 <h4 className="font-bold text-sm mb-4 text-slate-700">Change Password</h4>
                 <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                       <input 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all text-sm font-medium"
                          placeholder="••••••••"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                       <input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all text-sm font-medium"
                          placeholder="••••••••"
                       />
                    </div>
                    <button 
                       type="submit"
                       disabled={isChangingPassword || !newPassword || !confirmPassword}
                       className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all hover:text-slate-900 disabled:opacity-50"
                    >
                       {isChangingPassword ? <Loader2 className="animate-spin" size={16} /> : 'Update Password'}
                    </button>
                 </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* School Branding Card */}
          <div className="glassmorphism p-8 rounded-3xl space-y-6">
            <div className="text-center space-y-4">
               <div className="w-32 h-32 mx-auto relative group">
                  <img 
                    src={school?.logo_url || 'https://via.placeholder.com/150'} 
                    className="w-full h-full rounded-3xl object-contain p-2 bg-white border border-slate-100 shadow-lg"
                    alt="Logo"
                  />
               </div>
               <div>
                  <h4 className="font-bold text-lg">{school?.name}</h4>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">School ID: {school?.id?.slice(0, 8)}</p>
               </div>
            </div>
            
            <div className="pt-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">School Logo</p>
              <FileUpload 
                bucket="avatars" 
                path={`schools/${school?.id}`} 
                currentUrl={school?.logo_url}
                onUploadComplete={handleUpdateSchoolLogo}
              />
            </div>
          </div>

          {/* School Profile Settings */}
          <div className="md:col-span-2 space-y-8">
            <form onSubmit={handleSaveSchool} className="glassmorphism p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                 <School className="text-slate-400" size={20} />
                 <h4 className="font-bold">School Profile</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">School Name</label>
                  <input 
                    value={school?.name || ''}
                    onChange={(e) => setSchool({ ...school, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Phone</label>
                  <input 
                    value={school?.phone || ''}
                    onChange={(e) => setSchool({ ...school, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Email</label>
                  <input 
                    type="email"
                    value={school?.email || ''}
                    onChange={(e) => setSchool({ ...school, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Address</label>
                  <textarea 
                    value={school?.address || ''}
                    onChange={(e) => setSchool({ ...school, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                    rows={3}
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Update School Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
