// Types miroirs des sérialiseurs DRF côté backend.

export interface Category {
  code: string
  label: string
  color: string
}

export interface ElementListItem {
  Z: number
  symbol: string
  nameFR: string
  mass: number
  category: string
  category_color: string
  period: number
  group: number | null
  block: 's' | 'p' | 'd' | 'f'
  color: string
  state: 'solid' | 'liquid' | 'gas' | 'synthetic'
}

export interface ElementDescription {
  occurrence: string
  specificity: string
  uses: string[]
  role: string
}

export interface ElementDetail {
  Z: number
  symbol: string
  nameFR: string
  mass: number
  category: Category
  period: number
  group: number | null
  block: 's' | 'p' | 'd' | 'f'
  electronegativity: number | null
  atomicRadius: number | null
  ionizationEnergy: number | null
  density: number | null
  year: number | null
  color: string
  state: string
  description: ElementDescription
  validCharges: number[]
  ionizationEnergies: number[]
  electronAffinity: number | null
}

export interface Source {
  code: string
  label: string
  url: string
  note: string
  verifies: string[]
}

// Unités
export interface UnitListItem {
  slug: string
  symbol: string
  name: string
  quantity: string
  group: 'base' | 'derived' | 'accepted'
}

export interface FormulaLegendItem {
  symbol: string
  description: string
}

export interface HistoryItem {
  year: number
  text: string
}

export interface Conversion {
  from: string
  to: string
}

export interface UnitDetail extends UnitListItem {
  definition: string
  formula: string
  formulaLegend: FormulaLegendItem[]
  history: HistoryItem[]
  conversions: Conversion[]
  pitfalls: string[]
}

export interface SIConstant {
  slug: string
  symbol: string
  value: string
  name: string
  defines: string
}

// Configuration électronique calculée côté client
export type Subshell = string  // ex: "1s", "2p", "3d"
export type ConfigEntry = [Subshell, number]
export interface ShortConfig {
  core: string | null
  tail: ConfigEntry[]
}
