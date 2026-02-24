import Image from "next/image"
import { getTranslations } from "next-intl/server"

export async function HeroSection() {
  const t = await getTranslations("Pages.home")

  return (
    <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
      <Image
        src="/images/autoretrato.jpg"
        alt="Helena Colaço's art studio bathed in warm afternoon light"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-foreground/30" />
      <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="container mx-auto">
            <h1 className="font-serif text-white text-3xl md:text-6xl lg:text-7xl tracking-tight">
              Helena Colaço
            </h1>
            <p className="font-body text-lg md:text-xl text-white/90 mt-2 max-w-lg">
              {t('tagline')}
            </p>
          </div>
        </div>
    </section>
  )
}
