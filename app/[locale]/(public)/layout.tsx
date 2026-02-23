import { SiteHeader } from "@/components/site-header"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { SiteFooter } from "@/components/site-footer"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="pt-16 md:pt-20">
        {children}
      </div>
      <LanguageSwitcher />
      <SiteFooter />
    </>
  )
}
