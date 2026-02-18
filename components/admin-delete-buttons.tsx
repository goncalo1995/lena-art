"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteArtwork, deleteCollection } from "@/lib/actions"

export function DeleteArtworkButton({
  id,
  title,
}: {
  id: string
  title: string
}) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await deleteArtwork(id)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  return (
    <Button size="icon-sm" variant="ghost" onClick={handleDelete}>
      <Trash2 className="size-4 text-destructive" />
      <span className="sr-only">Delete {title}</span>
    </Button>
  )
}

export function DeleteCollectionButton({
  id,
  title,
}: {
  id: string
  title: string
}) {
  const router = useRouter()

  async function handleDelete() {
    if (
      !confirm(
        `Delete collection "${title}"? Artworks in this collection will become standalone.`
      )
    )
      return
    try {
      await deleteCollection(id)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  return (
    <Button size="icon-sm" variant="ghost" onClick={handleDelete}>
      <Trash2 className="size-4 text-destructive" />
      <span className="sr-only">Delete {title}</span>
    </Button>
  )
}
