import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
import { ArtworkCard } from "./artwork-card"
import type { Artwork } from "@/lib/types"
import { ART_TYPE_ROUTES, ART_TYPE_LABELS } from "@/lib/types"
import type { ArtType } from "@/lib/types"
import { getTranslations } from "next-intl/server"

interface ArtSectionProps {
  artType: ArtType
  label: string
  description: string
  artworks: Artwork[]
}

export async function ArtSection({ artType, label, description, artworks }: ArtSectionProps) {
  const t = await getTranslations("Main.buttons")
  const route = ART_TYPE_ROUTES[artType]
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
            {t("viewAll")}
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
