'use client'

import { useEffect, useRef, useState } from 'react'

interface BarcodeScannerModalProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScannerModal({ onScan, onClose }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasScanned = useRef(false)
  const [permissionError, setPermissionError] = useState(false)
  const [status, setStatus] = useState<'scanning' | 'loading' | 'success'>('scanning')

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let reader: any = null

    async function startScanner() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        if (cancelled) return

        reader = new BrowserMultiFormatReader()

        await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current!,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result: any, error: any) => {
            if (cancelled) return
            if (result && !hasScanned.current) {
              hasScanned.current = true
              setStatus('success')
              onScan(result.getText())
            }
            // Ignore errors silently — NotFoundException fires every frame when no barcode is visible
            void error
          }
        )
      } catch {
        if (!cancelled) setPermissionError(true)
      }
    }

    startScanner()

    return () => {
      cancelled = true
      try { reader?.reset() } catch { /* ignore */ }
    }
  }, [onScan])

  const statusText = {
    scanning: 'Pointez vers un code-barres…',
    loading: 'Lecture en cours…',
    success: 'Produit trouvé !',
  }[status]

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-white/60 hover:text-white transition-colors py-2 pr-4"
        >
          Annuler
        </button>
        <p className="text-sm font-medium text-white">Scanner un code-barres</p>
        <div className="w-16" />
      </div>

      {/* Zone vidéo */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Overlay de visée */}
        {!permissionError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-32 border-2 border-white rounded-xl opacity-80" />
          </div>
        )}

        {/* Erreur permission caméra */}
        {permissionError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-full max-w-xs rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">Accès à la caméra refusé</p>
              <p>Autorisez l&apos;accès à la caméra dans les paramètres de votre navigateur, puis réessayez.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold"
            >
              Fermer
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 pb-8 pt-4 text-center">
        <p className="text-sm text-white/60">{statusText}</p>
      </div>
    </div>
  )
}
