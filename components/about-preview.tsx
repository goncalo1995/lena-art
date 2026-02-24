import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { getTranslations } from "next-intl/server"

export async function AboutPreview() {
  const t = await getTranslations("Pages.home")
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h2 className="font-serif text-3xl text-foreground md:text-4xl text-balance">
        {t("aboutTitle")}
      </h2>
      <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
        {t("aboutDescription")}
      </p>
      <Button asChild className="mt-8" variant="outline" size="lg">
        <Link href="/bio">{t("viewBio")}</Link>
      </Button>
    </section>
  )
}
