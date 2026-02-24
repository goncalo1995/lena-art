'use client'

export const ANALYTICS_CONSENT_COOKIE = 'cookie_consent_analytics'
export type AnalyticsConsentValue = 'accepted' | 'rejected'

export function getAnalyticsConsent(): AnalyticsConsentValue | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';').map((c) => c.trim())
  const match = cookies.find((c) => c.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`))
  if (!match) return null
  const value = decodeURIComponent(match.split('=').slice(1).join('='))
  if (value === 'accepted' || value === 'rejected') return value
  return null
}

export function setAnalyticsConsent(value: AnalyticsConsentValue, maxAgeDays = 180) {
  if (typeof document === 'undefined') return
  const maxAge = maxAgeDays * 24 * 60 * 60
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
}

let initialized = false

export async function initPosthog() {
  if (initialized) return
  if (typeof window === 'undefined') return

  const consent = getAnalyticsConsent()
  if (consent !== 'accepted') {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[PostHog] Not initialized: analytics consent not accepted')
    }
    return
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!key || !host) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[PostHog] Not initialized: NEXT_PUBLIC_POSTHOG_KEY/HOST missing')
    }
    return
  }

  const { default: posthog } = await import('posthog-js')

  posthog.init(key, {
    api_host: host,
    // Keep it minimal / GDPR-friendly:
    // - no autocapture settings here
    // - do not identify users automatically
    // - do not enable session recording unless explicitly needed
    capture_pageview: true,
    capture_pageleave: true,
  })

  initialized = true
}
