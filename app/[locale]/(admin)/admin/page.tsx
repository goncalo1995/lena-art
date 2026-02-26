import { Link } from "@/i18n/navigation"
import { getAllArtworks, getAllCollections, getSubscribers, getSubscribersCount } from "@/lib/data"
import { ART_TYPE_LABELS, ART_TYPES } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default async function AdminDashboardPage() {
  const [artworks, collections, subscribers] = await Promise.all([
    getAllArtworks(),
    getAllCollections(),
    getSubscribers(5)
  ])

  const countsByType = ART_TYPES.map((type) => ({
    type,
    label: ART_TYPE_LABELS[type],
    count: artworks.filter((a) => a.art_type === type).length,
  }))

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-2xl text-foreground">Visão Geral</h1>
        <div className="flex gap-3">
          <Button asChild size="sm">
            <Link href="/admin/artworks/new">
              <Plus className="size-4" />
              Nova Obra
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/collections/new">
              <Plus className="size-4" />
              Nova Coleção
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {countsByType.map(({ type, label, count }) => (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-serif text-foreground">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Obras Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {artworks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ainda não há obras.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {artworks.slice(0, 5).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground truncate">{a.title}</span>
                    <span className="text-muted-foreground shrink-0 ml-4">
                      {ART_TYPE_LABELS[a.art_type]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coleções</CardTitle>
          </CardHeader>
          <CardContent>
            {collections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ainda não há coleções.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {collections.slice(0, 5).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground truncate">{c.title}</span>
                    <span className="text-muted-foreground shrink-0 ml-4">
                      {ART_TYPE_LABELS[c.art_type]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimos Subscritores</CardTitle>
          </CardHeader>
          <CardContent>
            {subscribers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ainda não há subscritores.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {subscribers.slice(0, 5).map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-foreground truncate">{s.name}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{s.email}</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-muted-foreground shrink-0 ml-4">
                      {s.subscribed_at
                        ? new Date(s.subscribed_at).toLocaleDateString("pt-PT")
                        : "N/A"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
