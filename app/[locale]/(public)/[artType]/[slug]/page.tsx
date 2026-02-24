import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { ArtworkDetail } from "@/components/artwork-detail"
import { CollectionView } from "@/components/collection-view"
import { getCollectionBySlug, getArtworkBySlug } from "@/lib/data"
import { ROUTE_TO_ART_TYPE, ART_TYPE_LABELS } from "@/lib/types"

interface PageProps {
  params: Promise<{ artType: string; slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { artType: route, slug } = await params
  const artType = ROUTE_TO_ART_TYPE[route]
  if (!artType) return {}

  const collectionData = await getCollectionBySlug(slug, artType)
  if (collectionData) {
    return {
      title: collectionData.collection.title,
      description: collectionData.collection.short_description || undefined,
    }
  }

  const artwork = await getArtworkBySlug(slug, artType)
  if (artwork) {
    return {
      title: artwork.title,
      description: artwork.short_description || undefined,
    }
  }

  return {}
}

export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) return []

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(url, key)

  const [{ data: artworks }, { data: collections }] = await Promise.all([
    supabase
      .from('artworks')
      .select('slug, art_type, is_published')
      .eq('is_published', true),
    supabase
      .from('collections')
      .select('slug, art_type, is_published')
      .eq('is_published', true),
  ])

  const artworkParams = (artworks || [])
    .map((a) => {
      const artTypeRoute = a.art_type ? (a.art_type in ART_TYPE_LABELS ? a.art_type : null) : null
      const route = artTypeRoute ? Object.entries(ROUTE_TO_ART_TYPE).find(([, v]) => v === artTypeRoute)?.[0] : null
      if (!route || !a.slug) return null
      return { artType: route, slug: a.slug }
    })
    .filter(Boolean) as Array<{ artType: string; slug: string }>

  const collectionParams = (collections || [])
    .map((c) => {
      const artTypeRoute = c.art_type ? (c.art_type in ART_TYPE_LABELS ? c.art_type : null) : null
      const route = artTypeRoute ? Object.entries(ROUTE_TO_ART_TYPE).find(([, v]) => v === artTypeRoute)?.[0] : null
      if (!route || !c.slug) return null
      return { artType: route, slug: c.slug }
    })
    .filter(Boolean) as Array<{ artType: string; slug: string }>

  return [...artworkParams, ...collectionParams]
}

export default async function SlugPage({ params }: PageProps) {
  const { artType: route, slug } = await params
  const artType = ROUTE_TO_ART_TYPE[route]
  if (!artType) notFound()

  const label = ART_TYPE_LABELS[artType]

  // Try collection first
  const collectionData = await getCollectionBySlug(slug, artType)
  if (collectionData) {
    return (
      <>
        <main>
          <div className="mx-auto max-w-6xl px-6 py-12">
            <BreadcrumbNav
              items={[
                { label: "Home", href: "/" },
                { label, href: `/${route}` },
                { label: collectionData.collection.title },
              ]}
            />
            <div className="mt-6">
              <CollectionView
                collection={collectionData.collection}
                artworks={collectionData.artworks}
              />
            </div>
          </div>
        </main>
      </>
    )
  }

  // Try standalone artwork
  const artwork = await getArtworkBySlug(slug, artType)
  if (!artwork) notFound()

  return (
    <>
      <main>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <BreadcrumbNav
            items={[
              { label: "Home", href: "/" },
              { label, href: `/${route}` },
              { label: artwork.title },
            ]}
          />
          <div className="mt-6">
            <ArtworkDetail artwork={artwork} />
          </div>
        </div>
      </main>
    </>
  )
}
