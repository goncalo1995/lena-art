import { SiteHeader } from "@/components/site-header"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { SiteFooter } from "@/components/site-footer"
import { CookieConsentBanner } from "@/components/cookie-consent-banner"
import { PosthogInit } from "@/components/posthog-init"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <PosthogInit />
      <div className="pt-16 md:pt-20">
        {children}
      </div>
      <LanguageSwitcher />
      <SiteFooter />
      <CookieConsentBanner />
    </>
  )
}
