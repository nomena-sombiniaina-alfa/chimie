import { create } from 'zustand'
import { api } from '../api/client'
import type { ReactionListItem, ReactionDetail } from '../types'

interface ReactionsState {
  reactions: ReactionListItem[]
  loaded: boolean
  error: string | null

  selectedSlug: string
  currentDetail: ReactionDetail | null
  detailLoading: boolean

  loadAll: () => Promise<void>
  selectReaction: (slug: string) => Promise<void>
}

const FIRST = 'combustion'

export const useReactionsStore = create<ReactionsState>((set) => ({
  reactions: [],
  loaded: false,
  error: null,
  selectedSlug: FIRST,
  currentDetail: null,
  detailLoading: false,

  loadAll: async () => {
    try {
      const reactions = await api.listReactions()
      set({ reactions, loaded: true, error: null })
      const detail = await api.getReaction(FIRST)
      set({ currentDetail: detail })
    } catch (e: any) {
      set({ error: String(e.message || e) })
    }
  },

  selectReaction: async (slug: string) => {
    set({ selectedSlug: slug, detailLoading: true })
    try {
      const detail = await api.getReaction(slug)
      set({ currentDetail: detail, detailLoading: false })
    } catch (e: any) {
      set({ error: String(e.message || e), detailLoading: false })
    }
  },
}))
