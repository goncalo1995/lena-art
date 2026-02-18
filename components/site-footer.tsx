import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 md:flex-row md:justify-between">
        <Link
          href="/"
          className="font-serif text-lg tracking-wide text-foreground"
        >
          Helena Colaco
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/bio"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Bio
          </Link>
          <Link
            href="/drawings"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Drawings
          </Link>
          <Link
            href="/paintings"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Paintings
          </Link>
          <Link
            href="/photography"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Photography
          </Link>
          <Link
            href="/poems"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Poems
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          {new Date().getFullYear()} Helena Colaco. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
