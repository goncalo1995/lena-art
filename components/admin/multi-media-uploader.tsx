// components/admin/multi-media-uploader.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { addArtworkMedia, refreshMediaPage } from '@/lib/actions'

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  url?: string
  mediaType?: 'image' | 'video'
  error?: string
}

interface MultiMediaUploaderProps {
  artworkId?: string
  maxFiles?: number
  acceptedFileTypes?: string
  maxFileSize?: number // in MB
}

export function MultiMediaUploader({ 
  artworkId,
  maxFiles = 10,
  acceptedFileTypes = 'image/*,video/mp4,video/webm',
  maxFileSize = 10 // 10MB default
}: MultiMediaUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    // Check max files limit
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files at a time`)
      return
    }

    // Check file sizes
    const oversizedFiles = selectedFiles.filter(f => f.size > maxFileSize * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed the ${maxFileSize}MB limit`)
      return
    }

    const newFiles: UploadFile[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...newFiles])
    
    // Clear input
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const uploadFile = async (uploadFile: UploadFile) => {
    const { file, id } = uploadFile

    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'uploading', progress: 0 } : f
    ))

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

      const { presignedUrl, publicUrl } = responseData

      if (!publicUrl || publicUrl.includes('undefined')) {
        throw new Error('Invalid public URL received from server')
      }

      // 2. Upload with progress simulation
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === id ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
        ))
      }, 200)

      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      })

      clearInterval(progressInterval)

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      // 3. Determine media type
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
      const cleanUrl = publicUrl.replace(/([^:]\/)\/+/g, '$1')

      // 4. Save to media library if needed
      if (!artworkId) {
        try {
          const formData = new FormData()
          formData.append('media_url', cleanUrl)
          formData.append('media_type', mediaType)
          formData.append('file_name', file.name)
          formData.append('file_size', file.size.toString())
          
          await addArtworkMedia(null, formData)
        } catch (saveError) {
          console.error('Failed to save to media library:', saveError)
        }
      }

      // 5. Update success status
      setFiles(prev => prev.map(f => 
        f.id === id ? { 
          ...f, 
          status: 'success', 
          progress: 100,
          url: cleanUrl,
          mediaType 
        } : f
      ))

    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f => 
        f.id === id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f
      ))
    }
  }

  const uploadAll = async () => {
    setIsUploading(true)
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    // Upload files sequentially to avoid overwhelming the server
    for (const file of pendingFiles) {
      await uploadFile(file)
    }
    
    setIsUploading(false)
    
    await refreshMediaPage() // Server action that revalidates
  }

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'success'))
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
        <Input
          type="file"
          multiple
          accept={acceptedFileTypes}
          onChange={handleFileSelect}
          className="hidden"
          id="multi-file-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="multi-file-upload"
          className="cursor-pointer inline-flex flex-col items-center gap-3"
        >
          <div className="p-3 bg-muted rounded-full">
            <Upload className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Click to upload multiple files</p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, GIF, WEBP, MP4 up to {maxFileSize}MB each (max {maxFiles} files)
            </p>
          </div>
        </label>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={clearCompleted}
                disabled={!files.some(f => f.status === 'success')}
              >
                Clear completed
              </Button>
              <Button
                size="sm"
                onClick={uploadAll}
                disabled={isUploading || !files.some(f => f.status === 'pending')}
              >
                {isUploading ? 'Uploading...' : 'Upload all'}
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                {/* File icon based on type */}
                <div className="flex-shrink-0 w-8 h-8 bg-muted rounded flex items-center justify-center text-xs">
                  {file.file.name.split('.').pop()}
                </div>

                {/* File info and progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(file.status)}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === 'uploading'}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  {(file.status === 'uploading' || file.status === 'success') && (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-1" />
                    </div>
                  )}
                  
                  {/* Error message */}
                  {file.status === 'error' && (
                    <p className="text-xs text-destructive mt-1">
                      {file.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}