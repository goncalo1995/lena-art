import { Link } from "@/i18n/navigation"
import { Instagram } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

export async function SiteFooter() {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: "Pages.footer" })
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* Poetic headline */}
        <p className="mx-auto mb-10 max-w-3xl text-center font-serif text-sm sm:text-base leading-relaxed text-muted-foreground">
          {t("headline")}
        </p>

        {/* Main footer content */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <Link
            href="/"
            locale={locale}
            className="font-serif text-lg tracking-wide text-foreground hover:text-primary transition-colors"
          >
            Helena Colaço
          </Link>

          {/* Navigation */}
          <nav
            aria-label={t("aria.navigation")}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          >
            {[
              { href: "/bio", label: t("links.bio") },
              { href: "/drawings", label: t("links.drawings") },
              { href: "/paintings", label: t("links.paintings") },
              { href: "/photography", label: t("links.photography") },
              { href: "/poems", label: t("links.poems") },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                locale={locale}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Contact / Social */}
          <address className="not-italic flex items-center gap-4 text-sm">
            <a
              href="mailto:helena@helenacolaco.com"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              helena@helenacolaco.com
            </a>
            <span className="text-muted-foreground/40">•</span>
            <a
            href="https://instagram.com/colaco_art"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-foreground transition-colors hover:text-primary"
          >
            <Instagram className="size-5 text-primary" />
          </a>
          </address>
        </div>

        {/* Copyright */}
        <p className="mt-10 text-center text-xs text-muted-foreground">
          {t("copyright", { year: new Date().getFullYear() })}
          <br />
          <Link
            href="/privacy-policy"
            locale={locale}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {t("links.privacyPolicy")}
          </Link>
        </p>
      </div>
    </footer>
  )
}