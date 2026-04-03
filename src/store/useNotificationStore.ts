'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  title: string
  body: string
  type: string
  is_read: boolean
  created_at: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  addNotification: (notification: Notification) => void
  subscribeToNotifications: (userId: string) => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) console.error('Error fetching notifications:', error)
    else {
      set({ 
        notifications: data as Notification[],
        unreadCount: data.filter(n => !n.is_read).length
      })
    }
  },

  markAsRead: async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) console.error('Error marking as read:', error)
    else {
      const updated = get().notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      )
      set({ 
        notifications: updated,
        unreadCount: updated.filter(n => !n.is_read).length
      })
    }
  },

  addNotification: (notification) => {
    const updated = [notification, ...get().notifications]
    set({ 
      notifications: updated,
      unreadCount: updated.filter(n => !n.is_read).length
    })
  },

  subscribeToNotifications: (userId: string) => {
    const supabase = createClient()
    
    supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          get().addNotification(payload.new as Notification)
        }
      )
      .subscribe()
  },
}))
