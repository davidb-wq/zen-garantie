import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, ShieldOff } from 'lucide-react'
import { WarrantyCard } from '@/app/components/ui/warranty-card'
import { DashboardScanner } from '@/app/components/ui/dashboard-scanner'
import { getWarrantyStatus } from '@/lib/warranty-utils'
import type { Warranty, WarrantyStatus } from '@/types/warranty'

const STATUS_ORDER: WarrantyStatus[] = ['expiring-soon', 'active', 'lifetime', 'expired']

function sortWarranties(warranties: Warranty[]): Warranty[] {
  return [...warranties].sort((a, b) => {
    const statusA = STATUS_ORDER.indexOf(getWarrantyStatus(a))
    const statusB = STATUS_ORDER.indexOf(getWarrantyStatus(b))
    if (statusA !== statusB) return statusA - statusB
    return new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime()
  })
}

export default async function WarrantiesPage() {
  const supabase = await createClient()
  const { data: warranties } = await supabase
    .from('warranties')
    .select('*')
    .order('created_at', { ascending: false })

  const sorted = sortWarranties((warranties as Warranty[]) ?? [])

  const warrantiesWithImages = sorted.filter((w) => w.image_url)
  const storagePaths = warrantiesWithImages.map((w) =>
    w.image_url!.includes('/warranty-images/')
      ? w.image_url!.split('/warranty-images/')[1]
      : w.image_url!
  )
  const signedUrlMap = new Map<string, string>()
  if (storagePaths.length > 0) {
    const { data: signedData } = await supabase.storage
      .from('warranty-images')
      .createSignedUrls(storagePaths, 3600)
    signedData?.forEach((item, index) => {
      if (item.signedUrl) {
        signedUrlMap.set(warrantiesWithImages[index].id, item.signedUrl)
      }
    })
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mes garanties</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {sorted.length} produit{sorted.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/add"
          className="flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </Link>
      </div>

      <DashboardScanner />

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
            <ShieldOff className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Aucune garantie
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
            Commencez par ajouter la garantie d&apos;un de vos produits.
          </p>
          <Link
            href="/add"
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Ajouter ma première garantie
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((warranty) => (
            <WarrantyCard key={warranty.id} warranty={warranty} signedImageUrl={signedUrlMap.get(warranty.id) ?? null} />
          ))}
        </div>
      )}
    </div>
  )
}
