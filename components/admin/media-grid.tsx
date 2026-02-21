// components/admin/media-grid.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog'
import { Copy, Trash2, ExternalLink, Image as ImageIcon, Video } from 'lucide-react'
import { deleteArtworkMedia } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import type { ArtworkMedia } from '@/lib/types'

interface MediaGridProps {
  media: ArtworkMedia[]
}

export function MediaGrid({ media }: MediaGridProps) {
  const router = useRouter()
  const [selectedItem, setSelectedItem] = useState<ArtworkMedia | null>(null)
  const [copied, setCopied] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media item? It will be removed from any artworks using it.')) return
    try {
      await deleteArtworkMedia(id)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString()
  }


  if (media.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No media uploaded yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Upload images or videos in artwork forms
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {media.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            {item.media_type === 'video' ? (
              <div className="relative w-full h-full">
                <video 
                  src={item.media_url} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded">
                  <Video className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <>
                <Image
                  src={item.media_url}
                  alt={item.caption || 'Media'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 50vw, 200px"
                />
                <div className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded">
                  <ImageIcon className="w-4 h-4" />
                </div>
              </>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(item.media_url)
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {item.file_name && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link href={item.media_url} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(item.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Caption badge */}
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-xs text-white truncate">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Media Details</DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {selectedItem.media_type === 'video' ? (
                  <video 
                    src={selectedItem.media_url} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={selectedItem.media_url}
                    alt={selectedItem.caption || 'Media'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 900px"
                  />
                )}
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">
                    {selectedItem.media_type || 'image'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium">
                    {formatDate(selectedItem.created_at)}
                  </p>
                </div>
                {selectedItem.caption && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Caption</p>
                    <p className="font-medium">{selectedItem.caption}</p>
                  </div>
                )}
                {selectedItem.file_name && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">File Name</p>
                    <p className="font-medium">{selectedItem.file_name}</p>
                  </div>
                )}
                {selectedItem.file_size && (
                  <div>
                    <p className="text-muted-foreground">File Size</p>
                    <p className="font-medium">{(selectedItem.file_size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>

              {/* URL */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">URL</p>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
                    {selectedItem.media_url}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(selectedItem.media_url)}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}