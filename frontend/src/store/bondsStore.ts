import { create } from 'zustand'
import { api } from '../api/client'
import type { BondListItem, BondDetail } from '../types'

interface BondsState {
  bonds: BondListItem[]
  loaded: boolean
  error: string | null

  selectedSlug: string
  currentDetail: BondDetail | null
  detailLoading: boolean

  loadAll: () => Promise<void>
  selectBond: (slug: string) => Promise<void>
}

const FIRST = 'ionic'

export const useBondsStore = create<BondsState>((set) => ({
  bonds: [],
  loaded: false,
  error: null,
  selectedSlug: FIRST,
  currentDetail: null,
  detailLoading: false,

  loadAll: async () => {
    try {
      const bonds = await api.listBonds()
      set({ bonds, loaded: true, error: null })
      const detail = await api.getBond(FIRST)
      set({ currentDetail: detail })
    } catch (e: any) {
      set({ error: String(e.message || e) })
    }
  },

  selectBond: async (slug: string) => {
    set({ selectedSlug: slug, detailLoading: true })
    try {
      const detail = await api.getBond(slug)
      set({ currentDetail: detail, detailLoading: false })
    } catch (e: any) {
      set({ error: String(e.message || e), detailLoading: false })
    }
  },
}))
