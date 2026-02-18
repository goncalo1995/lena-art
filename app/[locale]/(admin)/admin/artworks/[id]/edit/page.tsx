import { notFound } from "next/navigation"
import { getArtworkById, getAllCollections } from "@/lib/data"
import { ArtworkForm } from "@/components/artwork-form"
import { ArtworkMediaManager } from "@/components/artwork-media-manager"
import { ArtworkSectionsManager } from "@/components/artwork-sections-manager"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditArtworkPage({ params }: PageProps) {
  const { id } = await params
  const [artwork, collections] = await Promise.all([
    getArtworkById(id),
    getAllCollections(),
  ])

  if (!artwork) notFound()

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground mb-8">
        Edit: {artwork.title}
      </h1>
      <ArtworkForm artwork={artwork} collections={collections} />

      <div className="mt-12 flex flex-col gap-12 max-w-2xl">
        <ArtworkMediaManager
          artworkId={artwork.id}
          media={artwork.media || []}
        />
        <ArtworkSectionsManager
          artworkId={artwork.id}
          sections={artwork.sections || []}
        />
      </div>
    </div>
  )
}
