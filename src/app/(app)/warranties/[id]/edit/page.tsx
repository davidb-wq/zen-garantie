import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { WarrantyForm } from '@/app/components/forms/warranty-form'
import type { Warranty } from '@/types/warranty'

export default async function EditWarrantyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: warranty } = await supabase
    .from('warranties')
    .select('*')
    .eq('id', id)
    .single()

  if (!warranty) notFound()

  const w = warranty as Warranty

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/warranties/${id}`}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Modifier</h1>
      </div>

      <WarrantyForm
        defaultValues={w}
        warrantyId={w.id}
        userId={w.user_id}
      />
    </div>
  )
}
