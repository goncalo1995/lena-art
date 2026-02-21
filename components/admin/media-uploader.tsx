// components/admin/MediaUploader.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { addArtworkMedia } from '@/lib/actions'

interface MediaUploaderProps {
  onUploadComplete: (url: string, type: 'image' | 'video') => void
  artworkId?: string
}

export function MediaUploader({ onUploadComplete, artworkId }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setUploading(true)
    setProgress(0)
    setError('')

    try {
      // 1. Get presigned URL
      const presignResponse = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type
        })
      })

      const responseData = await presignResponse.json()

      if (!presignResponse.ok) {
        throw new Error(responseData.error || 'Failed to get upload URL')
      }

      const { presignedUrl, publicUrl, key } = responseData

      // Validate the public URL
      if (!publicUrl || publicUrl.includes('undefined')) {
        console.error('Invalid public URL:', publicUrl)
        throw new Error('Invalid public URL received from server. Check R2_PUBLIC_URL environment variable.')
      }

      console.log('Public URL:', publicUrl)

      // 2. Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      // 3. Upload directly to R2
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        }
      })

      clearInterval(progressInterval)

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      setProgress(100)
      
      // 4. Determine media type and return
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
      
      // Ensure URL doesn't have double slashes
      const cleanUrl = publicUrl.replace(/([^:]\/)\/+/g, '$1')
      
      // 5. Save to media library if not associated with artwork
      if (!artworkId) {
        try {
          const formData = new FormData()
          formData.append('media_url', cleanUrl)
          formData.append('media_type', mediaType)
          formData.append('file_name', file.name)
          formData.append('file_size', file.size.toString())
          
          console.log('trying to add artwork media with artworkId:', artworkId)
          await addArtworkMedia(artworkId || null, formData)
        } catch (saveError) {
          console.error('Failed to save to media library:', saveError)
          // Don't fail the upload, just log the error
        }
      }
      
      onUploadComplete(cleanUrl, mediaType)

      // Reset after success
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 500)

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
      setProgress(0)
    } finally {
      // Clear the input
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
          {error}
        </p>
      )}

      {uploading ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-2">
            Uploading... {progress}%
          </p>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 truncate max-w-[200px] mx-auto">
            {fileName}
          </p>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <Input
            type="file"
            accept="image/*,video/mp4,video/webm"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex flex-col items-center gap-3"
          >
            <div className="p-3 bg-muted rounded-full">
              <svg 
                className="w-6 h-6 text-muted-foreground" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF, WEBP, MP4 up to 10MB
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  )
}