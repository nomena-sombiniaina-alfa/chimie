import { create } from 'zustand'
import { api } from '../api/client'
import type { ElementListItem, ElementDetail, Category, Source } from '../types'

interface AtomState {
  // Data loaded once
  elements: ElementListItem[]
  categories: Record<string, Category>
  sources: Source[]
  loaded: boolean
  error: string | null

  // Currently selected element (full detail)
  selectedZ: number
  currentDetail: ElementDetail | null
  detailLoading: boolean

  // Ion + isotope controls
  charge: number
  isotopeShift: number

  // UI state
  modalOpen: boolean
  filter: string
  search: string
  hoveredZ: number | null

  // Actions
  loadAll: () => Promise<void>
  selectElement: (Z: number) => Promise<void>
  closeModal: () => void
  addElectron: () => void
  removeElectron: () => void
  neutralize: () => void
  setIsotopeShift: (delta: number) => void
  setFilter: (f: string) => void
  setSearch: (s: string) => void
  setHovered: (Z: number | null) => void
}

export const useAtomStore = create<AtomState>((set, get) => ({
  elements: [],
  categories: {},
  sources: [],
  loaded: false,
  error: null,

  selectedZ: 6,
  currentDetail: null,
  detailLoading: false,

  charge: 0,
  isotopeShift: 0,

  modalOpen: false,
  filter: 'all',
  search: '',
  hoveredZ: null,

  loadAll: async () => {
    try {
      const [elements, categories, sources] = await Promise.all([
        api.listElements(),
        api.listCategories(),
        api.listSources(),
      ])
      const catMap: Record<string, Category> = {}
      for (const c of categories) catMap[c.code] = c
      set({ elements, categories: catMap, sources, loaded: true, error: null })
    } catch (e: any) {
      set({ error: String(e.message || e), loaded: false })
    }
  },

  selectElement: async (Z: number) => {
    set({ selectedZ: Z, charge: 0, isotopeShift: 0, modalOpen: true, detailLoading: true })
    try {
      const detail = await api.getElement(Z)
      set({ currentDetail: detail, detailLoading: false })
    } catch (e: any) {
      set({ error: String(e.message || e), detailLoading: false })
    }
  },

  closeModal: () => set({ modalOpen: false }),
  addElectron: () => {
    const { currentDetail, charge } = get()
    if (currentDetail && currentDetail.Z - (charge - 1) <= currentDetail.Z + 8) {
      set({ charge: charge - 1 })
    }
  },
  removeElectron: () => {
    const { currentDetail, charge } = get()
    if (currentDetail && currentDetail.Z - (charge + 1) >= 0) {
      set({ charge: charge + 1 })
    }
  },
  neutralize: () => set({ charge: 0 }),
  setIsotopeShift: (delta: number) => set({ isotopeShift: delta }),
  setFilter: (f: string) => set({ filter: f }),
  setSearch: (s: string) => set({ search: s }),
  setHovered: (Z: number | null) => set({ hoveredZ: Z }),
}))

// Selectors / helpers (à utiliser via useAtomStore.getState() ou avec un selector)
export function getElectronCount(detail: ElementDetail | null, charge: number): number {
  if (!detail) return 0
  return Math.max(0, detail.Z - charge)
}

export function getNeutrons(detail: ElementDetail | null, isotopeShift: number): number {
  if (!detail) return 0
  return Math.max(0, Math.round(detail.mass - detail.Z) + isotopeShift)
}
