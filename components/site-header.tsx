"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "@/i18n/navigation"

const workLinks = [
  { label: "Drawings", href: "/drawings" },
  { label: "Paintings", href: "/paintings" },
  { label: "Photography", href: "/photography" },
  { label: "Poems", href: "/poems" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [workOpen, setWorkOpen] = useState(false)

  const handleContactsClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault()
      document
        .getElementById("contacts")
        ?.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-serif text-xl tracking-wide text-foreground"
        >
          Helena Colaço
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          <li>
            <Link
              href="/bio"
              className={cn(
                "text-sm tracking-wide transition-colors hover:text-primary",
                pathname === "/bio"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              Bio
            </Link>
          </li>
          <li className="relative group">
            <button
              className={cn(
                "flex items-center gap-1 text-sm tracking-wide transition-colors hover:text-primary",
                workLinks.some((l) => pathname.startsWith(l.href))
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              Work
              <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all absolute top-full left-1/2 -translate-x-1/2 pt-2">
              <ul className="flex flex-col bg-card border border-border rounded-lg shadow-md py-2 min-w-[160px]">
                {workLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block px-4 py-2 text-sm transition-colors hover:bg-muted hover:text-primary",
                        pathname.startsWith(link.href)
                          ? "text-primary"
                          : "text-foreground"
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
              onClick={handleContactsClick}
              className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-primary"
            >
              Contacts
            </Link>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 pb-6">
          <ul className="flex flex-col gap-1 pt-4">
            <li>
              <Link
                href="/bio"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block py-2 text-sm tracking-wide",
                  pathname === "/bio"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Bio
              </Link>
            </li>
            <li>
              <button
                onClick={() => setWorkOpen(!workOpen)}
                className={cn(
                  "flex items-center gap-1 py-2 text-sm tracking-wide w-full text-left",
                  workLinks.some((l) => pathname.startsWith(l.href))
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Work
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    workOpen && "rotate-180"
                  )}
                />
              </button>
              {workOpen && (
                <ul className="flex flex-col gap-1 pl-4">
                  {workLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "block py-1.5 text-sm",
                          pathname.startsWith(link.href)
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <Link
                href="/#contacts"
                onClick={(e) => {
                  setMobileOpen(false)
                  handleContactsClick(e)
                }}
                className="block py-2 text-sm tracking-wide text-muted-foreground"
              >
                Contacts
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
