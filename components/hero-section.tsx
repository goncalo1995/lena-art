import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
      <Image
        src="https://pub-f07c1a625b1d42f4966b622eed2489fe.r2.dev/uploads/819e2d1b-2587-44f5-b19f-33218c21e165.jpg"
        alt="Helena Colaço's art studio bathed in warm afternoon light"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-foreground/30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-4xl leading-tight text-primary-foreground md:text-6xl lg:text-7xl text-balance">
          Helena Colaço
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-primary-foreground/90 md:text-lg">
          Drawings, Paintings, Photography & Poems
        </p>
      </div>
    </section>
  )
}
