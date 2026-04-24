import { Link } from "@/i18n/navigation"
import { getAllArtworks, getAllCollections } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ArtworksTable } from "./artworks-table"

export default async function AdminArtworksPage() {
  const [artworks, collections] = await Promise.all([
    getAllArtworks(),
    getAllCollections(),
  ])

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-2xl text-foreground">Obras</h1>
        <Button asChild size="sm">
          <Link href="/admin/artworks/new">
            <Plus className="size-4" />
            Nova Obra
          </Link>
        </Button>
      </div>

      <ArtworksTable artworks={artworks} collections={collections} />
    </div>
  )
}
