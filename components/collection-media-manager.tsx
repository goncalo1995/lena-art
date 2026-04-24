"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { deleteCollectionMedia, updateCollectionMediaSortOrder } from "@/lib/actions"
import type { CollectionMedia } from "@/lib/types"
import { MediaPicker } from "./admin/media-picker"

interface CollectionMediaManagerProps {
  collectionId: string
  media: CollectionMedia[]
}

export function CollectionMediaManager({
  collectionId,
  media: initialMedia,
}: CollectionMediaManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Sort media by sort_order
  const media = [...initialMedia].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  async function handleDelete(id: string) {
    if (!confirm("Delete this media item?")) return
    try {
      await deleteCollectionMedia(id)
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
      await updateCollectionMediaSortOrder(id, newSortOrder)

      // Also update the item that was above to move down
      const itemAbove = media[currentIndex - 1]
      await updateCollectionMediaSortOrder(itemAbove.id, currentIndex)

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
      await updateCollectionMediaSortOrder(id, newSortOrder)

      // Also update the item that was below to move up
      const itemBelow = media[currentIndex + 1]
      await updateCollectionMediaSortOrder(itemBelow.id, currentIndex)

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
        <div className="max-w-24">
          <MediaPicker
            collectionId={collectionId}
            onChange={() => {
              router.refresh()
            }}
          />
        </div>
      </div>

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
