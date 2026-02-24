import { notFound } from "next/navigation"
import type { Metadata } from "next"
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

export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) return []

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(url, key)

  const { data } = await supabase
    .from('artworks')
    .select('slug, art_type, is_published, collections!inner(slug, art_type, is_published)')
    .eq('is_published', true)
    .eq('collections.is_published', true)

  const params = (data || [])
    .map((row: any) => {
      const route = row?.art_type ? Object.entries(ROUTE_TO_ART_TYPE).find(([, v]) => v === row.art_type)?.[0] : null
      const collectionSlug = row?.collections?.slug
      const itemSlug = row?.slug
      if (!route || !collectionSlug || !itemSlug) return null
      return { artType: route, slug: collectionSlug, itemSlug }
    })
    .filter(Boolean) as Array<{ artType: string; slug: string; itemSlug: string }>

  return params
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
      <main>
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
    </>
  )
}
