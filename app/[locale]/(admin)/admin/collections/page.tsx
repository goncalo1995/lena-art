import { Link } from "@/i18n/navigation"
import { getAllCollections } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CollectionsTable } from "./collections-table"

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

      <CollectionsTable collections={collections} />
    </div>
  )
}
