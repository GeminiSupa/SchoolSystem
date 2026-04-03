'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, School, User, CheckCircle2 } from 'lucide-react'

const onboardingSchema = z.object({
  schoolName: z.string().min(3, 'School name must be at least 3 characters'),
  schoolSlug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Lower case letters, numbers and hyphens only'),
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors }, watch } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
  })

  const onSubmit = async (values: OnboardingValues) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // 2. Create School (This would ideally be a transaction or handled by a trigger/edge function)
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: values.schoolName,
          slug: values.schoolSlug,
        })
        .select()
        .single()

      if (schoolError) throw schoolError

      // 3. Update Profile (Role and School)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          school_id: schoolData.id,
          role: 'admin',
          full_name: values.fullName,
          email: values.email,
        })

      if (profileError) throw profileError

      if (authData.session) {
        // Auto-login successful
        router.push('/dashboard')
      } else {
        // Just show success screen
        setStep(3) 
      }
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl glassmorphism p-6 md:p-10 rounded-[2rem] space-y-8">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= s ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 rounded ${step > s ? 'bg-slate-900' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h1 className="text-3xl font-display font-bold">Register Your School</h1>
              <p className="text-slate-500 mt-2">Start your digital transformation journey today.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">School Name</label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    {...register('schoolName')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    placeholder="Grand Academic Excellence"
                  />
                </div>
                {errors.schoolName && <p className="text-rose-500 text-xs mt-1">{errors.schoolName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">School URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">pos.com/</span>
                  <input 
                    {...register('schoolSlug')}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    placeholder="grand-academic"
                  />
                </div>
                {errors.schoolSlug && <p className="text-rose-500 text-xs mt-1">{errors.schoolSlug.message}</p>}
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={!watch('schoolName') || !watch('schoolSlug')}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Admin Account
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h1 className="text-3xl font-display font-bold">Admin Information</h1>
              <p className="text-slate-500 mt-2">Create the primary administrator account.</p>
            </div>
            
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    {...register('fullName')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && <p className="text-rose-500 text-xs mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input 
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  placeholder="admin@school.com"
                />
                {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input 
                  {...register('password')}
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 glassmorphism font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create School Account'}
                </button>
              </div>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Registration Successful!</h1>
            <p className="text-slate-500 max-w-sm mx-auto">
              Your school environment has been created. You can now log into your admin account.
            </p>
            <button 
              onClick={() => router.push('/login')}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
