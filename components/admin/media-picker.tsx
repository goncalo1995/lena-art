// components/admin/MediaPicker.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import type { Artwork, ArtworkMediaWithArtwork } from '@/lib/types'
import { MediaUploader } from './media-uploader'
import { addArtworkMedia } from '@/lib/actions'

interface MediaPickerProps {
  value?: string
  onChange: (url: string) => void
  onClose?: () => void
  artworkId?: string // For filtering media by artwork
}

export function MediaPicker({ value, onChange, onClose, artworkId }: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [urlInput, setUrlInput] = useState(value || '')
  const [recentMedia, setRecentMedia] = useState<ArtworkMediaWithArtwork[]>([])
  // const [artworks, setArtworks] = useState<Artwork[]>([])
  // const [selectedArtwork, setSelectedArtwork] = useState<string>('')
  // const [artworkMedia, setArtworkMedia] = useState<ArtworkMediaWithArtwork[]>([])
  const [loading, setLoading] = useState(false)
  const [caption, setCaption] = useState('')

  const supabase = createClient()

  // Load recent media
  useEffect(() => {
    if (open) {
      loadRecentMedia()
      // loadArtworks()
    }
  }, [open])

  async function loadRecentMedia() {
    setLoading(true)
    const { data } = await supabase
      .from('artwork_media')
      .select('*, artworks(id, title, art_type)')
      .order('created_at', { ascending: false })
      .limit(100)
    setRecentMedia(data || [])
    setLoading(false)
  }

  // async function loadArtworks() {
  //   const { data } = await supabase
  //     .from('artworks')
  //     .select('*')
  //     .order('title')
  //   setArtworks(data || [])
  // }

  // async function loadArtworkMedia(artworkId: string) {
  //   setLoading(true)
  //   const { data } = await supabase
  //     .from('artwork_media')
  //     .select('*')
  //     .eq('artwork_id', artworkId)
  //     .order('sort_order')
  //   setArtworkMedia(data || [])
  //   setLoading(false)
  // }

  const handleSelect = async (url: string, mediaType?: 'image' | 'video') => {
    // Clean the URL
    const cleanUrl = url.replace(/([^:]\/)\/+/g, '$1')
    
    // If we have an artworkId, save to Supabase automatically
    console.log("debug add media", { artworkId, cleanUrl })
    if (artworkId && cleanUrl && !cleanUrl.startsWith('blob:')) {
      try {
        const formData = new FormData()
        formData.append('media_url', cleanUrl)
        formData.append('media_type', mediaType || 'image')
        formData.append('caption', caption)
        formData.append('sort_order', '0')
        
        await addArtworkMedia(artworkId, formData)
        console.log('Media saved to database:', cleanUrl)
      } catch (error) {
        console.error('Failed to save media to database:', error)
      }
    }
    
    onChange(cleanUrl)
    setOpen(false)
    onClose?.()
    setCaption('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button" className="w-full">
          {value ? 'Change Media' : 'Select Media'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choose from existing media. To upload new files, go to the Media Library.
          </p>
        </DialogHeader>

        {/* Add caption input here */}
        {artworkId && (
          <div className="px-1 mb-2">
            <Input
              placeholder="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        <Tabs defaultValue="upload" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            {/* <TabsTrigger value="artwork">By Artwork</TabsTrigger> */}
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <MediaUploader 
              onUploadComplete={(url, type) => {
                // When upload completes, automatically select it
                handleSelect(url, type)
                // Also refresh the recent media list
                loadRecentMedia()
              }}
              artworkId={artworkId} 
            />
          </TabsContent>

          {/* URL Tab */}
          <TabsContent value="url" className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste image/video URL"
              />
              <Button onClick={() => handleSelect(urlInput)}>
                Use URL
              </Button>
            </div>
            
            {urlInput && (
              <div className="mt-4 border rounded-lg p-4">
                <p className="text-sm mb-2">Preview:</p>
                <MediaPreview url={urlInput} />
              </div>
            )}
          </TabsContent>

          {/* Recent Media Tab */}
          <TabsContent value="recent" className="flex-1">
            <ScrollArea className="h-[400px]">
              {loading ? (
                <p className="text-center py-4">Loading...</p>
              ) : recentMedia.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No media found</p>
                  <Button 
                    variant="link" 
                    onClick={() => window.open('/pt/admin/media', '_blank')}
                  >
                    Go to Media Library to upload
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 p-1">
                  {recentMedia.map((media) => (
                    <MediaCard
                      key={media.id}
                      media={media}
                      onSelect={() => handleSelect(media.media_url, media.media_type as 'image' | 'video')}
                      selected={value === media.media_url}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* By Artwork Tab */}
          {/* <TabsContent value="artwork" className="space-y-4">
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={selectedArtwork}
              onChange={(e) => {
                setSelectedArtwork(e.target.value)
                if (e.target.value) loadArtworkMedia(e.target.value)
              }}
            >
              <option value="">Select an artwork...</option>
              {artworks.map((artwork) => (
                <option key={artwork.id} value={artwork.id}>
                  {artwork.title}
                </option>
              ))}
            </select>

            {selectedArtwork && (
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-2 gap-4 p-1">
                  {artworkMedia.map((media) => (
                    <MediaCard
                      key={media.id}
                      media={media}
                      onSelect={() => handleSelect(media.media_url)}
                      selected={value === media.media_url}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent> */}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Media Preview Component
function MediaPreview({ url }: { url: string }) {
  const [error, setError] = useState(false)
  const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('video')
  
  if (error) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load preview</p>
      </div>
    )
  }
  
  return (
    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
      {isVideo ? (
        <video 
          src={url} 
          controls 
          className="w-full h-full object-contain"
          onError={() => setError(true)}
        >
          <track kind="captions" />
        </video>
      ) : (
        <Image
          src={url}
          alt="Preview"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 400px"
          onError={() => setError(true)}
        />
      )}
    </div>
  )
}

// Media Card Component
function MediaCard({ media, onSelect, selected }: any) {
  const [error, setError] = useState(false)
  const isVideo = media.media_type === 'video'
  
  return (
    <button
      onClick={onSelect}
      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
        selected ? 'border-primary scale-105' : 'border-transparent hover:border-primary/50'
      }`}
    >
      {error ? (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Error</span>
        </div>
      ) : isVideo ? (
        <video 
          src={media.media_url} 
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <Image
          src={media.media_url}
          alt={media.caption || ''}
          fill
          className="object-cover"
          sizes="150px"
          onError={() => setError(true)}
        />
      )}
      {media.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
          {media.caption}
        </div>
      )}
    </button>
  )
}
