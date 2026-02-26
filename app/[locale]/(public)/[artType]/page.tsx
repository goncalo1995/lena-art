import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { ArtworkCard } from "@/components/artwork-card"
import { getListingItems } from "@/lib/data"
import { ROUTE_TO_ART_TYPE } from "@/lib/types"
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{ locale: string; artType: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const t = await getTranslations('Pages')
  const { artType: route } = await params
  const artType = ROUTE_TO_ART_TYPE[route]
  if (!artType) return {}
  const label = t(`header.work.${route}`)
  return {
    title: label,
    description: `Browse ${label.toLowerCase()} by Helena Colaço.`,
  }
}

export function generateStaticParams() {
  return [
    { artType: "drawings" },
    { artType: "paintings" },
    { artType: "photography" },
    { artType: "poetry" },
  ]
}

export default async function ArtListingPage({ params }: PageProps) {
  const t = await getTranslations('Main')
  const tPages = await getTranslations('Pages')
  const { locale, artType: route } = await params
  const artType = ROUTE_TO_ART_TYPE[route]
  if (!artType) notFound()

  const items = await getListingItems(artType, locale)
  const label = tPages(`header.work.${route}`)
  const isPoem = artType === "poem"

  return (
    <>
      <main>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <BreadcrumbNav
            items={[{ label: t('breadcrumb.home'), href: "/" }, { label }]}
          />
          <h1 className="mt-6 font-serif text-3xl text-foreground md:text-4xl">
            {label}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {items.length} {items.length === 1 ? "work" : "works"}
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ArtworkCard
                key={item.id}
                title={item.title}
                shortDescription={item.short_description}
                coverImageUrl={item.cover_image_url}
                href={`/${route}/${item.slug}`}
                isPoem={isPoem}
                badge={
                  item.type === "collection"
                    ? `${item.artwork_count} works`
                    : undefined
                }
              />
            ))}
          </div>

          {items.length === 0 && (
            <p className="mt-12 text-center text-muted-foreground">
              No works available yet. Check back soon.
            </p>
          )}
        </div>
      </main>
    </>
  )
}
