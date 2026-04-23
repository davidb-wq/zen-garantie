export type WarrantyLikelihood = 'probable' | 'peu_probable' | 'inconnue'

export interface BarcodeResult {
  found: boolean
  name?: string
  brand?: string
  model?: string
  warrantyLikelihood?: WarrantyLikelihood
  warrantyMessage?: string
}
