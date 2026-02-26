import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { ArtworkDetail } from "@/components/artwork-detail"
import { CollectionView } from "@/components/collection-view"
import { getCollectionBySlug, getArtworkBySlug } from "@/lib/data"
import { ROUTE_TO_ART_TYPE } from "@/lib/types"
import { getTranslations } from "next-intl/server"

interface PageProps {
  params: Promise<{ locale: string; artType: string; slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, artType: route, slug } = await params
  const artType = ROUTE_TO_ART_TYPE[route]
  if (!artType) return {}

  const collectionData = await getCollectionBySlug(slug, artType, locale)
  if (collectionData) {
    return {
      title: collectionData.collection.title,
      description: collectionData.collection.short_description || undefined,
    }
  }

  const artwork = await getArtworkBySlug(slug, artType, locale)
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
      const route = a.art_type
        ? Object.entries(ROUTE_TO_ART_TYPE).find(([, v]) => v === a.art_type)?.[0]
        : null
      if (!route || !a.slug) return null
      return { artType: route, slug: a.slug }
    })
    .filter(Boolean) as Array<{ artType: string; slug: string }>

  const collectionParams = (collections || [])
    .map((c) => {
      const route = c.art_type
        ? Object.entries(ROUTE_TO_ART_TYPE).find(([, v]) => v === c.art_type)?.[0]
        : null
      if (!route || !c.slug) return null
      return { artType: route, slug: c.slug }
    })
    .filter(Boolean) as Array<{ artType: string; slug: string }>

  return [...artworkParams, ...collectionParams]
}

export default async function SlugPage({ params }: PageProps) {
  const tMain = await getTranslations('Main')
  const tPages = await getTranslations('Pages')
  const { locale, artType: route, slug } = await params
  const artType = ROUTE_TO_ART_TYPE[route]
  if (!artType) notFound()

  const label = tPages(`header.work.${route}`)

  // Try collection first
  const collectionData = await getCollectionBySlug(slug, artType, locale)
  if (collectionData) {
    return (
      <>
        <main>
          <div className="mx-auto max-w-6xl px-6 py-12">
            <BreadcrumbNav
              items={[
                { label: tMain('breadcrumb.home'), href: "/" },
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
  const artwork = await getArtworkBySlug(slug, artType, locale)
  if (!artwork) notFound()

  return (
    <>
      <main>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <BreadcrumbNav
            items={[
              { label: tMain('breadcrumb.home'), href: "/" },
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
