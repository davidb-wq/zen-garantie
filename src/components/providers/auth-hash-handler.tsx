'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Gère le flux d'authentification par fragment d'URL (#access_token=...).
 * Se produit quand Supabase redirige vers la racine du site plutôt que
 * vers /auth/callback (URL non autorisée dans le dashboard Supabase).
 * Le SDK détecte automatiquement le token dans window.location.hash et
 * déclenche l'événement SIGNED_IN → on redirige vers /warranties.
 */
export function AuthHashHandler() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/warranties')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return null
}
