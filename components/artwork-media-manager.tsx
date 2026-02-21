"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { addArtworkMedia, deleteArtworkMedia } from "@/lib/actions"
import type { ArtworkMedia } from "@/lib/types"
import { MediaPicker } from "./admin/media-picker"

interface ArtworkMediaManagerProps {
  artworkId: string
  media: ArtworkMedia[]
}

export function ArtworkMediaManager({
  artworkId,
  media,
}: ArtworkMediaManagerProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [caption, setCaption] = useState("")
  const [mediaType, setMediaType] = useState<"image" | "video">("image")

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-foreground">Extra Media</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="size-4" />
          Add Media
        </Button>
      </div>

      {showForm && (
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
            artworkId={artworkId} // This will auto-save via handleSelect in MediaPicker
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
      )}

      {media.length === 0 ? (
        <p className="text-sm text-muted-foreground">No extra media yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {media.map((m) => (
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
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                onClick={() => handleDelete(m.id)}
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Delete media</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
