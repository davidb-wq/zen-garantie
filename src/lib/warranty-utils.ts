import type { Warranty, WarrantyStatus } from '@/types/warranty'

export function getExpiryDate(warranty: Warranty): Date | null {
  if (warranty.warranty_months === -1) return null
  const date = new Date(warranty.purchase_date)
  date.setMonth(date.getMonth() + warranty.warranty_months)
  return date
}

export function getDaysUntilExpiry(warranty: Warranty): number | null {
  const expiry = getExpiryDate(warranty)
  if (!expiry) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - today.getTime()) / 86400000)
}

export function getWarrantyStatus(warranty: Warranty): WarrantyStatus {
  if (warranty.warranty_months === -1) return 'lifetime'
  const days = getDaysUntilExpiry(warranty)!
  if (days < 0) return 'expired'
  if (days <= 90) return 'expiring-soon'
  return 'active'
}

export const STATUS_BORDER: Record<WarrantyStatus, string> = {
  lifetime: 'border-l-warranty-lifetime',
  active: 'border-l-warranty-safe',
  'expiring-soon': 'border-l-warranty-warning',
  expired: 'border-l-warranty-danger',
}

export const STATUS_TEXT: Record<WarrantyStatus, string> = {
  lifetime: 'text-warranty-lifetime',
  active: 'text-warranty-safe',
  'expiring-soon': 'text-warranty-warning',
  expired: 'text-warranty-danger',
}

export const STATUS_BG: Record<WarrantyStatus, string> = {
  lifetime: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
  active: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400',
  'expiring-soon': 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  expired: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400',
}

export function formatExpiryText(warranty: Warranty): string {
  if (warranty.warranty_months === -1) return 'Garantie à vie'
  const days = getDaysUntilExpiry(warranty)!
  if (days < 0) return `Expirée il y a ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}`
  if (days === 0) return 'Expire aujourd\'hui'
  if (days === 1) return 'Expire demain'
  return `Expire dans ${days} jour${days > 1 ? 's' : ''}`
}

export function formatExpiryDate(warranty: Warranty): string {
  const expiry = getExpiryDate(warranty)
  if (!expiry) return 'À vie'
  return expiry.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function warrantyDurationOptions(): Array<{ label: string; months: number }> {
  return [
    { label: '6 mois', months: 6 },
    { label: '1 an', months: 12 },
    { label: '2 ans', months: 24 },
    { label: '3 ans', months: 36 },
    { label: '5 ans', months: 60 },
    { label: '10 ans', months: 120 },
    { label: 'À vie', months: -1 },
  ]
}
