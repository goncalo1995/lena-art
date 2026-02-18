import { notFound } from "next/navigation"
import { getCollectionById } from "@/lib/data"
import { CollectionForm } from "@/components/collection-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCollectionPage({ params }: PageProps) {
  const { id } = await params
  const collection = await getCollectionById(id)
  if (!collection) notFound()

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground mb-8">
        Edit: {collection.title}
      </h1>
      <CollectionForm collection={collection} />
    </div>
  )
}
