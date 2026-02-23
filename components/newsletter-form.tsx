"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { subscribeNewsletter } from "@/lib/actions"

export function NewsletterForm() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [message, setMessage] = useState("")
  const locale = useLocale()

  async function handleSubmit(formData: FormData) {
    setStatus("loading")
    const result = await subscribeNewsletter(formData)
    if (result.error) {
      setStatus("error")
      let message = ""
      if (result.error === "missingFields") {
        message = locale === "pt" ? "O nome e email são obrigatórios" : "Name and email are required"
      } else if (result.error === "emailInUse") {
        message = locale === "pt" ? "Este email já está inscrito" : "This email is already subscribed"
      } else {
        message = result.error
      }
      setMessage(message)
    } else {
      setStatus("success")
      const message =
        locale === "pt" ? "Obrigado e até breve!" : "Thank you for subscribing!"
      setMessage(message)
    }
  }

  return (
    <section className="bg-secondary/50 py-16">
      <div className="mx-auto max-w-xl px-6 text-center">
        <h2 className="font-serif text-2xl text-foreground md:text-3xl">
          Stay in Touch
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Subscribe to receive occasional updates about new work, exhibitions
          and writings.
        </p>

        {status === "success" ? (
          <p className="mt-8 text-sm text-accent">{message}</p>
        ) : (
          <form action={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Input
              name="name"
              placeholder="Your name"
              required
              className="bg-background"
            />
            <Input
              name="email"
              type="email"
              placeholder="Your email"
              required
              className="bg-background"
            />
            <Button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-sm text-destructive">{message}</p>
        )}
      </div>
    </section>
  )
}
