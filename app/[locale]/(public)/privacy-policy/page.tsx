import { getTranslations } from 'next-intl/server'

type PrivacyPolicyParams = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: PrivacyPolicyParams }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Pages.privacyPolicy' })

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations('Pages.privacyPolicy')
  const lastUpdated = new Date().toISOString().slice(0, 10)

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-4xl text-foreground">{t('title')}</h1>
      <p className="mt-4 text-sm text-muted-foreground">{t('lastUpdated', { date: lastUpdated })}</p>

      <div className="mt-10 space-y-10 text-base leading-relaxed text-foreground/85">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-foreground">{t('sections.controller.title')}</h2>
          <p>{t('sections.controller.body')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-foreground">{t('sections.dataCollected.title')}</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t('sections.dataCollected.items.newsletter')}</li>
            <li>{t('sections.dataCollected.items.analytics')}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-foreground">{t('sections.purposes.title')}</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t('sections.purposes.items.newsletter')}</li>
            <li>{t('sections.purposes.items.analytics')}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-foreground">{t('sections.legalBasis.title')}</h2>
          <p>{t('sections.legalBasis.body')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-foreground">{t('sections.thirdParties.title')}</h2>
          <p>{t('sections.thirdParties.body')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-foreground">{t('sections.retention.title')}</h2>
          <p>{t('sections.retention.body')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-foreground">{t('sections.rights.title')}</h2>
          <p>{t('sections.rights.body')}</p>
        </section>
      </div>
    </main>
  )
}
