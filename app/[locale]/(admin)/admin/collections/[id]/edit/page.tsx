import { notFound } from "next/navigation"
import { getCollectionById } from "@/lib/data"
import { CollectionForm } from "@/components/collection-form"
import { CollectionMediaManager } from "@/components/collection-media-manager"

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

      <div className="mt-12 max-w-2xl">
        <CollectionMediaManager
          collectionId={collection.id}
          media={collection.media || []}
        />
      </div>
    </div>
  )
}
