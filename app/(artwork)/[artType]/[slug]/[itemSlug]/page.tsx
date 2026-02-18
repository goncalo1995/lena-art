import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { ArtworkDetail } from "@/components/artwork-detail"
import { getArtworkInCollection } from "@/lib/data"
import { ROUTE_TO_ART_TYPE, ART_TYPE_LABELS } from "@/lib/types"

interface PageProps {
  params: Promise<{ artType: string; slug: string; itemSlug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { artType: route, slug, itemSlug } = await params
  const artType = ROUTE_TO_ART_TYPE[route]
  if (!artType) return {}

  const data = await getArtworkInCollection(slug, itemSlug, artType)
  if (!data) return {}

  return {
    title: data.artwork.title,
    description: data.artwork.short_description || undefined,
  }
}

export default async function CollectionItemPage({ params }: PageProps) {
  const { artType: route, slug, itemSlug } = await params
  const artType = ROUTE_TO_ART_TYPE[route]
  if (!artType) notFound()

  const data = await getArtworkInCollection(slug, itemSlug, artType)
  if (!data) notFound()

  const label = ART_TYPE_LABELS[artType]

  return (
    <>
      <SiteHeader />
      <main className="pt-20">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <BreadcrumbNav
            items={[
              { label: "Home", href: "/" },
              { label, href: `/${route}` },
              {
                label: data.collection.title,
                href: `/${route}/${data.collection.slug}`,
              },
              { label: data.artwork.title },
            ]}
          />
          <div className="mt-6">
            <ArtworkDetail artwork={data.artwork} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
