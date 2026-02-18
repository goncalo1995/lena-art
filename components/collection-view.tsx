import { ArtworkCard } from "./artwork-card"
import type { Artwork, Collection, ArtType } from "@/lib/types"
import { ART_TYPE_ROUTES } from "@/lib/types"

interface CollectionViewProps {
  collection: Collection
  artworks: Artwork[]
}

export function CollectionView({
  collection,
  artworks,
}: CollectionViewProps) {
  const route = ART_TYPE_ROUTES[collection.art_type as ArtType]
  const isPoem = collection.art_type === "poem"

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground md:text-4xl text-balance">
        {collection.title}
      </h1>
      {collection.description && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {collection.description}
        </p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artworks.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
            title={artwork.title}
            shortDescription={artwork.short_description}
            coverImageUrl={artwork.cover_image_url}
            href={`/${route}/${collection.slug}/${artwork.slug}`}
            isPoem={isPoem}
          />
        ))}
      </div>

      {artworks.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">
          No works in this collection yet.
        </p>
      )}
    </div>
  )
}
