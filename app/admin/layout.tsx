import Link from "next/link"
import {
  LayoutDashboard,
  Image as ImageIcon,
  FolderOpen,
  ArrowLeft,
} from "lucide-react"
import { AdminSignOut } from "@/components/admin-sign-out"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-6 md:flex">
        <Link
          href="/admin"
          className="font-serif text-lg tracking-wide text-sidebar-foreground mb-8"
        >
          Admin Panel
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          <SidebarLink
            href="/admin"
            icon={<LayoutDashboard className="size-4" />}
            label="Dashboard"
          />
          <SidebarLink
            href="/admin/artworks"
            icon={<ImageIcon className="size-4" />}
            label="Artworks"
          />
          <SidebarLink
            href="/admin/collections"
            icon={<FolderOpen className="size-4" />}
            label="Collections"
          />
        </nav>
        <div className="flex flex-col gap-2 mt-auto pt-6 border-t border-sidebar-border">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            View Site
          </Link>
          <AdminSignOut />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 md:hidden">
          <Link
            href="/admin"
            className="font-serif text-lg tracking-wide text-sidebar-foreground"
          >
            Admin
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/admin/artworks" className="text-sm text-sidebar-foreground">
              Artworks
            </Link>
            <Link href="/admin/collections" className="text-sm text-sidebar-foreground">
              Collections
            </Link>
            <Link href="/" className="text-sm text-sidebar-foreground/70">
              Site
            </Link>
          </nav>
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}

function SidebarLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      {icon}
      {label}
    </Link>
  )
}
