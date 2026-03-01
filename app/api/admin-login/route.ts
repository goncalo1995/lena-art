import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório." },
        { status: 400 }
      )
    }

    // 🔒 Lista protegida no servidor
    const allowedEmails = ["goncalo.ribeiro.pereira@gmail.com", "colaco.art@yahoo.com"]

    if (!allowedEmails.includes(email)) {
      return NextResponse.json(
        { error: "Acesso negado." },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/pt/admin`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in admin-login route:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    )
  }
}
