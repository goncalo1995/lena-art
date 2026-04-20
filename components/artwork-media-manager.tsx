"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { addArtworkMedia, deleteArtworkMedia, updateArtworkMediaSortOrder } from "@/lib/actions"
import type { ArtworkMedia } from "@/lib/types"
import { MediaPicker } from "./admin/media-picker"

interface ArtworkMediaManagerProps {
  artworkId: string
  media: ArtworkMedia[]
}

export function ArtworkMediaManager({
  artworkId,
  media: initialMedia,
}: ArtworkMediaManagerProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [caption, setCaption] = useState("")
  const [mediaType, setMediaType] = useState<"image" | "video">("image")
  
  // Sort media by sort_order
  const media = [...initialMedia].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  async function handleAddMedia(url: string, type: "image" | "video") {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("media_url", url)
      formData.append("media_type", type)
      formData.append("caption", caption)
      formData.append("sort_order", String(media.length))
      
      await addArtworkMedia(artworkId, formData)
      setShowForm(false)
      setCaption("")
      setMediaType("image")
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add media")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this media item?")) return
    try {
      await deleteArtworkMedia(id)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  async function handleMoveUp(id: string, currentIndex: number) {
    if (currentIndex === 0) return
    setLoading(true)
    try {
      // Swap with item above
      const newSortOrder = currentIndex - 1
      await updateArtworkMediaSortOrder(id, newSortOrder)
      
      // Also update the item that was above to move down
      const itemAbove = media[currentIndex - 1]
      await updateArtworkMediaSortOrder(itemAbove.id, currentIndex)
      
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to reorder")
    } finally {
      setLoading(false)
    }
  }

  async function handleMoveDown(id: string, currentIndex: number) {
    if (currentIndex === media.length - 1) return
    setLoading(true)
    try {
      // Swap with item below
      const newSortOrder = currentIndex + 1
      await updateArtworkMediaSortOrder(id, newSortOrder)
      
      // Also update the item that was below to move up
      const itemBelow = media[currentIndex + 1]
      await updateArtworkMediaSortOrder(itemBelow.id, currentIndex)
      
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to reorder")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-foreground">Extra Media</h2>
        {/* <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="size-4" />
          Add Media
        </Button> */}
        <div className="max-w-24">
          <MediaPicker
            artworkId={artworkId} // This will auto-save via handleSelect in MediaPicke
            onChange={(url) => {
              // This is called after MediaPicker's internal handleSelect saves to DB
              setShowForm(false)
              setCaption("")
              router.refresh()
            }}
          />
        </div>
      </div>

      {/* {showForm && (
        <div className="flex flex-col gap-3 mb-6 rounded-lg border border-border p-4">
          <div className="flex gap-3">
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as "image" | "video")}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <Input 
              placeholder="Caption (optional)" 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <MediaPicker
            artworkId={artworkId} // This will auto-save via handleSelect in MediaPicke
            onChange={(url) => {
              // This is called after MediaPicker's internal handleSelect saves to DB
              setShowForm(false)
              setCaption("")
              router.refresh()
            }}
          />
          
          <p className="text-xs text-muted-foreground">
            Upload or select media - it will be automatically saved
          </p>
        </div>
      )} */}

      {media.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem mídia extra.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {media.map((m, index) => (
            <div key={m.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                {m.media_type === "video" ? (
                  <video 
                    src={m.media_url} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.media_url}
                    alt={m.caption || ""}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {m.caption && (
                <p className="text-xs mt-1 truncate">{m.caption}</p>
              )}
              
              {/* Reordering controls */}
              <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7"
                  disabled={index === 0 || loading}
                  onClick={() => handleMoveUp(m.id, index)}
                >
                  <ArrowUp className="size-3" />
                  <span className="sr-only">Move up</span>
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7"
                  disabled={index === media.length - 1 || loading}
                  onClick={() => handleMoveDown(m.id, index)}
                >
                  <ArrowDown className="size-3" />
                  <span className="sr-only">Move down</span>
                </Button>
              </div>

              <Button
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                onClick={() => handleDelete(m.id)}
              >
                <Trash2 className="size-3" />
                <span className="sr-only">Delete media</span>
              </Button>
              
              {/* Sort order indicator */}
              <span className="absolute bottom-1 right-1 text-xs bg-background/80 px-1.5 py-0.5 rounded">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
