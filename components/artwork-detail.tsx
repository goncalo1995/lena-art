import Image from "next/image"
import type { ArtworkWithRelations } from "@/lib/types"
import { format } from "date-fns"
import { getTranslations } from "next-intl/server"

interface ArtworkDetailProps {
  artwork: ArtworkWithRelations
}

export async function ArtworkDetail({ artwork }: ArtworkDetailProps) {
  const t = await getTranslations()
  const isPoem = artwork.art_type === "poem"
  const showTitle = artwork.title && artwork.title.trim() !== "" && artwork.title !== "Untitled"

  return (
    <article className="mx-auto max-w-5xl">
      {isPoem ? (
        <div className="rounded-lg bg-secondary/50 px-8 py-12 md:px-16 md:py-16">
          <div className="font-serif text-lg leading-loose text-foreground whitespace-pre-line md:text-xl">
            {artwork.description}
          </div>
          {showTitle && (
            <h1 className="mt-10 font-serif text-2xl text-foreground md:text-3xl text-balance">
              {artwork.title}
            </h1>
          )}
        </div>
      ) : (
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-4">
            {artwork.cover_image_url && (
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={artwork.cover_image_url}
                  alt={artwork.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 900px"
                  priority
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-3xl text-foreground md:text-4xl text-balance">
                {artwork.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {artwork.creation_date && (
                  <span>{format(new Date(artwork.creation_date), "MMMM yyyy")}</span>
                )}
                {artwork.medium && <span>{artwork.medium}</span>}
                {artwork.dimensions && <span>{artwork.dimensions}</span>}
              </div>
            </div>

            {artwork.description && (
              <div className="text-base leading-relaxed text-foreground/80 whitespace-pre-line">
                {artwork.description}
              </div>
            )}

            {artwork.sale_url && (
              <div>
                <a
                  href={artwork.sale_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                >
                  {t("Pages.ArtworkDetail.buy")}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Extra sections */}
      {artwork.sections && artwork.sections.length > 0 && (
        <div className="mt-12 flex flex-col gap-8">
          {artwork.sections.map((section) => (
            <div key={section.id}>
              {section.title && (
                <h2 className="font-serif text-xl text-foreground mb-3">
                  {section.title}
                </h2>
              )}
              <p className="text-base leading-relaxed text-foreground/80 whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Extra media gallery */}
      {artwork.media && artwork.media.length > 0 && (
        <div className="mt-12">
          <h2 className="font-serif text-xl text-foreground mb-6">
            {t("Pages.ArtworkDetail.gallery")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
            {artwork.media.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-lg bg-muted">
                {m.media_type === "video" ? (
                  <video
                    src={m.media_url}
                    controls
                    className="w-full"
                    preload="metadata"
                  >
                    <track kind="captions" />
                  </video>
                ) : (
                  <div className="relative aspect-4/3">
                    <Image
                      src={m.media_url}
                      alt={m.caption || artwork.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 450px"
                    />
                  </div>
                )}
                {m.caption && (
                  <p className="px-4 py-3 text-sm text-muted-foreground">
                    {m.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
