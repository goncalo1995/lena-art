"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  )
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus("error")
        setErrorMessage(data.error || "Erro ao enviar o link.")
        return
      }

      setStatus("sent")
    } catch (err) {
      console.error("Erro:", err)
      setStatus("error")
      setErrorMessage("Ocorreu um erro. Por favor, tenta novamente.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center font-serif text-2xl tracking-wide text-foreground mb-10"
        >
          Helena Colaço
        </Link>

        {status === "sent" ? (
          <div className="text-center">
            <h1 className="font-serif text-2xl text-foreground">
              Verifica o teu email
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Um link mágico foi enviado para{" "}
              <span className="text-foreground">{email}</span>. Clica no link
              no email para fazer login.
            </p>
            <Button
              variant="outline"
              className="mt-8"
              onClick={() => {
                setStatus("idle")
                setEmail("")
              }}
            >
              Tentar outro email
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-center font-serif text-2xl text-foreground">
              Login de Administrador
            </h1>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Introduz o teu email para validar que és mesmo tu!
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
                {status === "loading" ? "A enviar email..." : "Entrar"}
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
