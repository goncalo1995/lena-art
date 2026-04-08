import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { ROUTE_TO_ART_TYPE } from '@/lib/types'

export async function POST(request: NextRequest) {
  // Check Supabase auth - only allow logged-in admin users
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized - requires admin login' }, { status: 401 })
  }

  try {
    // Use static client to fetch all data for revalidation
    const staticClient = createStaticClient()
    let revalidatedCount = 0

    // Fetch all collections and artworks
    const [{ data: collections }, { data: artworks }] = await Promise.all([
      staticClient?.from('collections').select('*').eq('is_published', true) ?? { data: [] },
      staticClient?.from('artworks').select('*, collections(slug)').eq('is_published', true) ?? { data: [] }
    ])

    // Revalidate all public pages for all locales
    for (const locale of routing.locales) {
      // Home
      revalidatePath(`/${locale}`)
      revalidatePath(`/${locale}/home`)
      revalidatedCount += 2

      // Static pages
      revalidatePath(`/${locale}/bio`)
      revalidatePath(`/${locale}/privacy-policy`)
      revalidatedCount += 2

      // Art type index pages
      const artTypes = ['drawings', 'paintings', 'photography', 'poetry']
      for (const artType of artTypes) {
        revalidatePath(`/${locale}/${artType}`)
        revalidatedCount++
      }

      // Collection and artwork detail pages
      for (const collection of (collections ?? [])) {
        const route = Object.entries(ROUTE_TO_ART_TYPE).find(([, v]) => v === collection.art_type)?.[0]
        if (route && collection.slug) {
          revalidatePath(`/${locale}/${route}/${collection.slug}`)
          revalidatedCount++
        }
      }

      for (const artwork of (artworks ?? [])) {
        const route = Object.entries(ROUTE_TO_ART_TYPE).find(([, v]) => v === artwork.art_type)?.[0]
        if (route && artwork.slug) {
          if (artwork.collections?.slug) {
            // Artwork in collection: /[locale]/[artType]/[collectionSlug]/[artworkSlug]
            revalidatePath(`/${locale}/${route}/${artwork.collections.slug}/${artwork.slug}`)
          } else {
            // Standalone artwork: /[locale]/[artType]/[artworkSlug]
            revalidatePath(`/${locale}/${route}/${artwork.slug}`)
          }
          revalidatedCount++
        }
      }
    }

    // Revalidate data tags
    revalidateTag('artworks', 'max')
    revalidateTag('collections', 'max')

    return NextResponse.json({
      success: true,
      revalidatedCount,
      locales: routing.locales,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Revalidation failed', message: (error as Error).message },
      { status: 500 }
    )
  }
}
