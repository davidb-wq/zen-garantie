'use client'

import { X, ExternalLink } from 'lucide-react'
import type { BarcodeResult } from '@/types/barcode'

interface ProductResultCardProps {
  product: BarcodeResult
  onDismiss: () => void
}

export function ProductResultCard({ product, onDismiss }: ProductResultCardProps) {
  if (!product.found) {
    return (
      <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 relative">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
        <p className="text-sm text-slate-500 dark:text-slate-400 pr-6">
          Produit non trouvé pour ce code-barres.
        </p>
      </div>
    )
  }

  const searchQuery = encodeURIComponent(`${product.name ?? ''} garantie fabricant`)

  return (
    <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 relative">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="pr-6 mb-3">
        {product.name && (
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{product.name}</p>
        )}
        {(product.brand || product.model) && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {[product.brand, product.model].filter(Boolean).join(' — ')}
          </p>
        )}
        {product.description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
      </div>

      <a
        href={`https://www.google.com/search?q=${searchQuery}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Rechercher la garantie fabricant
      </a>
    </div>
  )
}
