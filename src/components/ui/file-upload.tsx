'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, Image as ImageIcon, FileText, FileCode, FileArchive } from 'lucide-react'

interface FileUploadProps {
  bucket: string
  path: string
  onUploadComplete: (url: string, fileName?: string) => void
  currentUrl?: string
  accept?: string
  label?: string
}

export function FileUpload({ bucket, path, onUploadComplete, currentUrl, accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx", label }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const isImageValue = (url: string | null) => {
    if (!url) return false
    return url.match(/\.(jpg|jpeg|png|gif|webp|svg)/i) !== null
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setFileName(file.name)
    
    // Create local preview if it's an image
    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
    } else {
      setPreview(null)
    }

    try {
      const fileExt = file.name.split('.').pop()
      const randomName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${path}/${randomName}`

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onUploadComplete(publicUrl, file.name)
    } catch (error: any) {
      alert('Error uploading file: ' + error.message)
      setPreview(currentUrl || null)
      setFileName(null)
    } finally {
      setIsUploading(false)
    }
  }

  const isImage = isImageValue(preview || currentUrl)

  return (
    <div className="space-y-4">
      {label && <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">{label}</label>}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
          preview || (!isImage && currentUrl) ? 'border-slate-900 bg-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
        }`}
      >
        {isImage && (preview || currentUrl) ? (
          <>
            <img src={preview || currentUrl || undefined} alt="Upload preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="text-white" size={32} />
            </div>
          </>
        ) : (!isImage && (currentUrl || fileName)) ? (
          <div className="text-center p-6 space-y-3">
             <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
                <FileText className="text-slate-500" size={32} />
             </div>
             <p className="font-bold text-slate-900 text-sm truncate max-w-[200px]">{fileName || 'Document Attached'}</p>
             <p className="text-[10px] text-indigo-600 font-bold uppercase">Click to change file</p>
          </div>
        ) : (
          <div className="text-center p-6 space-y-2">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <ImageIcon className="text-slate-400" />
            </div>
            <p className="font-bold text-slate-900">Click to upload media or document</p>
            <p className="text-xs text-slate-500">Images, PDFs, or Docs up to 20MB</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center space-y-2">
               <Loader2 className="animate-spin text-slate-900 mx-auto" size={32} />
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
      />
      
      {(preview || currentUrl) && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            setFileName(null);
            onUploadComplete('', '');
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          className="flex items-center gap-2 text-sm text-rose-600 font-medium hover:text-rose-700 transition-colors"
        >
          <X size={14} /> Remove Attachment
        </button>
      )}
    </div>
  )
}
