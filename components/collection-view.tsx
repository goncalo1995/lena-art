import { ArtworkCard } from "./artwork-card"
import type { Artwork, Collection, ArtType, CollectionMedia } from "@/lib/types"
import { ART_TYPE_ROUTES } from "@/lib/types"
import { getTranslations } from "next-intl/server"

interface CollectionViewProps {
  collection: Collection
  artworks: Artwork[]
  media?: CollectionMedia[]
}

export async function CollectionView({
  collection,
  artworks,
  media = [],
}: CollectionViewProps) {
  const t = await getTranslations("Pages.collection")
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

      {/* Artworks Grid */}
      {artworks.length > 0 && (
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
      )}

      {/* Media Grid */}
      {media.length > 0 && (
        <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${artworks.length > 0 ? 'mt-10' : 'mt-10'}`}>
          {media.map((m) => (
            <div key={m.id} className="group">
              <div className="relative aspect-4/3 overflow-hidden rounded-lg border bg-muted">
                {m.media_type === "video" ? (
                  <video
                    src={m.media_url}
                    controls
                    className="h-full w-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.media_url}
                    alt={m.caption || ""}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              {m.caption && (
                <p className="mt-2 text-sm text-muted-foreground">{m.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
