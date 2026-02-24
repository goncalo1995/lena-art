'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { getAnalyticsConsent, initPosthog, setAnalyticsConsent } from '@/lib/analytics/posthog'

export function CookieConsentBanner() {
  const t = useTranslations('Pages.cookieConsent')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = getAnalyticsConsent()
    setVisible(consent === null)
    if (consent === 'accepted') {
      void initPosthog()
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-6xl px-4 pb-4">
        <div className="rounded-xl border bg-background/95 backdrop-blur-md p-4 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-foreground/90">
              <p className="font-medium">{t('title')}</p>
              <p className="text-muted-foreground mt-1">
                {t('description')}{' '}
                <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-primary">
                  {t('privacyLink')}
                </Link>
              </p>
            </div>

            <div className="flex gap-2 md:shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setAnalyticsConsent('rejected')
                  setVisible(false)
                }}
              >
                {t('reject')}
              </Button>
              <Button
                onClick={async () => {
                  setAnalyticsConsent('accepted')
                  setVisible(false)
                  await initPosthog()
                }}
              >
                {t('accept')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
