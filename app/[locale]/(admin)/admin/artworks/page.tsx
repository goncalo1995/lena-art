import { Link } from "@/i18n/navigation"
import { getAllArtworks, getAllCollections } from "@/lib/data"
import { ART_TYPE_LABELS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus, Pencil } from "lucide-react"
import { DeleteArtworkButton } from "@/components/admin-delete-buttons"

export default async function AdminArtworksPage() {
  const [artworks, collections] = await Promise.all([
    getAllArtworks(),
    getAllCollections(),
  ])

  const getCollectionName = (id: string | null) => {
    if (!id) return null
    return collections.find((c) => c.id === id)?.title || null
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-2xl text-foreground">Artworks</h1>
        <Button asChild size="sm">
          <Link href="/admin/artworks/new">
            <Plus className="size-4" />
            Nova Obra
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Título
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                Tipo
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                Coleção
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                Ordem
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                Publicado
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {artworks.map((artwork) => (
              <tr key={artwork.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-foreground">
                  <span className="font-medium">{artwork.title}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {ART_TYPE_LABELS[artwork.art_type]}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {getCollectionName(artwork.collection_id) || "---"}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {artwork.sort_order}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span
                    className={
                      artwork.is_published
                        ? "text-accent"
                        : "text-muted-foreground"
                    }
                  >
                    {artwork.is_published ? "Sim" : "Não"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild size="icon-sm" variant="ghost">
                      <Link href={`/admin/artworks/${artwork.id}/edit`}>
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar {artwork.title}</span>
                      </Link>
                    </Button>
                    <DeleteArtworkButton id={artwork.id} title={artwork.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {artworks.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            Ainda não há obras. Crie a primeira.
          </p>
        )}
      </div>
    </div>
  )
}
