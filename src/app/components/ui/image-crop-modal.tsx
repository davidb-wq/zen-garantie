'use client'

import 'react-image-crop/dist/ReactCrop.css'
import { useState, useRef, useEffect, useCallback } from 'react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import { Loader2 } from 'lucide-react'
import { compressWarrantyImage } from '@/lib/image-compression'

interface ImageCropModalProps {
  file: File
  onConfirm: (cropped: File) => void
  onCancel: () => void
}

const FULL_CROP: Crop = { unit: '%', x: 2, y: 2, width: 96, height: 96 }

export function ImageCropModal({ file, onConfirm, onCancel }: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState('')
  const [crop, setCrop] = useState<Crop>(FULL_CROP)
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [processing, setProcessing] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImageSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function resetCrop() {
    setCrop(FULL_CROP)
  }

  const handleConfirm = useCallback(async () => {
    const img = imgRef.current
    setProcessing(true)
    try {
      if (!completedCrop || completedCrop.width === 0 || !img) {
        onConfirm(await compressWarrantyImage(file))
        return
      }

      const scaleX = img.naturalWidth / img.width
      const scaleY = img.naturalHeight / img.height

      const canvas = document.createElement('canvas')
      canvas.width = completedCrop.width * scaleX
      canvas.height = completedCrop.height * scaleY

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(
        img,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height,
      )

      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.92))
      if (!blob) return

      const croppedFile = new File([blob], 'invoice.webp', { type: 'image/webp' })
      onConfirm(await compressWarrantyImage(croppedFile))
    } finally {
      setProcessing(false)
    }
  }, [completedCrop, file, onConfirm])

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="text-sm text-white/60 hover:text-white transition-colors py-2 pr-4"
        >
          Annuler
        </button>
        <p className="text-sm font-medium text-white">Recadrer</p>
        <div className="w-16" />
      </div>

      {/* Zone image */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
        {imageSrc && (
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            style={{ maxHeight: 'calc(100dvh - 8rem)', maxWidth: '100%' }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Photo à recadrer"
              style={{
                maxHeight: 'calc(100dvh - 9rem)',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          </ReactCrop>
        )}
      </div>

      {/* Bas : instruction + actions */}
      <div className="shrink-0 px-4 pb-6 pt-3 space-y-3">
        <p className="text-center text-xs text-white/60">
          Déplacez les coins bleus pour encadrer votre facture
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetCrop}
            disabled={processing}
            className="flex-1 py-3 rounded-xl border border-white/20 text-sm text-white/70 hover:bg-white/10 transition-colors"
          >
            Tout sélectionner
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing}
            className="flex-1 py-3 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Traitement…
              </>
            ) : (
              'Confirmer'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
