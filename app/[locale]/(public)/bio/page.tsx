import Image from "next/image"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: "Bio",
  description:
    "Learn about Helena Colaço, a Portuguese multidisciplinary artist working across drawing, painting, photography and poetry.",
}

export default async function BioPage() {
  const t = await getTranslations('Pages.bio')
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
                {t('title')}
              </h1>
              <div className="mt-6 flex flex-col gap-5 text-base leading-relaxed text-foreground/80">
                <p>
                  {t('content.p1')}
                </p>
                <p>
                  {t('content.p2')}
                </p>
                <p>
                  {t('content.p3')}
                </p>
                <p>
                  {t('content.p4')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
