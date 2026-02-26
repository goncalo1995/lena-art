// components/admin/media-grid.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog'
import { Copy, Trash2, ExternalLink, Image as ImageIcon, Video } from 'lucide-react'
import { deleteArtworkMedia, updateArtworkMediaCaption } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import type { ArtworkMedia } from '@/lib/types'

interface MediaGridProps {
  media: ArtworkMedia[]
}

export function MediaGrid({ media }: MediaGridProps) {
  const router = useRouter()
  const [selectedItem, setSelectedItem] = useState<ArtworkMedia | null>(null)
  const [copied, setCopied] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [captionDraft, setCaptionDraft] = useState('')
  const [savingCaption, setSavingCaption] = useState(false)

  const openDetails = (item: ArtworkMedia) => {
    setSelectedItem(item)
    setCaptionDraft(item.caption || '')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apagar este ficheiro? Pode dar erro se alguma obra estiver a usá-lo.')) return
    try {
      const result = await deleteArtworkMedia(id)
      if (result && typeof result === 'object' && 'success' in result && result.success === false) {
        if ((result as any).error === 'inUse') {
          alert('Este ficheiro ainda está a ser usado noutro lugar. Remova as outras utilizações primeiro, depois apague novamente.')
          return
        }
      }
      router.refresh()
    } catch (error) {
      console.error('Falha ao apagar:', error)
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
        <p className="text-muted-foreground">Ainda sem ficheiros</p>
        <p className="text-sm text-muted-foreground mt-1">
          Faça upload de imagens ou vídeos nos formulários de arte
        </p>
      </div>
    )
  }

  return (
    <>
      {/* View toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border bg-background p-1">
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-1.5 text-sm rounded-md transition ${
              view === 'grid'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Grelha
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 text-sm rounded-md transition ${
              view === 'list'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {media.map((item) => (
            <div
              key={item.id}
              className="flex flex-col rounded-lg overflow-hidden border bg-muted"
            >
              {/* Preview */}
              <button
                type="button"
                onClick={() => openDetails(item)}
                className="relative aspect-square w-full overflow-hidden"
              >
                {item.media_type === 'video' ? (
                  <>
                    <video
                      src={item.media_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-white p-1 rounded">
                      <Video className="w-4 h-4" />
                    </div>
                  </>
                ) : (
                  <>
                    <Image
                      src={item.media_url}
                      alt={item.caption || 'Media'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 200px"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 text-white p-1 rounded">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  </>
                )}
              </button>

              {/* Caption */}
              {(item.caption || item.file_name) && (
                <div className="px-3 py-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {item.caption || item.file_name}
                  </p>
                </div>
              )}

              {/* Sticky actions */}
              <div className="mt-auto flex items-center justify-between gap-1 px-2 py-2 border-t bg-background">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(item.media_url)}
                >
                  <Copy className="h-4 w-4" />
                </Button>

                <Button size="icon" variant="ghost" asChild>
                  <Link href={item.media_url} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="space-y-2">
          {media.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-lg border bg-background p-3"
            >
              {/* Thumbnail */}
              <button
                onClick={() => openDetails(item)}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted"
              >
                {item.media_type === 'video' ? (
                  <video
                    src={item.media_url}
                    className="h-full w-full object-cover"
                    muted
                  />
                ) : (
                  <Image
                    src={item.media_url}
                    alt={item.caption || 'Media'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 100px"
                  />
                )}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.caption || item.file_name || 'Untitled'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.media_type} · {formatDate(item.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard(item.media_url)}
                >
                  <Copy className="h-4 w-4" />
                </Button>

                <Button size="icon" variant="ghost" asChild>
                  <Link href={item.media_url} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null)
            setCaptionDraft('')
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalhes</DialogTitle>
            <DialogDescription>
              Ver e gerir os seus ficheiros
            </DialogDescription>
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
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw"
                  />
                )}
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tipo</p>
                  <p className="font-medium capitalize">
                    {selectedItem.media_type || 'image'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data de upload</p>
                  <p className="font-medium">
                    {formatDate(selectedItem.created_at)}
                  </p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-muted-foreground">Legenda</p>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingCaption}
                      onClick={async () => {
                        setSavingCaption(true)
                        try {
                          const nextCaption = captionDraft.trim() ? captionDraft.trim() : null
                          await updateArtworkMediaCaption(selectedItem.id, nextCaption)
                          setSelectedItem({ ...selectedItem, caption: nextCaption })
                          router.refresh()
                        } catch (error) {
                          console.error('Failed to update caption:', error)
                        } finally {
                          setSavingCaption(false)
                        }
                      }}
                    >
                      {savingCaption ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                  <Textarea
                    value={captionDraft}
                    onChange={(e) => setCaptionDraft(e.target.value)}
                    placeholder="Add a caption (optional)"
                  />
                </div>
                {selectedItem.file_name && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Nome do ficheiro</p>
                    <p className="font-medium">{selectedItem.file_name}</p>
                  </div>
                )}
                {selectedItem.file_size && (
                  <div>
                    <p className="text-muted-foreground">Tamanho do ficheiro</p>
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