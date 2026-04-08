import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Check Supabase auth - only allow logged-in admin users
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized - requires admin login' }, { status: 401 })
  }

  const body = await request.json()
  const { type = 'all' } = body

  try {
    // Revalidate all public pages for all locales
    for (const locale of routing.locales) {
      // Home
      revalidatePath(`/${locale}`)
      revalidatePath(`/${locale}/home`)
      
      // Static pages
      revalidatePath(`/${locale}/bio`)
      revalidatePath(`/${locale}/privacy-policy`)
      
      // Art types (these will regenerate on next visit)
      const artTypes = ['drawings', 'paintings', 'photography', 'poetry']
      for (const artType of artTypes) {
        revalidatePath(`/${locale}/${artType}`)
      }
    }

    // Revalidate data tags
    revalidateTag('artworks', 'max')
    revalidateTag('collections', 'max')

    return NextResponse.json({ 
      success: true, 
      revalidated: type,
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
