import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ArtworkCard } from "./artwork-card"
import type { Artwork } from "@/lib/types"
import { ART_TYPE_ROUTES, ART_TYPE_LABELS } from "@/lib/types"
import type { ArtType } from "@/lib/types"

interface ArtSectionProps {
  artType: ArtType
  description: string
  artworks: Artwork[]
}

const sectionDescriptions: Record<ArtType, string> = {
  drawing:
    "Intimate studies in charcoal, graphite and ink that capture the essence of a moment.",
  painting:
    "Oil and acrylic works exploring colour, light and the landscapes of memory.",
  photography:
    "Moments of quiet beauty found in the everyday streets and corners of the city.",
  poem:
    "Words shaped into small vessels of feeling, written alongside the visual work.",
}

export function ArtSection({ artType, artworks }: ArtSectionProps) {
  const route = ART_TYPE_ROUTES[artType]
  const label = ART_TYPE_LABELS[artType]
  const description = sectionDescriptions[artType]
  const isPoem = artType === "poem"

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl text-foreground md:text-3xl">
              {label}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              {description}
            </p>
          </div>
          <Link
            href={`/${route}`}
            className="flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/80 shrink-0"
          >
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              title={artwork.title}
              shortDescription={artwork.short_description}
              coverImageUrl={artwork.cover_image_url}
              href={`/${route}/${artwork.slug}`}
              isPoem={isPoem}
              className="w-[280px] shrink-0 snap-start"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
