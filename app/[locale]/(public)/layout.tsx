import { SiteHeader } from "@/components/site-header"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { SiteFooter } from "@/components/site-footer"

interface PublicLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function PublicLayout({ children, params }: PublicLayoutProps) {
  const { locale } = await params
  return (
    <>
      <SiteHeader />
      <div className="pt-16 md:pt-20">
        {children}
      </div>
      <LanguageSwitcher />
      <SiteFooter locale={locale} />
    </>
  )
}
