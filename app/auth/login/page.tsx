"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  )
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/admin`,
        },
      })
      if (error) {
        setStatus("error")
        setErrorMessage(error.message)
      } else {
        setStatus("sent")
      }
    } catch {
      setStatus("error")
      setErrorMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center font-serif text-2xl tracking-wide text-foreground mb-10"
        >
          Helena Colaco
        </Link>

        {status === "sent" ? (
          <div className="text-center">
            <h1 className="font-serif text-2xl text-foreground">
              Check your email
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A magic link has been sent to{" "}
              <span className="text-foreground">{email}</span>. Click the link
              in the email to sign in.
            </p>
            <Button
              variant="outline"
              className="mt-8"
              onClick={() => {
                setStatus("idle")
                setEmail("")
              }}
            >
              Try a different email
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-center font-serif text-2xl text-foreground">
              Admin Login
            </h1>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Enter your email to receive a magic link.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-card"
              />
              <Button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Sending..." : "Send Magic Link"}
              </Button>
            </form>

            {status === "error" && (
              <p className="mt-4 text-center text-sm text-destructive">
                {errorMessage}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
