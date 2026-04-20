'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Shield, X } from 'lucide-react'

interface PolicyBannerProps {
  acceptAction: () => Promise<void>
}

export function PolicyBanner({ acceptAction }: PolicyBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (dismissed) return null

  function handleAccept() {
    startTransition(async () => {
      await acceptAction()
      setDismissed(true)
    })
  }

  return (
    <div className="fixed left-0 right-0 max-w-md mx-auto px-3 z-50"
      style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))' }}
    >
      <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl shadow-lg px-4 py-3.5 flex items-start gap-3">
        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400 dark:text-emerald-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">
            Notre{' '}
            <Link href="/confidentialite" className="underline underline-offset-2 hover:opacity-80">
              politique de confidentialité
            </Link>{' '}
            a été mise à jour.
          </p>
          <p className="text-xs mt-0.5 opacity-70">
            Consultez les changements avant de continuer.
          </p>
        </div>
        <button
          onClick={handleAccept}
          disabled={isPending}
          className="flex-shrink-0 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  )
}
