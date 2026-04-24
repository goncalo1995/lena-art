'use client'

import { useState, useMemo } from 'react'
import { Link } from "@/i18n/navigation"
import { ART_TYPE_LABELS, ART_TYPES, type Artwork, type Collection } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Search, ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react"
import { DeleteArtworkButton } from "@/components/admin-delete-buttons"

type SortColumn = 'title' | 'art_type' | 'sort_order' | 'is_published' | 'collection'
type SortDirection = 'asc' | 'desc'

interface ArtworksTableProps {
  artworks: Artwork[]
  collections: Collection[]
}

export function ArtworksTable({ artworks, collections }: ArtworksTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCollection, setFilterCollection] = useState<string>('all')
  const [filterPublished, setFilterPublished] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<SortColumn>('sort_order')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const getCollectionName = (id: string | null) => {
    if (!id) return null
    return collections.find((c) => c.id === id)?.title || null
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="size-3.5 text-primary" />
    ) : (
      <ArrowDown className="size-3.5 text-primary" />
    )
  }

  const filteredAndSortedArtworks = useMemo(() => {
    let result = [...artworks]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          (a.short_description?.toLowerCase().includes(query) ?? false)
      )
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((a) => a.art_type === filterType)
    }

    // Filter by collection
    if (filterCollection === 'none') {
      result = result.filter((a) => !a.collection_id)
    } else if (filterCollection !== 'all') {
      result = result.filter((a) => a.collection_id === filterCollection)
    }

    // Filter by published status
    if (filterPublished !== 'all') {
      result = result.filter((a) =>
        filterPublished === 'published' ? a.is_published : !a.is_published
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortColumn) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'art_type':
          comparison = a.art_type.localeCompare(b.art_type)
          break
        case 'collection':
          const aCol = getCollectionName(a.collection_id) || ''
          const bCol = getCollectionName(b.collection_id) || ''
          comparison = aCol.localeCompare(bCol)
          break
        case 'sort_order':
          comparison = (a.sort_order ?? 0) - (b.sort_order ?? 0)
          break
        case 'is_published':
          comparison = Number(a.is_published) - Number(b.is_published)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [artworks, searchQuery, filterType, filterCollection, filterPublished, sortColumn, sortDirection])

  const hasActiveFilters =
    searchQuery || filterType !== 'all' || filterCollection !== 'all' || filterPublished !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setFilterType('all')
    setFilterCollection('all')
    setFilterPublished('all')
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar obras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {ART_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {ART_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCollection} onValueChange={setFilterCollection}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Coleção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as coleções</SelectItem>
                <SelectItem value="none">Sem coleção</SelectItem>
                {collections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPublished} onValueChange={setFilterPublished}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                <X className="size-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {filteredAndSortedArtworks.length} de {artworks.length} obras
        </p>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-1">
                  Título
                  {getSortIcon('title')}
                </div>
              </TableHead>
              <TableHead className="hidden sm:table-cell cursor-pointer" onClick={() => handleSort('art_type')}>
                <div className="flex items-center gap-1">
                  Tipo
                  {getSortIcon('art_type')}
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort('collection')}>
                <div className="flex items-center gap-1">
                  Coleção
                  {getSortIcon('collection')}
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort('sort_order')}>
                <div className="flex items-center gap-1">
                  Ordem
                  {getSortIcon('sort_order')}
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell cursor-pointer" onClick={() => handleSort('is_published')}>
                <div className="flex items-center gap-1">
                  Publicado
                  {getSortIcon('is_published')}
                </div>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedArtworks.map((artwork) => (
              <TableRow key={artwork.id}>
                <TableCell className="font-medium">{artwork.title}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {ART_TYPE_LABELS[artwork.art_type]}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {getCollectionName(artwork.collection_id) || '—'}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {artwork.sort_order}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className={artwork.is_published ? 'text-accent' : 'text-muted-foreground'}>
                    {artwork.is_published ? 'Sim' : 'Não'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild size="icon" variant="ghost" className="size-8">
                      <Link href={`/admin/artworks/${artwork.id}/edit`}>
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar {artwork.title}</span>
                      </Link>
                    </Button>
                    <DeleteArtworkButton id={artwork.id} title={artwork.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredAndSortedArtworks.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? 'Nenhuma obra corresponde aos filtros.'
                : 'Ainda não há obras. Crie a primeira.'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
