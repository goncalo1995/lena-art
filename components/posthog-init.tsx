'use client'

import { useEffect } from 'react'
import { initPosthog } from '@/lib/analytics/posthog'

export function PosthogInit() {
  useEffect(() => {
    void initPosthog()
  }, [])

  return null
}
