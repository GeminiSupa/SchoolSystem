'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, Search, Filter, MoreVertical, Shield, Mail, Phone, Loader2, X, Edit, CheckCircle2 } from 'lucide-react'
import { FileUpload } from '@/components/ui/file-upload'

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'teacher',
    phone: '',
    address: '',
    dob: '',
    department: '',
    avatar_url: ''
  })
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createClient()

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user.id).single()
        setUserRole(profile?.role || 'teacher')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) console.error(error)
      else setUsers(data || [])
    } catch (err) {
      console.error("Error fetching users:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async () => {
    if (!newUser.full_name || !newUser.email || !newUser.password) {
      setError('Name, Email, and Password are required')
      return
    }
    setIsCreating(true)
    setError(null)

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', currentUser?.id).single()
      
      if (profile?.role !== 'admin') {
        setError('Permission Denied: Only administrators can create users.')
        setIsCreating(false)
        return
      }

      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          school_id: profile?.school_id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      alert('User created successfully!')
      fetchUsers()
      setShowAddModal(false)
      setNewUser({
        full_name: '',
        email: '',
        password: '',
        role: 'teacher',
        phone: '',
        address: '',
        dob: '',
        department: '',
        avatar_url: ''
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser.full_name) {
      setError('Full Name is required')
      return
    }
    setIsCreating(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editingUser.full_name,
          role: editingUser.role,
          phone: editingUser.phone,
          address: editingUser.address,
          dob: editingUser.dob,
          department: editingUser.department,
          avatar_url: editingUser.avatar_url
        })
        .eq('id', editingUser.id)

      if (error) throw error

      alert('User updated successfully!')
      fetchUsers()
      setEditingUser(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight">User Management</h3>
          <p className="text-slate-500 font-medium">Manage administrators, teachers, and staff members.</p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 w-full md:w-auto justify-center"
          >
            <UserPlus size={20} /> Add New User
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all"
            placeholder="Search by name, email, or role..."
          />
        </div>
        <button className="px-6 py-3 glassmorphism rounded-xl border border-slate-200 font-bold text-slate-600 flex items-center gap-2 hover:bg-white transition-all">
          <Filter size={18} /> Filter
        </button>
      </div>

      <div className="glassmorphism rounded-3xl overflow-hidden border border-white/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User Profile</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role & Permissions</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-900" size={32} />
                  </td>
                </tr>
              ) : users.length > 0 ? users.map((user, i) => (
                <tr key={i} className="hover:bg-white/40 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                        <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random`} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-indigo-500" />
                      <span className="text-sm font-bold text-slate-700 capitalize">{user.role.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => setEditingUser(user)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-white/60"
                      title="Edit User"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto opacity-50">
                      <UserPlus size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No users found. Start by adding your first staff member.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="w-full max-w-lg glassmorphism p-8 md:p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium mb-6">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-display font-bold">Add New User</h2>
               <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors bg-white/50 p-2 rounded-xl">
                  <X size={20} />
               </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                <div className="md:col-span-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Profile Photo</label>
                   <FileUpload 
                    bucket="avatars"
                    path="profiles"
                    currentUrl={newUser.avatar_url}
                    onUploadComplete={(url) => setNewUser({...newUser, avatar_url: url})}
                   />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                    placeholder="Ex: VakeelDiary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                  <input
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                    placeholder="sarah@school.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <input
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newUser.dob}
                    onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Department</label>
                  <input
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                    placeholder="Ex: Mathematics"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assigned Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium bg-white/80"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin">Administrator</option>
                    <option value="accountant">Accountant</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Residential Address</label>
                  <textarea
                    value={newUser.address}
                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                    placeholder="Full residential address..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 flex gap-4 border-t border-slate-100 mt-6">
              <button
                disabled={isCreating}
                onClick={() => setShowAddModal(false)}
                className="flex-1 glassmorphism font-bold py-4 rounded-2xl hover:bg-white/80 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isCreating || !newUser.full_name || !newUser.email || !newUser.password}
                onClick={handleCreateUser}
                className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? <Loader2 className="animate-spin" size={20} /> : 'Create User Account'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
          <div className="w-full max-w-lg glassmorphism p-8 md:p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-display font-bold">Edit User Profile</h2>
               <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-900 transition-colors bg-white/50 p-2 rounded-xl">
                  <X size={20} />
               </button>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                <div className="md:col-span-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Profile Photo</label>
                   <FileUpload 
                    bucket="avatars"
                    path="profiles"
                    currentUrl={editingUser.avatar_url}
                    onUploadComplete={(url) => setEditingUser({...editingUser, avatar_url: url})}
                   />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    value={editingUser.full_name}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assigned Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium bg-white/80"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin">Administrator</option>
                    <option value="accountant">Accountant</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <input
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editingUser.dob}
                    onChange={(e) => setEditingUser({ ...editingUser, dob: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Department</label>
                  <input
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Residential Address</label>
                  <textarea
                    value={editingUser.address}
                    onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 glassmorphism focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 flex gap-4 border-t border-slate-100 mt-6">
              <button
                disabled={isCreating}
                onClick={() => setEditingUser(null)}
                className="flex-1 glassmorphism font-bold py-4 rounded-2xl hover:bg-white/80 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isCreating || !editingUser.full_name}
                onClick={handleUpdateUser}
                className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                {isCreating ? 'Updating...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
