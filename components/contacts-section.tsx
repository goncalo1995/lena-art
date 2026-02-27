import { Mail, Phone, Instagram } from "lucide-react"
import { getTranslations } from "next-intl/server"

export async function ContactsSection() {
  const t = await getTranslations("Pages.home")

  return (
    <section id="contacts" className="py-16">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-serif text-2xl text-foreground md:text-3xl">
          {t("contacts.title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("contacts.description")}
        </p>

        <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
          <a
            href="mailto:colaco.art@yahoo.com"
            className="flex items-center gap-3 text-sm text-foreground transition-colors hover:text-primary"
          >
            <Mail className="size-5 text-primary" />
            colaco.art@yahoo.com
          </a>
          <a
            href="tel:+351913846901"
            className="flex items-center gap-3 text-sm text-foreground transition-colors hover:text-primary"
          >
            <Phone className="size-5 text-primary" />
            +351 913 846 901
          </a>
          <a
            href="https://instagram.com/colaco_art"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-foreground transition-colors hover:text-primary"
          >
            <Instagram className="size-5 text-primary" />
            @colaco_art
          </a>
        </div>
      </div>
    </section>
  )
}
