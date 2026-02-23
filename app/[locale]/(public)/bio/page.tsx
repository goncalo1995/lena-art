import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bio",
  description:
    "Learn about Helena Colaço, a Portuguese multidisciplinary artist working across drawing, painting, photography and poetry.",
}

export default function BioPage() {
  return (
    <>
      <main>
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-col gap-12 md:flex-row md:gap-16">
            {/* Portrait */}
            <div className="shrink-0 md:w-[340px]">
              <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-muted">
                <Image
                  src="/images/bio-portrait.jpg"
                  alt="Helena Colaço in her studio"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 340px"
                  priority
                />
              </div>
            </div>

            {/* Bio text */}
            <div className="flex flex-col justify-center">
              <h1 className="font-serif text-3xl text-foreground md:text-4xl text-balance">
                Helena Colaço
              </h1>
              <div className="mt-6 flex flex-col gap-5 text-base leading-relaxed text-foreground/80">
                <p>
                  Helena Colaço is a Portuguese multidisciplinary artist based in
                  Lisbon. Born in 1992, she studied Fine Arts at the Faculty of
                  Fine Arts of the University of Lisbon, where she developed a
                  deep connection to traditional techniques and a curiosity for
                  the intersection of visual art and language.
                </p>
                <p>
                  Her work moves between drawing, painting, photography and
                  poetry, exploring themes of memory, landscape, solitude and
                  the quiet poetry of everyday life. Each medium offers a
                  different language for the same inner world -- charcoal for
                  intimacy, oil paint for the weight of memory, the camera for
                  fleeting truths, and words for what images cannot hold.
                </p>
                <p>
                  Helena has exhibited in Lisbon, Porto and Berlin, and her
                  photography has been featured in several Portuguese literary
                  journals. She is particularly drawn to the Alentejo landscape
                  and the overlooked corners of urban life.
                </p>
                <p>
                  When she is not creating, Helena can be found walking along
                  the Tagus, reading poetry in her favourite cafe, or tending to
                  the small garden on her Lisbon rooftop. She believes that art
                  is a form of attention -- a way of saying: I was here, and I
                  noticed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
