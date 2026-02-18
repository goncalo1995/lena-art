import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-serif text-2xl text-foreground">
          Authentication Error
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Something went wrong during authentication. The link may have expired
          or already been used. Please try again.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild>
            <Link href="/auth/login">Try Again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
