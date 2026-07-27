// app/[locale]/admin/media/page.tsx
import { createClient } from '@/lib/supabase/server'
import { MediaGrid } from '@/components/admin/media-grid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getLocale } from 'next-intl/server'
import { MultiMediaUploader } from '@/components/admin/multi-media-uploader'
import type { ArtworkMediaWithArtwork } from '@/lib/types'

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

  const typed = (allMedia || []) as ArtworkMediaWithArtwork[]

  // Get images only
  const images = typed.filter(m => m.media_type === 'image')
  
  // Get videos only
  const videos = typed.filter(m => m.media_type === 'video')

  // Unused: not linked to any artwork
  const unused = typed.filter(m => !m.artwork_id)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">Imagens e Vídeos</h1>
        <p className="text-sm text-muted-foreground">
          {typed.length} items
          {unused.length > 0 && (
            <span className="ml-2 text-amber-500 font-medium">· {unused.length} não utilizados</span>
          )}
        </p>
      </div>
      <div className="w-full">
        <MultiMediaUploader maxFiles={20} />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            Todos ({typed.length})
          </TabsTrigger>
          <TabsTrigger value="images">
            Imagens ({images.length})
          </TabsTrigger>
          <TabsTrigger value="videos">
            Vídeos ({videos.length})
          </TabsTrigger>
          <TabsTrigger value="unused">
            Não utilizados ({unused.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <MediaGrid media={typed} />
        </TabsContent>

        <TabsContent value="images">
          <MediaGrid media={images} />
        </TabsContent>

        <TabsContent value="videos">
          <MediaGrid media={videos} />
        </TabsContent>

        <TabsContent value="unused">
          {unused.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">Sem ficheiros não utilizados 🎉</p>
              <p className="text-sm text-muted-foreground mt-1">
                Todos os ficheiros estão ligados a uma obra.
              </p>
            </div>
          ) : (
            <MediaGrid media={unused} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}