import { getWarrantyStatus, formatExpiryText, STATUS_BG } from '@/lib/warranty-utils'
import type { Warranty } from '@/types/warranty'

export function ExpiryBadge({ warranty }: { warranty: Warranty }) {
  const status = getWarrantyStatus(warranty)
  const text = formatExpiryText(warranty)

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BG[status]}`}>
      {text}
    </span>
  )
}
