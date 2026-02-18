import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
      <Image
        src="https://vm-ok0lbwbwrv1e1agczur0la.vusercontent.net/images/hero.jpg"
        alt="Helena Colaco's art studio bathed in warm afternoon light"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-foreground/30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-4xl leading-tight text-primary-foreground md:text-6xl lg:text-7xl text-balance">
          Helena Colaco
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-primary-foreground/90 md:text-lg">
          Drawings, Paintings, Photography & Poems
        </p>
      </div>
    </section>
  )
}
