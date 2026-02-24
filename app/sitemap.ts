// app/sitemap.ts
import { MetadataRoute } from 'next'
import { ART_TYPE_ROUTES, type ArtType } from '@/lib/types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://helenacolaco.com'
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    return []
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(url, key)
  
  // 1. Static routes (with locales)
  const staticRoutes = [
    '',           // home
    '/bio',
    '/drawings',
    '/paintings',
    '/photography',
    '/poems',
  ]
  
  // Generate for each locale
  const locales = ['pt', 'en']
  const staticUrls = locales.flatMap(locale =>
    staticRoutes.map(route => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1.0 : 0.8,
    }))
  )

  const [{ data: artworks }, { data: collections }] = await Promise.all([
    supabase
      .from('artworks')
      .select('slug, art_type, updated_at, is_published, collection_id')
      .eq('is_published', true),
    supabase
      .from('collections')
      .select('id, slug, art_type, updated_at, is_published')
      .eq('is_published', true),
  ])

  const collectionsById = new Map(
    (collections || []).map((c: any) => [c.id, c])
  )
  
  const collectionUrls = (collections || []).flatMap((collection: any) => {
    const route = ART_TYPE_ROUTES[collection.art_type as ArtType]
    if (!route || !collection.slug) return []
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}/${route}/${collection.slug}`,
      lastModified: new Date(collection.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  })

  const artworkUrls = (artworks || []).flatMap((artwork: any) => {
    const route = ART_TYPE_ROUTES[artwork.art_type as ArtType]
    if (!route || !artwork.slug) return []

    const collection = artwork.collection_id
      ? collectionsById.get(artwork.collection_id)
      : null

    const path = collection?.slug
      ? `/${route}/${collection.slug}/${artwork.slug}`
      : `/${route}/${artwork.slug}`

    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(artwork.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: collection?.slug ? 0.5 : 0.6,
    }))
  })

  return [...staticUrls, ...collectionUrls, ...artworkUrls]
}