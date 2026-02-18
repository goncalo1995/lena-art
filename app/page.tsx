import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { AboutPreview } from "@/components/about-preview"
import { ArtSection } from "@/components/art-section"
import { NewsletterForm } from "@/components/newsletter-form"
import { ContactsSection } from "@/components/contacts-section"
import { SiteFooter } from "@/components/site-footer"
import { getHomeFeaturedArtworks } from "@/lib/data"
import type { ArtType } from "@/lib/types"

export default async function HomePage() {
  const artTypes: ArtType[] = ["drawing", "painting", "photography", "poem"]
  const artworksByType = await Promise.all(
    artTypes.map(async (type) => ({
      type,
      artworks: await getHomeFeaturedArtworks(type),
    }))
  )

  return (
    <>
      <SiteHeader />
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
      <SiteFooter />
    </>
  )
}
