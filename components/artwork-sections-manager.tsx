"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { addArtworkSection, deleteArtworkSection } from "@/lib/actions"
import type { ArtworkSection } from "@/lib/types"

interface ArtworkSectionsManagerProps {
  artworkId: string
  sections: ArtworkSection[]
}

export function ArtworkSectionsManager({
  artworkId,
  sections,
}: ArtworkSectionsManagerProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAdd(formData: FormData) {
    setLoading(true)
    try {
      await addArtworkSection(artworkId, formData)
      setShowForm(false)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add section")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this section?")) return
    try {
      await deleteArtworkSection(id)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-foreground">
          Extra Text Sections
        </h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="size-4" />
          Add Section
        </Button>
      </div>

      {showForm && (
        <form
          action={handleAdd}
          className="flex flex-col gap-3 mb-6 rounded-lg border border-border p-4"
        >
          <Input name="title" placeholder="Section title (optional)" />
          <textarea
            name="content"
            placeholder="Section content *"
            required
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Input
            name="sort_order"
            type="number"
            defaultValue="0"
            placeholder="Sort order"
            className="w-32"
          />
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </Button>
        </form>
      )}

      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No extra sections yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sections.map((s) => (
            <li
              key={s.id}
              className="flex items-start justify-between gap-4 rounded-md border border-border px-4 py-3"
            >
              <div className="min-w-0">
                {s.title && (
                  <p className="text-sm font-medium text-foreground">
                    {s.title}
                  </p>
                )}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {s.content}
                </p>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => handleDelete(s.id)}
                className="shrink-0"
              >
                <Trash2 className="size-4 text-destructive" />
                <span className="sr-only">Delete section</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
