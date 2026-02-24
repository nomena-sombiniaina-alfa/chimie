import { create } from 'zustand'
import { api } from '../api/client'
import type { UnitListItem, UnitDetail, SIConstant } from '../types'

interface UnitsState {
  units: UnitListItem[]
  constants: SIConstant[]
  loaded: boolean
  error: string | null

  selectedSlug: string
  currentDetail: UnitDetail | null
  detailLoading: boolean

  search: string
  showConstants: boolean

  loadAll: () => Promise<void>
  selectUnit: (slug: string) => Promise<void>
  setSearch: (s: string) => void
  toggleConstants: () => void
}

export const useUnitsStore = create<UnitsState>((set) => ({
  units: [],
  constants: [],
  loaded: false,
  error: null,

  selectedSlug: 'metre',
  currentDetail: null,
  detailLoading: false,

  search: '',
  showConstants: false,

  loadAll: async () => {
    try {
      const [units, constants] = await Promise.all([
        api.listUnits(),
        api.listConstants(),
      ])
      set({ units, constants, loaded: true, error: null })
      // Auto-load default unit detail
      const detail = await api.getUnit('metre')
      set({ currentDetail: detail })
    } catch (e: any) {
      set({ error: String(e.message || e) })
    }
  },

  selectUnit: async (slug: string) => {
    set({ selectedSlug: slug, detailLoading: true })
    try {
      const detail = await api.getUnit(slug)
      set({ currentDetail: detail, detailLoading: false })
    } catch (e: any) {
      set({ error: String(e.message || e), detailLoading: false })
    }
  },

  setSearch: (s: string) => set({ search: s }),
  toggleConstants: () => set((st) => ({ showConstants: !st.showConstants })),
}))
