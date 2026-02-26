"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteArtwork, deleteCollection, deleteSubscriberById } from "@/lib/actions"

export function DeleteArtworkButton({
  id,
  title,
}: {
  id: string
  title: string
}) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Apagar "${title}"? Esta ação é irreversível.`)) return
    try {
      await deleteArtwork(id)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha ao apagar")
    }
  }

  return (
    <Button size="icon-sm" variant="ghost" onClick={handleDelete}>
      <Trash2 className="size-4 text-destructive" />
      <span className="sr-only">Apagar {title}</span>
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
        `Apagar coleção "${title}"? As obras nesta coleção tornar-se-ão independentes.`
      )
    )
      return
    try {
      await deleteCollection(id)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha ao apagar")
    }
  }

  return (
    <Button size="icon-sm" variant="ghost" onClick={handleDelete}>
      <Trash2 className="size-4 text-destructive" />
      <span className="sr-only">Apagar {title}</span>
    </Button>
  )
}

export function DeleteSubscriberButton({
  id,
  email,
}: {
  id: string
  email: string
}) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Apagar inscrito "${email}"? Esta ação é irreversível.`)) return
    try {
      await deleteSubscriberById(id)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha ao apagar")
    }
  }

  return (
    <Button size="icon-sm" variant="ghost" onClick={handleDelete}>
      <Trash2 className="size-4 text-destructive" />
      <span className="sr-only">Apagar {email}</span>
    </Button>
  )
}
