// app/[locale]/admin/media/page.tsx
import { createClient } from '@/lib/supabase/server'
import { MediaUploader } from '@/components/admin/media-uploader'
import { MediaGrid } from '@/components/admin/media-grid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ArtworkMediaWithArtwork } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import { getLocale } from 'next-intl/server'

export default async function MediaPage() {
  const supabase = await createClient()
  const locale = await getLocale()
  
  // Get all media with artwork info
  const { data: allMedia } = await supabase
    .from('artwork_media')
    .select(`
      *,
      artworks (
        id,
        title,
        art_type
      )
    `)
    .order('created_at', { ascending: false })

  // Cast to the correct type
  const typedMedia = (allMedia as ArtworkMediaWithArtwork[]) || []
  
  // Get images only
  const images = typedMedia.filter(m => m.media_type === 'image')
  
  // Get videos only
  const videos = typedMedia.filter(m => m.media_type === 'video')

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">Media Library</h1>
        <p className="text-sm text-muted-foreground">
          {typedMedia.length} items total
        </p>
      </div>
      <div className="w-full">
        <MediaUploader 
        onUploadComplete={async (url, type) => {
            // When upload completes, refresh the page to show new media
            'use server'
            revalidatePath(`/${locale}/admin/media`)
        }}
        />
    </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All ({typedMedia.length})
          </TabsTrigger>
          <TabsTrigger value="images">
            Images ({images.length})
          </TabsTrigger>
          <TabsTrigger value="videos">
            Videos ({videos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <MediaGrid media={typedMedia} />
        </TabsContent>

        <TabsContent value="images">
          <MediaGrid media={images} />
        </TabsContent>

        <TabsContent value="videos">
          <MediaGrid media={videos} />
        </TabsContent>
      </Tabs>
    </div>
  )
}