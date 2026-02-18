import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

interface ArtworkCardProps {
  title: string
  shortDescription: string | null
  coverImageUrl: string | null
  href: string
  isPoem?: boolean
  badge?: string
  className?: string
}

export function ArtworkCard({
  title,
  shortDescription,
  coverImageUrl,
  href,
  isPoem = false,
  badge,
  className,
}: ArtworkCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md",
        className
      )}
    >
      {isPoem ? (
        <div className="flex h-48 items-center justify-center bg-secondary/60 px-6">
          <p className="font-serif text-lg leading-relaxed text-foreground/80 line-clamp-4 text-center italic">
            {shortDescription}
          </p>
        </div>
      ) : (
        <div className="relative h-56 overflow-hidden bg-muted">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 80vw, 320px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {badge && (
            <span className="absolute top-3 left-3 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-serif text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {title}
        </h3>
        {!isPoem && shortDescription && (
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {shortDescription}
          </p>
        )}
      </div>
    </Link>
  )
}
