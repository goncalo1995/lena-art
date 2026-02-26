import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
import { ArtworkCard } from "./artwork-card"
import type { Artwork } from "@/lib/types"
import { ART_TYPE_ROUTES } from "@/lib/types"
import type { ArtType } from "@/lib/types"
import { getTranslations } from "next-intl/server"
import HorizontalScroll from "@/components/HorizontalScroll"

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
    <section className="container mx-auto px-6 py-12">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h2 className="font-serif text-2xl text-foreground md:text-3xl">{label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <Link
          href={`/${route}`}
          className="flex items-center gap-1.5 whitespace-nowrap text-sm text-primary transition-colors hover:text-primary/80"
        >
          {t("viewAll")}
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <HorizontalScroll>
        {artworks.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
            title={artwork.title}
            shortDescription={artwork.short_description}
            coverImageUrl={artwork.cover_image_url}
            href={`/${route}/${artwork.slug}`}
            isPoem={isPoem}
            className="w-[280px] shrink-0"
          />
        ))}
      </HorizontalScroll>
    </section>
  )
}
