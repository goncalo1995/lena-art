import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
import { ArtworkCard } from "./artwork-card"
import type { ArtType, FeaturedItem } from "@/lib/types"
import { ART_TYPE_ROUTES } from "@/lib/types"
import { getTranslations } from "next-intl/server"
import HorizontalScroll from "@/components/HorizontalScroll"

interface ArtSectionProps {
  artType: ArtType
  label: string
  description: string
  artworks: FeaturedItem[]
  locale: string
}

export async function ArtSection({ artType, label, description, artworks, locale }: ArtSectionProps) {
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
        {artworks.map((item) => {
          const title = locale === 'pt' ? item.title : item.title_en || item.title
          const shortDescription = locale === 'pt' ? item.short_description : item.short_description_en || item.short_description

          // Build href based on item type
          const href = item.type === 'collection'
            ? `/${route}/${item.slug}`
            : `/${route}/${item.collection_slug ? item.collection_slug + '/' : ''}${item.slug}`

          return (
            <ArtworkCard
              key={item.id}
              title={title}
              shortDescription={shortDescription}
              coverImageUrl={item.cover_image_url}
              href={href}
              isPoem={isPoem}
              className="w-[280px] shrink-0"
            />
          )
        })}
      </HorizontalScroll>
    </section>
  )
}
