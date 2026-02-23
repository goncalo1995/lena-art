"use client"

import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

export function SiteHeader() {
  const pathname = usePathname()
  const t = useTranslations("Pages.header")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [workOpen, setWorkOpen] = useState(false)

  const workLinks = useMemo(
    () => [
      { label: t("work.drawings"), href: "/drawings" },
      { label: t("work.paintings"), href: "/paintings" },
      { label: t("work.photography"), href: "/photography" },
      { label: t("work.poems"), href: "/poems" },
    ],
    [t]
  )

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
    setWorkOpen(false)

    if (window.location.hash === "#contacts") {
      const el = document.getElementById("contacts")
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" })
        }, 50)
      }
    }
  }, [pathname])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6">
      {/* Backdrop layer – always present when menu is open or on desktop */}
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-b from-background via-background/95 to-background/80 backdrop-blur-lg transition-opacity duration-400",
          mobileOpen ? "opacity-100" : "opacity-90 md:opacity-85"
        )}
      />

      {/* Main content layer */}
      <div className="relative z-10 border-b border-border/40">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 md:px-10 py-4 md:py-5">
          <Link
            href="/"
            className="font-serif text-xl sm:text-2xl tracking-tight text-foreground/90 hover:text-foreground transition-colors"
          >
            {t("brand")}
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-10 lg:gap-12">
            <li>
              <Link
                href="/bio"
                className={cn(
                  "text-base tracking-wide transition-colors hover:text-primary/90",
                  pathname === "/bio" ? "text-primary" : "text-muted-foreground"
                )}
              >
                {t("nav.bio")}
              </Link>
            </li>

            <li className="relative group">
              <button
                className={cn(
                  "flex items-center gap-1.5 text-base tracking-wide transition-colors hover:text-primary/90",
                  workLinks.some((l) => pathname.startsWith(l.href))
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {t("nav.work")}
                <ChevronDown className="size-4 transition-transform group-hover:rotate-180 duration-300" />
              </button>

              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                <ul className="flex flex-col bg-card/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-xl py-2.5 min-w-[180px] text-sm">
                  {workLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "block px-5 py-2.5 transition-colors hover:bg-muted/70 hover:text-primary",
                          pathname.startsWith(link.href) ? "text-primary" : "text-foreground/90"
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            <li>
              <Link
                href="/#contacts"
                // onClick={handleContactsClick}
                className="text-base tracking-wide text-muted-foreground hover:text-primary/90 transition-colors"
              >
                {t("nav.contact")}
              </Link>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-foreground/90 hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t("a11y.closeMenu") : t("a11y.openMenu")}
          >
            <div className="relative size-6">
              <Menu
                className={cn(
                  "absolute inset-0 transition-all duration-300",
                  mobileOpen ? "opacity-0" : "opacity-100"
                )}
              />
            </div>
          </button>
        </nav>
      </div>

      {/* ──────────────────────────────────────────────── */}
      {/*               MOBILE FULL-SCREEN MENU            */}
      {/* ──────────────────────────────────────────────── */}

      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 flex flex-col transition-all duration-400 ease-in-out",
          mobileOpen
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-8"
        )}
      >
        {/* Backdrop blur continues from header */}
        <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Top bar – minimal */}
          <div className="flex items-center justify-between px-9 py-4 border-b border-border/30 bg-transparent">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="font-serif text-xl sm:text-2xl tracking-tight text-foreground/90 hover:text-foreground transition-colors"
            >
              {t("brand")}
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label={t("a11y.closeMenu")}
              className="text-foreground/80 hover:text-foreground"
            >
              <X size={28} />
            </button>
          </div>

          {/* Main nav – big & artistic */}
          <nav className="flex-1 overflow-y-auto px-6 py-12 md:py-16">
            <ul className="flex flex-col gap-12 md:gap-16">
              <li>
                <Link
                  href="/bio"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block text-4xl sm:text-5xl font-serif tracking-tight transition-colors duration-200",
                    pathname === "/bio" ? "text-primary" : "text-foreground/90 hover:text-primary"
                  )}
                >
                  {t("nav.bio")}
                </Link>
              </li>

              <li>
                <button
                  onClick={() => setWorkOpen(!workOpen)}
                  className={cn(
                    "flex w-full items-center justify-between text-4xl sm:text-5xl font-serif tracking-tight text-foreground/90 transition-colors duration-200 hover:text-primary",
                    workOpen && "text-primary"
                  )}
                >
                  {t("nav.work")}
                  <ChevronDown
                    className={cn(
                      "size-8 sm:size-9 transition-transform duration-400",
                      workOpen && "rotate-180"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-[max-height,opacity,margin] duration-500 ease-in-out",
                    workOpen
                      ? "max-h-[500px] opacity-100 mt-6"
                      : "max-h-0 opacity-0 mt-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-6 pl-5 sm:pl-8 border-l-2 border-primary/30 py-2">
                      {workLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "text-2xl sm:text-3xl font-light tracking-wide transition-colors",
                            pathname.startsWith(link.href)
                              ? "text-primary"
                              : "text-muted-foreground/90 hover:text-foreground"
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </li>

              <li>
                <Link
                  href="/#contacts"
                  onClick={() => {
                    setMobileOpen(false)
                  }}
                  className="block text-4xl sm:text-5xl font-serif tracking-tight text-foreground/90 transition-colors hover:text-primary duration-200"
                >
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
