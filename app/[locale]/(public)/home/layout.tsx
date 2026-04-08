import { SiteHeader } from "@/components/site-header"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { SiteFooter } from "@/components/site-footer"
import { CookieConsentBanner } from "@/components/cookie-consent-banner"
import { PosthogInit } from "@/components/posthog-init"

interface HomeLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function HomeLayout({ children, params }: HomeLayoutProps) {
  const { locale } = await params
  return (
    <>
      <SiteHeader />
      <PosthogInit />
      <div className="pt-16 md:pt-20">
        {children}
      </div>
      <LanguageSwitcher />
      <SiteFooter locale={locale} />
      <CookieConsentBanner />
    </>
  )
}
