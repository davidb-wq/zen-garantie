'use client'

import { useState, useEffect } from 'react'
import { ZoomIn, X } from 'lucide-react'

interface ImageLightboxProps {
  src: string
  alt: string
}

export function ImageLightbox({ src, alt }: ImageLightboxProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-full group"
        aria-label="Voir la facture en plein écran"
      >
        <img
          src={src}
          alt={alt}
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 object-contain max-h-64"
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 group-hover:bg-black/20 group-active:bg-black/30 transition-colors">
          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/95"
            onClick={() => setOpen(false)}
          />
          <button
            type="button"
            className="fixed top-4 right-4 z-50 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain pointer-events-auto"
              style={{ touchAction: 'pinch-zoom' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </>
      )}
    </>
  )
}
