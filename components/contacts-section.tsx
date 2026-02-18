import { Mail, Phone, Instagram } from "lucide-react"

export function ContactsSection() {
  return (
    <section id="contacts" className="py-16">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-serif text-2xl text-foreground md:text-3xl">
          Get in Touch
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          For commissions, collaborations or just to say hello.
        </p>

        <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
          <a
            href="mailto:helena@helenacolaco.com"
            className="flex items-center gap-3 text-sm text-foreground transition-colors hover:text-primary"
          >
            <Mail className="size-5 text-primary" />
            helena@helenacolaco.com
          </a>
          <a
            href="tel:+351912345678"
            className="flex items-center gap-3 text-sm text-foreground transition-colors hover:text-primary"
          >
            <Phone className="size-5 text-primary" />
            +351 912 345 678
          </a>
          <a
            href="https://instagram.com/helenacolaco"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-foreground transition-colors hover:text-primary"
          >
            <Instagram className="size-5 text-primary" />
            @helenacolaco
          </a>
        </div>
      </div>
    </section>
  )
}
