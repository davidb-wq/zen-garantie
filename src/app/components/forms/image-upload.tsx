'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, Loader2, ImageIcon, AlertTriangle } from 'lucide-react'
import { compressWarrantyImage } from '@/lib/image-compression'

interface ImageUploadProps {
  value: File | null
  onChange: (file: File | null) => void
  existingUrl?: string | null
}

export function ImageUpload({ value, onChange, existingUrl }: ImageUploadProps) {
  const [compressing, setCompressing] = useState(false)
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null)
  const [compressionError, setCompressionError] = useState<string | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (compressionError) {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
      errorTimerRef.current = setTimeout(() => setCompressionError(null), 30000)
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    }
  }, [compressionError])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setCompressionError(null)

    if (file.size > 20 * 1024 * 1024) {
      setCompressionError('IMAGE_TOO_LARGE')
      e.target.value = ''
      return
    }

    setCompressing(true)
    try {
      const compressed = await compressWarrantyImage(file)
      const objectUrl = URL.createObjectURL(compressed)
      setPreview(objectUrl)
      onChange(compressed)
    } catch {
      setCompressionError('MEMORY_ERROR')
      onChange(null)
      e.target.value = ''
    } finally {
      setCompressing(false)
    }
  }

  function handleRemove() {
    setPreview(null)
    onChange(null)
    setCompressionError(null)
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    if (cameraRef.current) cameraRef.current.value = ''
    if (galleryRef.current) galleryRef.current.value = ''
  }

  if (preview) {
    return (
      <div className="relative w-full">
        <img
          src={preview}
          alt="Aperçu de la facture"
          className="w-full max-h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
        />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1 bg-slate-900/70 dark:bg-white/20 rounded-full text-white hover:bg-slate-900/90 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Bouton caméra : capture="environment" ouvre directement l'appareil photo */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      {/* Bouton galerie : sans capture, ouvre les fichiers/photos */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {compressing ? (
        <div className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Compression en cours…</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs font-medium">Prendre une photo</span>
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Choisir un fichier</span>
          </button>
        </div>
      )}
      {compressionError && (
        <div className="mt-2 flex gap-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-3 py-3 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            {compressionError === 'MEMORY_ERROR' ? (
              <>
                <p className="font-medium mb-1">Impossible de traiter l&apos;image — manque de mémoire.</p>
                <p>Pour régler le problème :</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Fermez quelques applications ouvertes en arrière-plan</li>
                  <li>Redémarrez votre navigateur et réessayez</li>
                  <li>Ou utilisez <strong>« Choisir un fichier »</strong> pour sélectionner une photo depuis votre galerie</li>
                </ul>
              </>
            ) : (
              <p>Image trop volumineuse (max 20 Mo). Choisissez une photo plus petite.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
