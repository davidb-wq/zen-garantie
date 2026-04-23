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

export function ImageCropModal({ file, onConfirm, onCancel }: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [processing, setProcessing] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImageSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleConfirm = useCallback(async () => {
    const img = imgRef.current
    if (!img || !completedCrop) return

    setProcessing(true)
    try {
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

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/webp', 0.92),
      )
      if (!blob) return

      const croppedFile = new File([blob], 'invoice.webp', { type: 'image/webp' })
      const compressed = await compressWarrantyImage(croppedFile)
      onConfirm(compressed)
    } finally {
      setProcessing(false)
    }
  }, [completedCrop, onConfirm])

  // Si l'utilisateur confirme sans dessiner de zone, on passe le fichier entier
  const handleConfirmWithoutCrop = useCallback(async () => {
    setProcessing(true)
    try {
      const compressed = await compressWarrantyImage(file)
      onConfirm(compressed)
    } finally {
      setProcessing(false)
    }
  }, [file, onConfirm])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="text-sm text-white/70 hover:text-white transition-colors py-2 pr-4"
        >
          Annuler
        </button>
        <p className="text-sm text-white/50">Recadrer la facture</p>
        <button
          type="button"
          onClick={completedCrop ? handleConfirm : handleConfirmWithoutCrop}
          disabled={processing}
          className="flex items-center gap-1.5 text-sm font-medium text-white bg-white/15 hover:bg-white/25 transition-colors rounded-full px-4 py-1.5 disabled:opacity-50"
        >
          {processing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Traitement…</span>
            </>
          ) : (
            <span>{completedCrop ? 'Recadrer' : 'Utiliser telle quelle'}</span>
          )}
        </button>
      </div>

      {/* Crop area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
        {imageSrc && (
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            style={{ maxHeight: 'calc(100dvh - 3.5rem)', maxWidth: '100%' }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Photo à recadrer"
              style={{
                maxHeight: 'calc(100dvh - 3.5rem - 1rem)',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          </ReactCrop>
        )}
      </div>

      {/* Hint */}
      {!completedCrop && (
        <p className="text-center text-xs text-white/40 pb-4 shrink-0">
          Dessinez un rectangle pour recadrer, ou confirmez sans recadrer
        </p>
      )}
    </div>
  )
}
