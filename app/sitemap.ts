// app/sitemap.ts
import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://helenacolaco.com'
  const supabase = await createClient()
  
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

  // 2. Dynamic artwork pages (only published)
  const { data: artworks } = await supabase
    .from('artworks')
    .select('slug, art_type, updated_at, is_published')
    .eq('is_published', true)

  const artworkUrls = (artworks || []).flatMap(artwork =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}/${artwork.art_type}/${artwork.slug}`,
      lastModified: new Date(artwork.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  )

  // 3. Collection pages
  const { data: collections } = await supabase
    .from('collections')
    .select('slug, art_type, updated_at, is_published')
    .eq('is_published', true)

  const collectionUrls = (collections || []).flatMap(collection =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}/${collection.art_type}/${collection.slug}`,
      lastModified: new Date(collection.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  )

  return [...staticUrls, ...artworkUrls, ...collectionUrls]
}