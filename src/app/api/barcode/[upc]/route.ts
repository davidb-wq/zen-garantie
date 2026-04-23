import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { BarcodeResult } from '@/types/barcode'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ upc: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { upc } = await params
  if (!upc || !/^\d{6,14}$/.test(upc)) {
    return NextResponse.json({ found: false } satisfies BarcodeResult)
  }

  try {
    const upcRes = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 },
    })

    if (upcRes.ok) {
      const data = await upcRes.json()
      const item = data?.items?.[0]
      if (item) {
        const result: BarcodeResult = {
          found: true,
          name: item.title || undefined,
          brand: item.brand || undefined,
          model: item.model || undefined,
          description: item.description || undefined,
        }
        return NextResponse.json(result, {
          headers: { 'Cache-Control': 'public, max-age=86400' },
        })
      }
    }

    // Fallback : Open Food Facts (pour les produits alimentaires)
    const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${upc}.json`, {
      next: { revalidate: 86400 },
    })

    if (offRes.ok) {
      const offData = await offRes.json()
      if (offData?.status === 1 && offData?.product) {
        const p = offData.product
        const result: BarcodeResult = {
          found: true,
          name: p.product_name || p.product_name_fr || undefined,
          brand: p.brands || undefined,
          model: undefined,
          description: p.categories || undefined,
        }
        return NextResponse.json(result, {
          headers: { 'Cache-Control': 'public, max-age=86400' },
        })
      }
    }
  } catch {
    // Retourne found: false silencieusement
  }

  return NextResponse.json({ found: false } satisfies BarcodeResult)
}
