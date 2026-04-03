'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Send, Search, User, MoreVertical, 
  Smile, Paperclip, Loader2, MessageSquare,
  Check, CheckCheck, Phone, Video, Info, PhoneOff, PhoneCall
} from 'lucide-react'

export default function MessagesPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  
  // Call System State
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected'>('idle')
  const [callType, setCallType] = useState<'audio' | 'video'>('video')
  const [callPartner, setCallPartner] = useState<any>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  // WebRTC Signal Listener
  useEffect(() => {
    if (!profile) return
    const channel = supabase.channel('webrtc_calls')
    
    channel.on('broadcast', { event: 'call-signal' }, async ({ payload }) => {
      if (payload.target_id !== profile.id) return
      
      if (payload.type === 'offer') {
        setCallPartner(payload.sender_info)
        setCallType(payload.call_type)
        setCallStatus('ringing')
        
        pcRef.current = createPeerConnection(payload.sender_id)
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.data))
      } else if (payload.type === 'answer') {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.data))
          setCallStatus('connected')
        }
      } else if (payload.type === 'ice-candidate') {
        if (pcRef.current) {
          // Add candidate if peer connection exists
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.data))
          } catch(e) { console.error("Error adding ice candidate", e) }
        }
      } else if (payload.type === 'end') {
        endLocalCallOnly()
      }
    }).subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [profile]) // Re-run if profile changes

  // Connect Streams to Video Elements
  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream
  }, [localStream, callStatus])
  
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream
  }, [remoteStream, callStatus])

  // Chat Listener
  useEffect(() => {
    if (selectedContact && profile) {
      fetchMessages()
      const channel = supabase
        .channel('messages_chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          if (
            (payload.new.sender_id === selectedContact.id && payload.new.receiver_id === profile.id) ||
            (payload.new.sender_id === profile.id && payload.new.receiver_id === selectedContact.id)
          ) {
            setMessages(prev => [...prev, payload.new])
          }
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [selectedContact, profile])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      // Fetch all users as contacts (simplified for now)
      const { data: users } = await supabase.from('profiles').select('*').neq('id', user.id).order('full_name')
      setContacts(users || [])

    } catch (err) {
      console.error("Messages fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!selectedContact || !profile) return
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${profile.id})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedContact || isSending) return

    setIsSending(true)
    const { error } = await supabase.from('messages').insert({
      school_id: profile.school_id,
      sender_id: profile.id,
      receiver_id: selectedContact.id,
      content: newMessage.trim()
    })

    if (error) alert(error.message)
    else setNewMessage('')
    setIsSending(false)
  }

  /* --- WebRTC Logic --- */
  
  const sendSignal = async (type: string, data: any, target_id: string, extra?: any) => {
    if (!channelRef.current || !profile) return
    await channelRef.current.send({
      type: 'broadcast',
      event: 'call-signal',
      payload: {
        type,
        data,
        target_id,
        sender_id: profile.id,
        sender_info: profile,
        ...extra
      }
    })
  }

  const createPeerConnection = (targetId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    pc.onicecandidate = (event) => {
      if (event.candidate) sendSignal('ice-candidate', event.candidate, targetId)
    }
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0])
    }
    return pc
  }

  const startCall = async (type: 'audio' | 'video') => {
    if (!selectedContact || !profile) return
    setCallPartner(selectedContact)
    setCallType(type)
    setCallStatus('calling')
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true })
      setLocalStream(stream)
      
      const pc = createPeerConnection(selectedContact.id)
      stream.getTracks().forEach(track => pc.addTrack(track, stream))
      pcRef.current = pc
      
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      
      sendSignal('offer', offer, selectedContact.id, { call_type: type })
    } catch (err) {
      console.error("Error accessing media devices.", err)
      alert("Could not access Camera or Microphone. Please grant permissions.")
      endLocalCallOnly()
    }
  }

  const answerCall = async () => {
    if (!callPartner || !pcRef.current || !profile) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: callType === 'video', audio: true })
      setLocalStream(stream)
      
      stream.getTracks().forEach(track => pcRef.current!.addTrack(track, stream))
      
      const answer = await pcRef.current.createAnswer()
      await pcRef.current.setLocalDescription(answer)
      
      sendSignal('answer', answer, callPartner.id)
      setCallStatus('connected')
    } catch (err) {
      console.error("Error accessing media devices answering.", err)
      alert("Could not access Camera or Microphone. Please grant permissions.")
      endCall()
    }
  }

  const endLocalCallOnly = () => {
    setLocalStream(prev => {
      if (prev) prev.getTracks().forEach(t => t.stop())
      return null
    })
    setRemoteStream(null)
    if (pcRef.current) pcRef.current.close()
    pcRef.current = null
    setCallStatus('idle')
    setCallPartner(null)
  }

  const endCall = () => {
    if (callPartner) sendSignal('end', null, callPartner.id)
    endLocalCallOnly()
  }

  /* --- Render --- */

  if (isLoading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin text-slate-900" size={40} />
    </div>
  )

  return (
    <div className="h-[calc(100vh-180px)] flex gap-6 overflow-hidden relative">
      
      {/* WebRTC Overlay */}
      {callStatus !== 'idle' && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center text-white space-y-2 z-10">
            <h2 className="text-3xl font-display font-bold shadow-black drop-shadow-md">{callPartner?.full_name}</h2>
            <p className="text-white/80 font-bold tracking-[0.2em] uppercase text-xs animate-pulse">
              {callStatus === 'calling' && 'Calling...'}
              {callStatus === 'ringing' && `Incoming ${callType} call...`}
              {callStatus === 'connected' && 'Connected'}
            </p>
          </div>

          <div className="relative w-full max-w-6xl aspect-video px-4 md:px-12 flex items-center justify-center">
            {callType === 'video' && (
              <>
                {/* Remote Video */}
                <div className="w-full h-full rounded-[3rem] overflow-hidden bg-slate-900/50 border border-white/10 shadow-2xl relative flex items-center justify-center">
                  {!remoteStream && callStatus === 'connected' && <Loader2 className="text-white animate-spin" size={40} />}
                  {remoteStream && (
                    <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                  )}
                </div>
                
                {/* Local Video Mini Window */}
                <div className="absolute bottom-12 right-12 md:right-24 w-48 lg:w-64 aspect-video rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black z-20 transition-all hover:scale-105">
                   {localStream && <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />}
                </div>
              </>
            )}
            
            {callType === 'audio' && (
              <div className="w-64 h-64 rounded-full bg-slate-900 border-4 border-indigo-500/30 flex flex-col items-center justify-center shadow-[0_0_100px_rgba(99,102,241,0.2)] animate-pulse">
                {remoteStream && <audio ref={remoteVideoRef} autoPlay playsInline className="hidden" />}
                {localStream && <audio ref={localVideoRef} autoPlay playsInline muted className="hidden" />}
                <PhoneCall size={64} className="text-indigo-400 mb-4" />
                <div className="flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100"></div>
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-white/10 p-4 rounded-full backdrop-blur-md border border-white/10">
            {callStatus === 'ringing' && (
              <button onClick={answerCall} className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-110">
                {callType === 'video' ? <Video size={24} /> : <Phone size={24} />}
              </button>
            )}
            <button onClick={endCall} className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white hover:bg-rose-400 transition-all shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:scale-110">
               <PhoneOff size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Contact List */}
      <div className="w-full md:w-80 glassmorphism rounded-[2.5rem] border border-white/50 flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex justify-between items-center">
             <h4 className="font-bold text-slate-800">Messages & Calls</h4>
             <button className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                <MessageSquare size={18} />
             </button>
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 text-sm outline-none transition-all" placeholder="Search contacts..." />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {contacts.map(contact => (
            <button 
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                selectedContact?.id === contact.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'hover:bg-white/50'
              }`}
            >
              <div className="relative">
                 <div className={`w-12 h-12 rounded-full border-2 ${selectedContact?.id === contact.id ? 'border-white/20' : 'border-white shadow-sm'} bg-slate-100 flex items-center justify-center text-slate-400 font-bold overflow-hidden`}>
                   {contact.avatar_url ? <img src={contact.avatar_url} className="w-full h-full object-cover" alt="" /> : contact.full_name?.charAt(0)}
                 </div>
                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className={`font-bold text-sm truncate ${selectedContact?.id === contact.id ? 'text-white' : 'text-slate-800'}`}>{contact.full_name}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${selectedContact?.id === contact.id ? 'text-white/60' : 'text-slate-400'}`}>{contact.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 glassmorphism rounded-[2.5rem] border border-white/50 flex flex-col overflow-hidden shadow-sm bg-white/20">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/40">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center text-slate-400 font-bold overflow-hidden">
                   {selectedContact.avatar_url ? <img src={selectedContact.avatar_url} className="w-full h-full object-cover" alt="" /> : selectedContact.full_name?.charAt(0)}
                 </div>
                 <div>
                    <p className="font-bold text-slate-800 tracking-tight">{selectedContact.full_name}</p>
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Online
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => startCall('audio')} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-indigo-500 hover:text-indigo-700 bg-white shadow-sm"><Phone size={18} /></button>
                 <button onClick={() => startCall('video')} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-indigo-500 hover:text-indigo-700 bg-white shadow-sm"><Video size={18} /></button>
                 <div className="w-px h-6 bg-slate-200 mx-1"></div>
                 <button className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><Info size={18} /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6 bg-slate-50/30">
              {messages.map((msg, i) => {
                const isMine = msg.sender_id === profile.id
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[70%] space-y-1 ${isMine ? 'items-end' : 'items-start'}`}>
                       <div className={`px-5 py-3 rounded-[1.5rem] text-sm font-medium shadow-sm transition-all ${
                         isMine 
                         ? 'bg-slate-900 text-white rounded-tr-none' 
                         : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                       }`}>
                          {msg.content}
                       </div>
                       <div className={`flex items-center gap-1.5 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                             {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && <CheckCheck size={12} className={msg.is_read ? 'text-indigo-500' : 'text-slate-300'} />}
                       </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-100 bg-white/40">
               <div className="flex items-center gap-4 bg-white/80 border border-slate-200 p-2 rounded-[2rem] shadow-sm focus-within:ring-2 focus-within:ring-slate-900 transition-all">
                  <button type="button" className="p-3 text-slate-400 hover:text-slate-600 transition-colors"><Smile size={20} /></button>
                  <input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400" 
                    placeholder="Type a message..." 
                  />
                  <button type="button" className="p-3 text-slate-400 hover:text-slate-600 transition-colors"><Paperclip size={20} /></button>
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                  >
                    {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
               </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center p-12">
             <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 animate-pulse">
                <MessageSquare size={48} />
             </div>
             <div>
                <h4 className="text-xl font-display font-bold text-slate-900 tracking-tight">Select a Chat to Start</h4>
                <p className="text-slate-400 font-bold text-sm mt-1">Communicate with teachers, parents, and administrative staff instantly.</p>
             </div>
             <div className="flex gap-2">
                <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-100">Calls</div>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">Private</div>
                <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-100">Video</div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
