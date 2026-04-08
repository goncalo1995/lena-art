import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { ArtworkDetail } from "@/components/artwork-detail"
import { getArtworkInCollectionStatic } from "@/lib/data"
import { ROUTE_TO_ART_TYPE } from "@/lib/types"
import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"

interface PageProps {
  params: Promise<{ locale: string; artType: string; slug: string; itemSlug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, artType: route, slug, itemSlug } = await params
  const artType = ROUTE_TO_ART_TYPE[route]
  if (!artType) return {}

  const data = await getArtworkInCollectionStatic(slug, itemSlug, artType, locale)
  if (!data) return {}

  const title = locale === 'pt' ? data.artwork.title : data.artwork.title_en || data.artwork.title
  const description = locale === 'pt' ? data.artwork.short_description : data.artwork.short_description_en || data.artwork.short_description
  const imageUrl = data.artwork.cover_image_url
  
  return {
    title: title,
    description: description || undefined,
    openGraph: {
      title: title,
      description: description || undefined,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description || undefined,
      images: imageUrl ? [imageUrl] : [],
    },
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

  return params.flatMap((param) =>
    routing.locales.map((locale) => ({ ...param, locale }))
  )
}

export default async function CollectionItemPage({ params }: PageProps) {
  const { locale, artType: route, slug, itemSlug } = await params
  const tMain = await getTranslations({ locale, namespace: 'Main' })
  const tPages = await getTranslations({ locale, namespace: 'Pages' })
  const artType = ROUTE_TO_ART_TYPE[route]
  if (!artType) notFound()

  const data = await getArtworkInCollectionStatic(slug, itemSlug, artType, locale)
  if (!data) notFound()

  const label = tPages(`header.work.${route}`)

  return (
    <>
      <main>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <BreadcrumbNav
            items={[
              { label: tMain('breadcrumb.home'), href: "/" },
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
