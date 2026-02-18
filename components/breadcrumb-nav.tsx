import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  // Find the most recent link for the back button
  const backLink = [...items].reverse().find((item) => item.href)

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
      {backLink && (
        <Link
          href={backLink.href!}
          className="flex items-center gap-1 text-primary transition-colors hover:text-primary/80 mr-2"
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">Back</span>
        </Link>
      )}
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="size-3.5 text-border" />}
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
