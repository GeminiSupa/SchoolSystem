'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'

interface FileUploadProps {
  bucket: string
  path: string
  onUploadComplete: (url: string) => void
  currentUrl?: string
}

export function FileUpload({ bucket, path, onUploadComplete, currentUrl }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    // Create local preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${path}/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onUploadComplete(publicUrl)
    } catch (error: any) {
      alert('Error uploading file: ' + error.message)
      setPreview(currentUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
          preview ? 'border-slate-900 bg-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="text-white" size={32} />
            </div>
          </>
        ) : (
          <div className="text-center p-6 space-y-2">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <ImageIcon className="text-slate-400" />
            </div>
            <p className="font-bold text-slate-900">Click to upload media</p>
            <p className="text-xs text-slate-500">PNG, JPG or WebP up to 10MB</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-slate-900" size={32} />
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      
      {preview && (
        <button 
          onClick={() => {
            setPreview(null)
            onUploadComplete('')
          }}
          className="flex items-center gap-2 text-sm text-rose-600 font-medium hover:text-rose-700 transition-colors"
        >
          <X size={14} /> Remove Image
        </button>
      )}
    </div>
  )
}
