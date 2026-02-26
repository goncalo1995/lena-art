import Image from "next/image"
import type { Metadata } from "next"
import { getTranslations } from 'next-intl/server';

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
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="flex flex-col gap-12 md:flex-row md:gap-16">
            {/* Bio text */}
            <div className="flex flex-col justify-center">
              <h1 className="font-serif text-3xl text-foreground md:text-3xl text-balance">
                {t('title')}
              </h1>
              <h2 className="text-lg text-foreground/80">
                {t('content.name')}
              </h2>
              <div className="relative aspect-video rounded-lg bg-muted">
                <Image
                  src="/images/autoretrato.jpg"
                  alt="Helena Colaço - Autoretrato"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 100%"
                  priority
                />
              </div>
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
                <p>
                  {t('content.p5')}
                </p>
                <p>
                  {t('content.p6')}
                </p>
                <p>
                  {t('content.p7')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
