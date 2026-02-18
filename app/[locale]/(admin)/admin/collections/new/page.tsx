import { CollectionForm } from "@/components/collection-form"

export default function NewCollectionPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground mb-8">
        New Collection
      </h1>
      <CollectionForm />
    </div>
  )
}
