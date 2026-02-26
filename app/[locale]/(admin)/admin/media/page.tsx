// app/[locale]/admin/media/page.tsx
import { createClient } from '@/lib/supabase/server'
import { MediaGrid } from '@/components/admin/media-grid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getLocale } from 'next-intl/server'
import { MultiMediaUploader } from '@/components/admin/multi-media-uploader'

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

  // Get images only
  const images = allMedia?.filter(m => m.media_type === 'image') || []
  
  // Get videos only
  const videos = allMedia?.filter(m => m.media_type === 'video') || []

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">Imagens e Vídeos</h1>
        <p className="text-sm text-muted-foreground">
          {allMedia?.length || 0} items
        </p>
      </div>
      <div className="w-full">
        <MultiMediaUploader 
          maxFiles={20}
        />
    </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            Todos ({allMedia?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="images">
            Imagens ({images.length})
          </TabsTrigger>
          <TabsTrigger value="videos">
            Vídeos ({videos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <MediaGrid media={allMedia || []} />
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