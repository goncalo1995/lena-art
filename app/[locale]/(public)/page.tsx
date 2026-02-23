import { HeroSection } from "@/components/hero-section"
import { AboutPreview } from "@/components/about-preview"
import { ArtSection } from "@/components/art-section"
import { NewsletterForm } from "@/components/newsletter-form"
import { ContactsSection } from "@/components/contacts-section"
import { getHomeFeaturedArtworks } from "@/lib/data"
import type { ArtType } from "@/lib/types"
import { getTranslations, setRequestLocale } from 'next-intl/server';

type HomePageParams = Promise<{ locale: string; }>;

export async function generateMetadata({ params: paramsPromise }: { params: HomePageParams }) {
  const { locale } = await paramsPromise;
  const t = await getTranslations({ locale, namespace: 'Pages.home' });
  return {
      title: t('title'),
      description: t('description'),
  };
}

export default async function HomePage({ params: paramsPromise }: { params: HomePageParams }) {
const { locale } = await paramsPromise;
  setRequestLocale(locale);
  const t = await getTranslations('Pages.home');
  const artTypes: ArtType[] = ["drawing", "painting", "photography", "poem"]
  const artworksByType = await Promise.all(
    artTypes.map(async (type) => ({
      type,
      artworks: await getHomeFeaturedArtworks(type),
    }))
  )

  console.log("transaltion", t("title"));

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
              description=""
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
