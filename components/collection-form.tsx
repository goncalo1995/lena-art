"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createCollection, updateCollection } from "@/lib/actions"
import { ART_TYPES, ART_TYPE_LABELS } from "@/lib/types"
import type { Collection } from "@/lib/types"

interface CollectionFormProps {
  collection?: Collection | null
}

export function CollectionForm({ collection }: CollectionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isEditing = !!collection

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    try {
      if (isEditing) {
        await updateCollection(collection.id, formData)
      } else {
        await createCollection(formData)
      }
      router.push("/admin/collections")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">Title *</span>
        <Input
          name="title"
          defaultValue={collection?.title || ""}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">Art Type *</span>
        <select
          name="art_type"
          defaultValue={collection?.art_type || "painting"}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          required
        >
          {ART_TYPES.map((type) => (
            <option key={type} value={type}>
              {ART_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">
          Short Description
        </span>
        <Input
          name="short_description"
          defaultValue={collection?.short_description || ""}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">
          Full Description
        </span>
        <textarea
          name="description"
          defaultValue={collection?.description || ""}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">
          Cover Image URL
        </span>
        <Input
          name="cover_image_url"
          defaultValue={collection?.cover_image_url || ""}
          placeholder="https://your-r2-bucket.r2.dev/image.jpg"
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">Sort Order</span>
          <Input
            name="sort_order"
            type="number"
            defaultValue={collection?.sort_order || 0}
          />
        </label>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="hidden"
          name="is_published"
          value="false"
        />
        <input
          type="checkbox"
          name="is_published"
          value="true"
          defaultChecked={collection?.is_published ?? true}
          className="size-4 rounded border-input"
        />
        <span className="text-sm text-foreground">Published</span>
      </label>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Collection"
              : "Create Collection"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
