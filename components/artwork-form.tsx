"use client"

import { useRouter } from "next/navigation"
import { useLocale } from 'next-intl';
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createArtwork, updateArtwork } from "@/lib/actions"
import { ART_TYPES, ART_TYPE_LABELS } from "@/lib/types"
import type { ArtType, ArtworkWithRelations, Collection } from "@/lib/types"
import { MediaPicker } from "./admin/media-picker";

interface ArtworkFormProps {
  artwork?: ArtworkWithRelations | null
  collections: Collection[]
}

export function ArtworkForm({ artwork, collections }: ArtworkFormProps) {
  const router = useRouter()
  const locale = useLocale()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [coverImage, setCoverImage] = useState(artwork?.cover_image_url || "")
  const isEditing = !!artwork

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    try {
      formData.set("cover_image_url", coverImage)

      if (isEditing) {
        await updateArtwork(artwork.id, formData)
      } else {
        await createArtwork(formData)
      }
      router.push(`/${locale}/admin/artworks`)
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

      <fieldset className="flex flex-col gap-4">
        <legend className="font-serif text-lg text-foreground mb-2">
          Basic Info
        </legend>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">Title *</span>
          <Input
            name="title"
            defaultValue={artwork?.title || ""}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">Art Type *</span>
          <select
            name="art_type"
            defaultValue={artwork?.art_type || "painting"}
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
            Collection (optional)
          </span>
          <select
            name="collection_id"
            defaultValue={artwork?.collection_id || ""}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Standalone (no collection)</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({ART_TYPE_LABELS[c.art_type as ArtType]})
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-serif text-lg text-foreground mb-2">
          Content
        </legend>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">
            Short Description (for cards)
          </span>
          <Input
            name="short_description"
            defaultValue={artwork?.short_description || ""}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">
            Full Description (for detail page)
          </span>
          <textarea
            name="description"
            defaultValue={artwork?.description || ""}
            rows={5}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </label>

        {/* <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">
            Cover Image URL (Cloudflare R2)
          </span>
          <Input
            name="cover_image_url"
            defaultValue={artwork?.cover_image_url || ""}
            placeholder="https://your-r2-bucket.r2.dev/image.jpg"
          />
        </label> */}
      </fieldset>

      {/* Cover Image with MediaPicker */}
      <fieldset className="flex flex-col gap-4">
        <legend className="font-serif text-lg text-foreground mb-2">
          Cover Image
        </legend>

        {coverImage && (
          <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
            <img
              src={coverImage}
              alt="Cover preview"
              className="w-full h-full object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setCoverImage("")}
            >
              Remove
            </Button>
          </div>
        )}
        
        <MediaPicker
          value={coverImage}
          onChange={setCoverImage}
          // Note: No artworkId here because this is just for the cover image
        />
        <input type="hidden" name="cover_image_url" value={coverImage} />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-serif text-lg text-foreground mb-2">
          Details
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">
              Creation Date
            </span>
            <Input
              name="creation_date"
              type="date"
              defaultValue={artwork?.creation_date || ""}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">
              Dimensions (e.g. 50x70cm)
            </span>
            <Input
              name="dimensions"
              defaultValue={artwork?.dimensions || ""}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">
              Medium (e.g. Oil on canvas)
            </span>
            <Input name="medium" defaultValue={artwork?.medium || ""} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">Sort Order</span>
            <Input
              name="sort_order"
              type="number"
              defaultValue={artwork?.sort_order || 0}
            />
          </label>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={artwork?.is_published ?? true}
              className="size-4 rounded border-input"
            />
            <span className="text-sm text-foreground">Published</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_featured_home"
              defaultChecked={artwork?.is_featured_home ?? false}
              className="size-4 rounded border-input"
            />
            <span className="text-sm text-foreground">Featured on Home</span>
          </label>
        </div>
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Artwork"
              : "Create Artwork"}
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
