"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { addArtworkMedia, deleteArtworkMedia } from "@/lib/actions"
import type { ArtworkMedia } from "@/lib/types"

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

  async function handleAdd(formData: FormData) {
    setLoading(true)
    try {
      await addArtworkMedia(artworkId, formData)
      setShowForm(false)
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
        <form
          action={handleAdd}
          className="flex flex-col gap-3 mb-6 rounded-lg border border-border p-4"
        >
          <Input
            name="media_url"
            placeholder="Media URL (R2 link)"
            required
          />
          <div className="flex gap-3">
            <select
              name="media_type"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              defaultValue="image"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <Input name="caption" placeholder="Caption (optional)" />
            <Input
              name="sort_order"
              type="number"
              defaultValue="0"
              className="w-20"
            />
          </div>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </Button>
        </form>
      )}

      {media.length === 0 ? (
        <p className="text-sm text-muted-foreground">No extra media yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {media.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-md border border-border px-4 py-2"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm text-foreground truncate">
                  {m.media_url}
                </span>
                <span className="text-xs text-muted-foreground">
                  {m.media_type}
                  {m.caption ? ` - ${m.caption}` : ""}
                </span>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => handleDelete(m.id)}
              >
                <Trash2 className="size-4 text-destructive" />
                <span className="sr-only">Delete media</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
