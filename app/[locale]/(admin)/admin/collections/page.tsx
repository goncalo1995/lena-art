import { Link } from "@/i18n/navigation"
import { getAllCollections } from "@/lib/data"
import { ART_TYPE_LABELS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus, Pencil } from "lucide-react"
import { DeleteCollectionButton } from "@/components/admin-delete-buttons"

export default async function AdminCollectionsPage() {
  const collections = await getAllCollections()

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-2xl text-foreground">Coleções</h1>
        <Button asChild size="sm">
          <Link href="/admin/collections/new">
            <Plus className="size-4" />
            Nova Coleção
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
                Publicado
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {collections.map((collection) => (
              <tr
                key={collection.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 text-foreground font-medium">
                  {collection.title}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {ART_TYPE_LABELS[collection.art_type]}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span
                    className={
                      collection.is_published
                        ? "text-accent"
                        : "text-muted-foreground"
                    }
                  >
                    {collection.is_published ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild size="icon-sm" variant="ghost">
                      <Link
                        href={`/admin/collections/${collection.id}/edit`}
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">
                          Editar {collection.title}
                        </span>
                      </Link>
                    </Button>
                    <DeleteCollectionButton
                      id={collection.id}
                      title={collection.title}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {collections.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            Não há coleções ainda. Crie a sua primeira.
          </p>
        )}
      </div>
    </div>
  )
}
