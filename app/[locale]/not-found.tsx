import { Link } from "@/i18n/navigation"
import { Brush, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
            <Brush className="relative size-16 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="font-serif text-6xl font-light tracking-tight text-foreground sm:text-7xl">
          404
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          Página não encontrada
        </p>
        <p className="mt-2 text-sm text-muted-foreground/70">
          A página que procura não existe ou foi movida.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Home className="size-4" />
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  )
}
