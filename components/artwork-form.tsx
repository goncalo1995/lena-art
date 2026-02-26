"use client"

import { useRouter } from "next/navigation"
import { useLocale } from 'next-intl';
import { useState, SubmitEvent } from "react"
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

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    await handleSubmit(new FormData(event.currentTarget))
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-2xl">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md">
          {error}
        </p>
      )}

      <fieldset className="flex flex-col gap-4">
        <legend className="font-serif text-lg text-foreground mb-2">
          Informações Básicas
        </legend>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">Título</span>
          <Input
            name="title"
            defaultValue={artwork?.title || ""}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">Título (EN)</span>
          <Input
            name="title_en"
            defaultValue={(artwork as any)?.title_en || ""}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">Tipo de Arte *</span>
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
            Coleção (opcional)
          </span>
          <select
            name="collection_id"
            defaultValue={artwork?.collection_id || ""}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Nenhuma (sem coleção)</option>
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
          Conteúdo
        </legend>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">
            Descrição Curta (para cards)
          </span>
          <Input
            name="short_description"
            defaultValue={artwork?.short_description || ""}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">
            Descrição Curta (EN)
          </span>
          <Input
            name="short_description_en"
            defaultValue={(artwork as any)?.short_description_en || ""}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">
            Descrição Completa (para página de detalhe)
          </span>
          <textarea
            name="description"
            defaultValue={artwork?.description || ""}
            rows={5}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">
            Descrição Completa (EN)
          </span>
          <textarea
            name="description_en"
            defaultValue={(artwork as any)?.description_en || ""}
            rows={5}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">
            URL de Venda (Ex: Etsy)
          </span>
          <Input
            name="sale_url"
            defaultValue={artwork?.sale_url || ""}
            placeholder="https://www.etsy.com/listing/..."
          />
        </label>
      </fieldset>

      {/* Cover Image with MediaPicker */}
      <fieldset className="flex flex-col gap-4">
        <legend className="font-serif text-lg text-foreground mb-2">
          Imagem
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
              Remover
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
          Detalhes
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">
              Data de Criação
            </span>
            <Input
              name="creation_date"
              type="date"
              defaultValue={artwork?.creation_date || ""}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">
              Dimensões (ex: 50x70cm)
            </span>
            <Input
              name="dimensions"
              defaultValue={artwork?.dimensions || ""}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">
              Medium (ex: Óleo em tela)
            </span>
            <Input name="medium" defaultValue={artwork?.medium || ""} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">
              Medium (EN)
            </span>
            <Input name="medium_en" defaultValue={(artwork as any)?.medium_en || ""} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">Ordenação</span>
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
            <span className="text-sm text-foreground">Publicado</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_featured_home"
              defaultChecked={artwork?.is_featured_home ?? false}
              className="size-4 rounded border-input"
            />
            <span className="text-sm text-foreground">Destacado na Página Inicial</span>
          </label>
        </div>
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? "A guardar..."
            : isEditing
              ? "Atualizar"
              : "Adicionar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
