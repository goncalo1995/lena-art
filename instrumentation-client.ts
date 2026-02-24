// This file is kept as a compatibility entrypoint.
// Analytics must be consent-gated (EU/GDPR). Do not initialize PostHog here.

'use client'

import { initPosthog } from '@/lib/analytics/posthog'

export async function initAnalyticsIfConsented() {
  await initPosthog()
}