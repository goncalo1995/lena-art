import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AboutPreview() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h2 className="font-serif text-3xl text-foreground md:text-4xl text-balance">
        About the Artist
      </h2>
      <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
        Helena Colaco is a Portuguese multidisciplinary artist based in Lisbon.
        Her work moves between drawing, painting, photography and poetry,
        exploring themes of memory, landscape and the quiet poetry of everyday
        life. Each medium offers a different language for the same inner world.
      </p>
      <Button asChild className="mt-8" variant="outline" size="lg">
        <Link href="/bio">See Full Bio</Link>
      </Button>
    </section>
  )
}
