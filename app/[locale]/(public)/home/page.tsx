import { HeroSection } from "@/components/hero-section"
import { AboutPreview } from "@/components/about-preview"
import { ArtSection } from "@/components/art-section"
import { NewsletterForm } from "@/components/newsletter-form"
import { ContactsSection } from "@/components/contacts-section"
import { getHomeFeaturedArtworksStatic } from "@/lib/data"
import type { ArtType } from "@/lib/types"
import { getTranslations, setRequestLocale } from 'next-intl/server';

export function generateStaticParams() {
  return [{ locale: 'pt' }, { locale: 'en' }];
}

type HomePageParams = Promise<{ locale: string; }>;

export async function generateMetadata({ params: paramsPromise }: { params: HomePageParams }) {
  const { locale } = await paramsPromise;
  const t = await getTranslations({ locale, namespace: 'Pages.home' });
  return {
      title: t('title'),
      description: t('description'),
  };
}

export default async function HomePage({ params }: { params: HomePageParams }) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations('Pages.home');
  const artTypes: ArtType[] = ["drawing", "painting", "photography", "poem"]
  const artworksByType = await Promise.all(
    artTypes.map(async (type) => ({
      type,
      artworks: await getHomeFeaturedArtworksStatic(type),
    }))
  )

  return (
    <>
      <main>
        <HeroSection />
        <AboutPreview />
        <div className="divide-y divide-border">
          {artworksByType.map(({ type, artworks }) => (
            <ArtSection
              key={type}
              artType={type}
              label={t(`artwork.${type}.title`)}
              description={t(`artwork.${type}.description`)}
              artworks={artworks}
            />
          ))}
        </div>
        <NewsletterForm />
        <ContactsSection />
      </main>
    </>
  )
}
