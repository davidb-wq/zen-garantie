import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { WarrantyForm } from '@/app/components/forms/warranty-form'

export default function AddWarrantyPage() {
  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/warranties"
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Nouvelle garantie</h1>
      </div>

      <WarrantyForm />
    </div>
  )
}
