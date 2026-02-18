import { getAllCollections } from "@/lib/data"
import { ArtworkForm } from "@/components/artwork-form"

export default async function NewArtworkPage() {
  const collections = await getAllCollections()

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground mb-8">
        New Artwork
      </h1>
      <ArtworkForm collections={collections} />
    </div>
  )
}
