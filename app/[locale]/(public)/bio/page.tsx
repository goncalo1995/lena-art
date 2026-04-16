import Image from "next/image"
import type { Metadata } from "next"
import { getTranslations } from 'next-intl/server';

export function generateStaticParams() {
  return [{ locale: 'pt' }, { locale: 'en' }]
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Pages.bio' })
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

export default async function BioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Pages.bio' })
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
                  src="/images/retratro_biografia_cut.jpg"
                  alt="Helena Colaço - Autoretrato1 "
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 100%"
                  priority
                />
              </div>
              <hr className="my-6" />
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

              {/* Exhibitions Section */}
              <div className="mt-12">
                <h3 className="font-serif text-2xl text-foreground mb-6">
                  {t('content.exhibitionsTitle')}
                </h3>
                <div className="flex flex-col gap-4">
                  {t.raw('content.exhibitions').map((exhibition: { year: string; title: string; location: string; type: string }, index: number) => (
                    <div key={index} className="flex flex-col gap-1 pb-4 border-b border-border/50 last:border-0">
                      <div className="flex items-baseline gap-3">
                        <span className="text-sm font-medium text-foreground/60">{exhibition.year}</span>
                        <span className="text-base font-medium text-foreground">{exhibition.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/70 pl-12">
                        <span>{exhibition.location}</span>
                        <span className="text-foreground/40">·</span>
                        <span className="italic">{exhibition.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
